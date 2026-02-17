"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";

export interface ForecastDataPoint {
  dt: number; // epoch seconds
  tempCelsius: number;
  precipProb: number; // 0-100
  precipIntensity: number; // mm/3h
  windSpeedKmh: number;
  conditionCode: string;
  cloudCoverPercent: number;
}

/**
 * Fetches 5-day/3h forecast from the FREE OpenWeather endpoint.
 * Returns up to 40 data points covering ~5 days.
 */
export const fetch5DayForecast = internalAction({
  args: {
    lat: v.number(),
    lon: v.number(),
  },
  handler: async (ctx, args): Promise<ForecastDataPoint[]> => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) throw new Error("OPENWEATHER_API_KEY not set");

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${args.lat}&lon=${args.lon}&units=metric&appid=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OpenWeather 5-day forecast error ${response.status}`);
    }

    const data = await response.json();

    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openweather",
      endpoint: "forecast5day",
      estimatedCostUsd: 0,
    });

    return (data.list ?? []).map((entry: any) => ({
      dt: entry.dt,
      tempCelsius: Math.round(entry.main.temp * 10) / 10,
      precipProb: Math.round((entry.pop ?? 0) * 100),
      precipIntensity: entry.rain?.["3h"] ?? entry.snow?.["3h"] ?? 0,
      windSpeedKmh: Math.round(entry.wind.speed * 3.6),
      conditionCode: mapOwmCondition(entry.weather?.[0]?.id ?? 800),
      cloudCoverPercent: entry.clouds?.all ?? 0,
    }));
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
