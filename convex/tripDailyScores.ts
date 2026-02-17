"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { calculatePointRisk, calculateDayScore } from "./lib/riskEngine";

export const computeWeeklyScores = internalAction({
  args: {
    userId: v.id("users"),
    originLat: v.number(),
    originLon: v.number(),
    destLat: v.number(),
    destLon: v.number(),
  },
  handler: async (ctx, args) => {
    const today = new Date();

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().split("T")[0];

      // Sample midpoint between origin and destination
      const midLat = (args.originLat + args.destLat) / 2;
      const midLon = (args.originLon + args.destLon) / 2;

      // Check weather at typical departure hours (8am, 12pm, 4pm)
      const departureHours = [8, 12, 16];
      const risks: number[] = [];
      let bestHour = 8;
      let bestRisk = 100;

      for (const hour of departureHours) {
        const targetDate = new Date(dateStr);
        targetDate.setHours(hour, 0, 0, 0);
        const targetTime = targetDate.getTime();

        try {
          const weather = await ctx.runAction(
            internal.providers.weatherRouter.fetchWeatherForPoint,
            {
              lat: midLat,
              lon: midLon,
              targetTime,
            }
          );

          const risk = calculatePointRisk({
            precipProb: weather.precipProb,
            precipIntensity: weather.precipIntensity,
            windSpeedKmh: weather.windSpeedKmh,
            alertType: weather.alertType,
            alertSeverity: weather.alertSeverity,
          });

          risks.push(risk.riskScore);
          if (risk.riskScore < bestRisk) {
            bestRisk = risk.riskScore;
            bestHour = hour;
          }
        } catch (err) {
          console.warn(`Failed to get weather for ${dateStr} ${hour}:00:`, err);
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
