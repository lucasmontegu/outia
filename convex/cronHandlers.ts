"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Recalculates weather for all active trips (within next 48 hours).
 */
export const recalculateActiveTrips = internalAction({
  handler: async (ctx) => {
    // Check budget first
    const budget = await ctx.runQuery(internal.apiUsage.shouldThrottle);
    if (budget.disabled) {
      console.log("Cron: budget exceeded, skipping recalculation");
      return;
    }

    const activeTrips = await ctx.runQuery(internal.trips.listActiveInternal);
    const now = Date.now();
    const fortyEightHours = 48 * 60 * 60 * 1000;

    let count = 0;
    for (const trip of activeTrips) {
      // Only recalculate trips departing within 48h
      if (trip.departureAt - now > fortyEightHours) continue;
      // Skip if recently fetched (within 1.5h)
      if (trip.lastWeatherFetchAt && now - trip.lastWeatherFetchAt < 90 * 60 * 1000) {
        continue;
      }

      try {
        await ctx.runAction(internal.tripPipeline.computeRouteAndWeather, {
          tripId: trip._id,
        });
        // Evaluate alerts for the updated trip
        await ctx.runAction(internal.alertEngine.evaluateTrip, {
          tripId: trip._id,
        });
        count++;
      } catch (err) {
        console.error(`Cron: failed to recalculate trip ${trip._id}:`, err);
      }
    }

    console.log(`Cron: recalculated ${count} active trips`);
  },
});

/**
 * Updates weekly day scores for users with saved routes.
 */
export const updateWeeklyScores = internalAction({
  handler: async (ctx) => {
    const budget = await ctx.runQuery(internal.apiUsage.shouldThrottle);
    if (budget.disabled) {
      console.log("Cron: budget exceeded, skipping weekly scores");
      return;
    }

    // For MVP, only compute for users with active trips
    const activeTrips = await ctx.runQuery(internal.trips.listActiveInternal);
    const processedUsers = new Set<string>();

    for (const trip of activeTrips) {
      const userIdStr = trip.userId as string;
      if (processedUsers.has(userIdStr)) continue;
      processedUsers.add(userIdStr);

      try {
        await ctx.runAction(internal.tripDailyScores.computeWeeklyScores, {
          userId: trip.userId,
          originLat: trip.origin.lat,
          originLon: trip.origin.lon,
          destLat: trip.destination.lat,
          destLon: trip.destination.lon,
        });
      } catch (err) {
        console.error(`Cron: failed weekly scores for user ${trip.userId}:`, err);
      }
    }
  },
});

