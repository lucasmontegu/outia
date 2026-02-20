"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export interface RouteResult {
  encodedPolyline: string;
  distanceMeters: number;
  durationSeconds: number;
  legs: RouteLeg[];
}

export interface RouteLeg {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  distanceMeters: number;
  durationSeconds: number;
}

const COST_PER_REQUEST = 0.005; // ~$5 per 1000 requests

export const computeRoute = internalAction({
  args: {
    originLat: v.number(),
    originLon: v.number(),
    destLat: v.number(),
    destLon: v.number(),
    stops: v.array(
      v.object({ lat: v.number(), lon: v.number() })
    ),
    departureTime: v.optional(v.string()),
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args): Promise<RouteResult> => {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_MAPS_API_KEY not set");

    const waypoints = args.stops.map((s) => ({
      location: {
        latLng: { latitude: s.lat, longitude: s.lon },
      },
    }));

    const body = {
      origin: {
        location: {
          latLng: { latitude: args.originLat, longitude: args.originLon },
        },
      },
      destination: {
        location: {
          latLng: { latitude: args.destLat, longitude: args.destLon },
        },
      },
      intermediates: waypoints.length > 0 ? waypoints : undefined,
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      departureTime: args.departureTime,
      computeAlternativeRoutes: true,
      polylineEncoding: "ENCODED_POLYLINE",
    };

    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Google Routes API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const route = data.routes?.[0];
    if (!route) throw new Error("No route found");

    // Log API usage
    await ctx.runMutation(internal.apiUsage.log, {
      provider: "google_routes",
      endpoint: "computeRoutes",
      estimatedCostUsd: COST_PER_REQUEST,
      tripId: args.tripId,
    });

    const legs: RouteLeg[] = (route.legs ?? []).map((leg: any) => ({
      startLat: leg.startLocation?.latLng?.latitude ?? args.originLat,
      startLon: leg.startLocation?.latLng?.longitude ?? args.originLon,
      endLat: leg.endLocation?.latLng?.latitude ?? args.destLat,
      endLon: leg.endLocation?.latLng?.longitude ?? args.destLon,
      distanceMeters: leg.distanceMeters ?? 0,
      durationSeconds: parseDuration(leg.duration),
    }));

    return {
      encodedPolyline: route.polyline?.encodedPolyline ?? "",
      distanceMeters: route.distanceMeters ?? 0,
      durationSeconds: parseDuration(route.duration),
      legs,
    };
  },
});

function parseDuration(duration: string | undefined): number {
  if (!duration) return 0;
  // Google returns "123s" format
  return parseInt(duration.replace("s", ""), 10) || 0;
}
