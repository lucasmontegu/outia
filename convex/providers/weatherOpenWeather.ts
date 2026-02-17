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

// OpenWeather One Call 3.0: ~$0.0015 per request
const COST_PER_REQUEST = 0.0015;

export const fetchForecast = internalAction({
  args: {
    lat: v.number(),
    lon: v.number(),
    targetTime: v.number(), // epoch ms
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args): Promise<WeatherForecastPoint> => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");

    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${args.lat}&lon=${args.lon}&exclude=minutely,daily&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather API error ${response.status}`);
    }

    const data = await response.json();

    // Log API usage
    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openweather",
      endpoint: "onecall",
      estimatedCostUsd: COST_PER_REQUEST,
      tripId: args.tripId,
    });

    // Find closest hourly forecast to target time
    const hourly = data.hourly ?? [];
    const targetSec = Math.floor(args.targetTime / 1000);
    let closest = hourly[0];
    let minDiff = Infinity;

    for (const h of hourly) {
      const diff = Math.abs(h.dt - targetSec);
      if (diff < minDiff) {
        minDiff = diff;
        closest = h;
      }
    }

    if (!closest) {
      throw new Error("No hourly data from OpenWeather");
    }

    // Check for active alerts
    let alertType: string | undefined;
    let alertSeverity: "minor" | "moderate" | "severe" | "extreme" | undefined;

    if (data.alerts?.length) {
      const relevantAlert = data.alerts.find(
        (a: any) => a.start <= targetSec && a.end >= targetSec
      );
      if (relevantAlert) {
        alertType = relevantAlert.event;
        alertSeverity = mapAlertSeverity(relevantAlert.tags);
      }
    }

    return {
      conditionCode: mapOwmCondition(closest.weather?.[0]?.id ?? 800),
      precipProb: Math.round((closest.pop ?? 0) * 100),
      precipIntensity: closest.rain?.["1h"] ?? closest.snow?.["1h"] ?? 0,
      tempCelsius: Math.round(closest.temp * 10) / 10,
      windSpeedKmh: Math.round(closest.wind_speed * 3.6),
      alertType,
      alertSeverity,
    };
  },
});

function mapOwmCondition(weatherId: number): string {
  if (weatherId >= 200 && weatherId < 300) return "thunderstorm";
  if (weatherId >= 300 && weatherId < 400) return "drizzle";
  if (weatherId >= 500 && weatherId < 510) return "rain";
  if (weatherId >= 510 && weatherId < 520) return "heavy_rain";
  if (weatherId >= 520 && weatherId < 600) return "rain";
  if (weatherId >= 600 && weatherId < 700) return "snow";
  if (weatherId === 701 || weatherId === 741) return "fog";
  if (weatherId >= 700 && weatherId < 800) return "haze";
  if (weatherId === 800) return "clear";
  if (weatherId === 801) return "partly_cloudy";
  if (weatherId >= 802) return "cloudy";
  return "unknown";
}

function mapAlertSeverity(
  tags: string[] | undefined
): "minor" | "moderate" | "severe" | "extreme" {
  if (!tags) return "moderate";
  const joined = tags.join(" ").toLowerCase();
  if (joined.includes("extreme")) return "extreme";
  if (joined.includes("severe")) return "severe";
  if (joined.includes("moderate")) return "moderate";
  return "minor";
}
