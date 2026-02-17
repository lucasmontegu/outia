"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { calculatePointRisk, calculateRouteRisk } from "./lib/riskEngine";

/**
 * Evaluates alternative departure times (+/- 1, 2, 3 hours)
 * using lightweight weather sampling at route midpoint.
 */
export const analyzeAlternatives = internalAction({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.runQuery(internal.trips.getInternal, {
      tripId: args.tripId,
    });
    if (!trip) return;

    // Check budget
    const budget = await ctx.runQuery(internal.apiUsage.shouldThrottle);
    if (budget.disabled || budget.lowFrequency) return;

    const midLat = (trip.origin.lat + trip.destination.lat) / 2;
    const midLon = (trip.origin.lon + trip.destination.lon) / 2;

    const offsets = [-3, -2, -1, 1, 2, 3]; // hours
    const alternativeRisks: { hourOffset: number; risk: number }[] = [];

    for (const offset of offsets) {
      const altDeparture = trip.departureAt + offset * 3600 * 1000;
      // Skip past departures
      if (altDeparture < Date.now()) continue;

      try {
        const weather = await ctx.runAction(
          internal.providers.weatherRouter.fetchWeatherForPoint,
          {
            lat: midLat,
            lon: midLon,
            targetTime: altDeparture,
            tripId: args.tripId,
          }
        );

        const risk = calculatePointRisk({
          precipProb: weather.precipProb,
          precipIntensity: weather.precipIntensity,
          windSpeedKmh: weather.windSpeedKmh,
          alertType: weather.alertType,
          alertSeverity: weather.alertSeverity,
        });

        alternativeRisks.push({ hourOffset: offset, risk: risk.riskScore });
      } catch (err) {
        console.warn(`Departure analysis failed for offset ${offset}h:`, err);
      }
    }

    if (alternativeRisks.length === 0) return;

    // Generate AI analysis
    await ctx.runAction(internal.providers.openai.generateDepartureAnalysis, {
      tripId: args.tripId,
      userId: trip.userId,
      departureAt: trip.departureAt,
      currentRisk: trip.overallRiskScore ?? 50,
      alternativeRisks: JSON.stringify(alternativeRisks),
    });
  },
});
