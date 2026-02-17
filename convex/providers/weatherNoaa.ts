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
}

// NOAA is free — no cost per request
const COST_PER_REQUEST = 0;

export const fetchForecast = internalAction({
  args: {
    lat: v.number(),
    lon: v.number(),
    targetTime: v.number(), // epoch ms
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args): Promise<WeatherForecastPoint> => {
    // Step 1: Get the forecast grid URL from points endpoint
    const pointsUrl = `https://api.weather.gov/points/${args.lat.toFixed(4)},${args.lon.toFixed(4)}`;
    const pointsRes = await fetch(pointsUrl, {
      headers: { "User-Agent": "(outia.app, support@outia.app)" },
    });

    if (!pointsRes.ok) {
      throw new Error(`NOAA points API error ${pointsRes.status}`);
    }

    const pointsData = await pointsRes.json();
    const forecastHourlyUrl = pointsData.properties?.forecastHourly;
    if (!forecastHourlyUrl) {
      throw new Error("No hourly forecast URL from NOAA");
    }

    // Step 2: Get hourly forecast
    const forecastRes = await fetch(forecastHourlyUrl, {
      headers: { "User-Agent": "(outia.app, support@outia.app)" },
    });

    if (!forecastRes.ok) {
      throw new Error(`NOAA forecast API error ${forecastRes.status}`);
    }

    const forecastData = await forecastRes.json();
    const periods = forecastData.properties?.periods ?? [];

    // Step 3: Find the closest period to target time
    const targetDate = new Date(args.targetTime);
    let closest = periods[0];
    let minDiff = Infinity;

    for (const period of periods) {
      const periodTime = new Date(period.startTime).getTime();
      const diff = Math.abs(periodTime - args.targetTime);
      if (diff < minDiff) {
        minDiff = diff;
        closest = period;
      }
    }

    if (!closest) {
      throw new Error("No forecast periods available from NOAA");
    }

    // Log API usage
    await ctx.runMutation(internal.apiUsage.log, {
      provider: "noaa",
      endpoint: "forecastHourly",
      estimatedCostUsd: COST_PER_REQUEST,
      tripId: args.tripId,
    });

    // Convert NOAA data to our format
    const tempCelsius =
      closest.temperatureUnit === "F"
        ? ((closest.temperature - 32) * 5) / 9
        : closest.temperature;

    const windSpeedKmh = parseWindSpeed(closest.windSpeed);

    return {
      conditionCode: mapNoaaCondition(closest.shortForecast),
      precipProb: closest.probabilityOfPrecipitation?.value ?? 0,
      precipIntensity: estimateIntensity(closest.shortForecast),
      tempCelsius: Math.round(tempCelsius * 10) / 10,
      windSpeedKmh,
    };
  },
});

function parseWindSpeed(windStr: string): number {
  // NOAA returns "15 mph" or "10 to 20 mph"
  const match = windStr?.match(/(\d+)/);
  if (!match) return 0;
  const mph = parseInt(match[1], 10);
  return Math.round(mph * 1.60934);
}

function mapNoaaCondition(forecast: string): string {
  const lower = forecast?.toLowerCase() ?? "";
  if (lower.includes("thunder")) return "thunderstorm";
  if (lower.includes("snow") || lower.includes("blizzard")) return "snow";
  if (lower.includes("ice") || lower.includes("freezing")) return "ice";
  if (lower.includes("heavy rain")) return "heavy_rain";
  if (lower.includes("rain") || lower.includes("showers")) return "rain";
  if (lower.includes("drizzle")) return "drizzle";
  if (lower.includes("fog")) return "fog";
  if (lower.includes("cloud") || lower.includes("overcast")) return "cloudy";
  if (lower.includes("partly")) return "partly_cloudy";
  if (lower.includes("clear") || lower.includes("sunny")) return "clear";
  return "unknown";
}

function estimateIntensity(forecast: string): number {
  const lower = forecast?.toLowerCase() ?? "";
  if (lower.includes("heavy")) return 8;
  if (lower.includes("thunder")) return 10;
  if (lower.includes("moderate")) return 4;
  if (lower.includes("light") || lower.includes("drizzle")) return 1;
  if (lower.includes("rain") || lower.includes("showers")) return 3;
  if (lower.includes("snow")) return 3;
  return 0;
}
