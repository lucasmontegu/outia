"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { calculatePointRisk, calculateDayScore } from "./lib/riskEngine";
import type { ForecastDataPoint } from "./providers/weatherForecast5day";

/**
 * Computes weekly day scores using the FREE 5-day/3h forecast endpoint.
 * One API call covers ~5 days instead of 21 One Call requests.
 */
export const computeWeeklyScores = internalAction({
  args: {
    userId: v.id("users"),
    originLat: v.number(),
    originLon: v.number(),
    destLat: v.number(),
    destLon: v.number(),
  },
  handler: async (ctx, args) => {
    // Sample midpoint between origin and destination
    const midLat = (args.originLat + args.destLat) / 2;
    const midLon = (args.originLon + args.destLon) / 2;

    // Single free API call for 5 days of data
    const forecast: ForecastDataPoint[] = await ctx.runAction(
      internal.providers.weatherForecast5day.fetch5DayForecast,
      { lat: midLat, lon: midLon }
    );

    if (forecast.length === 0) return;

    // Group forecast points by date
    const byDate = new Map<string, ForecastDataPoint[]>();
    for (const point of forecast) {
      const dateStr = new Date(point.dt * 1000).toISOString().split("T")[0];
      const existing = byDate.get(dateStr) ?? [];
      existing.push(point);
      byDate.set(dateStr, existing);
    }

    // Typical departure hours to evaluate (8am, 12pm, 4pm)
    const targetHours = [8, 12, 16];

    for (const [dateStr, points] of byDate) {
      const risks: number[] = [];
      let bestHour = 8;
      let bestRisk = 100;

      for (const targetHour of targetHours) {
        // Find closest forecast point to this target hour
        const targetEpoch = new Date(`${dateStr}T${String(targetHour).padStart(2, "0")}:00:00`).getTime() / 1000;
        const closest = points.reduce((a, b) =>
          Math.abs(a.dt - targetEpoch) < Math.abs(b.dt - targetEpoch) ? a : b
        );

        const risk = calculatePointRisk({
          precipProb: closest.precipProb,
          precipIntensity: closest.precipIntensity / 3, // convert mm/3h to mm/h
          windSpeedKmh: closest.windSpeedKmh,
        });

        risks.push(risk.riskScore);
        if (risk.riskScore < bestRisk) {
          bestRisk = risk.riskScore;
          bestHour = targetHour;
        }
      }

      if (risks.length === 0) continue;

      const avgRisk = risks.reduce((s, r) => s + r, 0) / risks.length;
      const overallScore = calculateDayScore(avgRisk);

      await ctx.runMutation(internal.tripDailyScoresQueries.upsertScore, {
        userId: args.userId,
        originLat: args.originLat,
        originLon: args.originLon,
        destLat: args.destLat,
        destLon: args.destLon,
        date: dateStr,
        overallScore,
        bestDepartureHour: bestHour,
      });
    }
  },
});
