"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export interface WeatherForecastPoint {
  conditionCode: string;
  precipProb: number;
  precipIntensity: number;
  tempCelsius: number;
  windSpeedKmh: number;
  alertType?: string;
  alertSeverity?: "minor" | "moderate" | "severe" | "extreme";
  uvIndex?: number;
  visibilityKm?: number;
  dewPointCelsius?: number;
  humidityPercent?: number;
  cloudCoverPercent?: number;
}

/**
 * Routes weather requests to NOAA (US) or OpenWeather (global).
 * Falls back to OpenWeather if NOAA fails for US coordinates.
 */
export const fetchWeatherForPoint = internalAction({
  args: {
    lat: v.number(),
    lon: v.number(),
    targetTime: v.number(),
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args): Promise<WeatherForecastPoint> => {
    const isUS = isInUS(args.lat, args.lon);

    if (isUS) {
      try {
        return await ctx.runAction(internal.providers.weatherNoaa.fetchForecast, {
          lat: args.lat,
          lon: args.lon,
          targetTime: args.targetTime,
          tripId: args.tripId,
        });
      } catch (err) {
        console.warn("NOAA failed, falling back to OpenWeather:", err);
        // Fall through to OpenWeather
      }
    }

    return await ctx.runAction(
      internal.providers.weatherOpenWeather.fetchForecast,
      {
        lat: args.lat,
        lon: args.lon,
        targetTime: args.targetTime,
        tripId: args.tripId,
      }
    );
  },
});

/**
 * Rough bounding box check for continental US + Alaska + Hawaii.
 */
function isInUS(lat: number, lon: number): boolean {
  // Continental US
  if (lat >= 24.5 && lat <= 49.5 && lon >= -125.0 && lon <= -66.5) return true;
  // Alaska
  if (lat >= 51.0 && lat <= 72.0 && lon >= -180.0 && lon <= -129.0) return true;
  // Hawaii
  if (lat >= 18.5 && lat <= 22.5 && lon >= -161.0 && lon <= -154.0) return true;
  return false;
}
