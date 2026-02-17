"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Checks minutely precipitation from One Call API for trips departing within 1 hour.
 * Generates "rain_imminent" alerts if significant precipitation detected in next 15-30 min.
 */
export const checkMinutelyPrecip = internalAction({
  handler: async (ctx) => {
    const budget = await ctx.runQuery(internal.apiUsage.shouldThrottle);
    if (budget.disabled) return;

    const activeTrips = await ctx.runQuery(internal.trips.listActiveInternal);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    let alertCount = 0;
    for (const trip of activeTrips) {
      // Only check trips departing within the next hour
      const timeToDeparture = trip.departureAt - now;
      if (timeToDeparture < 0 || timeToDeparture > oneHour) continue;

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) break;

      const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${trip.origin.lat}&lon=${trip.origin.lon}&exclude=hourly,daily,alerts&units=metric&appid=${apiKey}`;

      try {
        const response = await fetch(url);
        if (!response.ok) continue;

        const data = await response.json();

        await ctx.runMutation(internal.apiUsage.log, {
          provider: "openweather",
          endpoint: "onecall_minutely",
          estimatedCostUsd: 0.0015,
          tripId: trip._id,
        });

        const minutely: Array<{ dt: number; precipitation: number }> =
          data.minutely ?? [];
        if (minutely.length === 0) continue;

        // Check for precipitation in the next 15-30 minutes
        const next30 = minutely.slice(0, 30);
        const precipEntries = next30.filter((m) => m.precipitation > 0);

        if (precipEntries.length === 0) continue;

        // Find earliest rain and max intensity
        const firstRain = precipEntries[0];
        const minutesUntilRain = Math.round((firstRain.dt - now / 1000) / 60);
        const maxIntensity = Math.max(...precipEntries.map((m) => m.precipitation));

        const severity: "info" | "warning" | "critical" =
          maxIntensity > 5 ? "critical" : maxIntensity > 2 ? "warning" : "info";

        await ctx.runMutation(internal.alerts.create, {
          userId: trip.userId,
          tripId: trip._id,
          type: "rain_imminent",
          severity,
          title: `Lluvia en ${Math.max(1, minutesUntilRain)} min`,
          message: `Se detecta precipitacion en los proximos ${Math.max(1, minutesUntilRain)} minutos en tu punto de partida. Intensidad maxima: ${maxIntensity.toFixed(1)} mm/h.`,
          metadata: {
            minutesUntilRain: Math.max(1, minutesUntilRain),
            maxIntensityMmH: maxIntensity,
          },
        });

        alertCount++;
      } catch (err) {
        console.warn(`Minutely precip check failed for trip ${trip._id}:`, err);
      }
    }

    if (alertCount > 0) {
      console.log(`Minutely precip: generated ${alertCount} rain_imminent alerts`);
    }
  },
});
