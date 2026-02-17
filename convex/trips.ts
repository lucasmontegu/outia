import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";
import { internal } from "./_generated/api";

export const create = mutation({
  args: {
    origin: v.object({
      lat: v.number(),
      lon: v.number(),
      address: v.optional(v.string()),
      placeId: v.optional(v.string()),
    }),
    destination: v.object({
      lat: v.number(),
      lon: v.number(),
      address: v.optional(v.string()),
      placeId: v.optional(v.string()),
    }),
    stops: v.array(
      v.object({
        lat: v.number(),
        lon: v.number(),
        address: v.optional(v.string()),
        placeId: v.optional(v.string()),
      })
    ),
    departureAt: v.number(),
    timezone: v.string(),
    savedRouteId: v.optional(v.id("saved_routes")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);

    const tripId = await ctx.db.insert("trips", {
      userId: user._id,
      origin: args.origin,
      destination: args.destination,
      stops: args.stops,
      departureAt: args.departureAt,
      timezone: args.timezone,
      status: "planning",
      savedRouteId: args.savedRouteId,
    });

    // Schedule the pipeline to compute route + weather
    await ctx.scheduler.runAfter(0, internal.tripPipeline.computeRouteAndWeather, {
      tripId,
    });

    return tripId;
  },
});

export const get = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== user._id) return null;

    const legs = await ctx.db
      .query("trip_legs")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const weatherPoints = await ctx.db
      .query("trip_weather_points")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();

    const aiSummary = await ctx.db
      .query("ai_summaries")
      .withIndex("byTripAndType", (q) =>
        q.eq("tripId", args.tripId).eq("analysisType", "trip_summary")
      )
      .first();

    const departureAnalysis = await ctx.db
      .query("ai_summaries")
      .withIndex("byTripAndType", (q) =>
        q.eq("tripId", args.tripId).eq("analysisType", "departure_analysis")
      )
      .first();

    return {
      ...trip,
      legs: legs.sort((a, b) => a.legIndex - b.legIndex),
      weatherPoints: weatherPoints.sort((a, b) => a.pointIndex - b.pointIndex),
      aiSummary,
      departureAnalysis,
    };
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("trips")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("trips")
      .withIndex("byUserIdAndStatus", (q) =>
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();
  },
});

export const updateDeparture = mutation({
  args: {
    tripId: v.id("trips"),
    departureAt: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== user._id) {
      throw new Error("Trip not found");
    }

    await ctx.db.patch(args.tripId, {
      departureAt: args.departureAt,
      status: "planning",
    });

    // Re-run pipeline with new departure time
    await ctx.scheduler.runAfter(0, internal.tripPipeline.computeRouteAndWeather, {
      tripId: args.tripId,
    });
  },
});

export const cancel = mutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== user._id) {
      throw new Error("Trip not found");
    }
    await ctx.db.patch(args.tripId, { status: "cancelled" });
  },
});

// Internal query for pipeline (no auth check)
export const getInternal = internalQuery({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tripId);
  },
});

// Internal query for cron handlers to list active trips
export const listActiveInternal = internalQuery({
  handler: async (ctx) => {
    return await ctx.db
      .query("trips")
      .withIndex("byStatus", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Internal mutation for pipeline to update trip after processing
export const updateFromPipeline = internalMutation({
  args: {
    tripId: v.id("trips"),
    overallRiskScore: v.number(),
    totalDistanceKm: v.number(),
    totalDurationSeconds: v.number(),
    encodedPolyline: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.tripId, {
      overallRiskScore: args.overallRiskScore,
      totalDistanceKm: args.totalDistanceKm,
      totalDurationSeconds: args.totalDurationSeconds,
      encodedPolyline: args.encodedPolyline,
      status: "active",
      lastWeatherFetchAt: Date.now(),
    });
  },
});
