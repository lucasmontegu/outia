"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

/**
 * Fetches air quality data from the FREE OpenWeather Air Pollution API.
 * Returns AQI (1-5) where 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor.
 */
export const fetchAirQuality = internalAction({
  args: {
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, args): Promise<number | null> => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${args.lat}&lon=${args.lon}&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Air Pollution API error ${response.status}`);
      return null;
    }

    const data = await response.json();

    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openweather",
      endpoint: "air_pollution",
      estimatedCostUsd: 0,
    });

    return data.list?.[0]?.main?.aqi ?? null;
  },
});
