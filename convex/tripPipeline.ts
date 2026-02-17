"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { sampleRoute } from "./lib/routeSampler";
import { calculatePointRisk, calculateRouteRisk } from "./lib/riskEngine";

/**
 * Main pipeline: computes route, samples points, fetches weather,
 * calculates risk scores, and saves everything to DB.
 */
export const computeRouteAndWeather = internalAction({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    // 1. Load the trip
    const trip = await ctx.runQuery(internal.trips.getInternal, {
      tripId: args.tripId,
    });
    if (!trip) throw new Error("Trip not found");

    // 2. Check budget guardrails
    const budget = await ctx.runQuery(internal.apiUsage.shouldThrottle);
    if (budget.disabled) {
      console.warn("API budget exceeded — pipeline disabled");
      return;
    }

    // 3. Clear previous data (for re-runs)
    await ctx.runMutation(internal.tripLegs.clearByTrip, {
      tripId: args.tripId,
    });
    await ctx.runMutation(internal.tripWeatherPoints.clearByTrip, {
      tripId: args.tripId,
    });

    // 4. Compute route via Google Routes
    // Google Routes requires a future timestamp — clamp to at least 5 min from now
    const minDeparture = Date.now() + 5 * 60 * 1000;
    const effectiveDeparture = Math.max(trip.departureAt, minDeparture);
    const departureTime = new Date(effectiveDeparture).toISOString();
    const route = await ctx.runAction(
      internal.providers.googleRoutes.computeRoute,
      {
        originLat: trip.origin.lat,
        originLon: trip.origin.lon,
        destLat: trip.destination.lat,
        destLon: trip.destination.lon,
        stops: trip.stops.map((s: any) => ({ lat: s.lat, lon: s.lon })),
        departureTime,
        tripId: args.tripId,
      }
    );

    // 5. Save legs
    const legData = route.legs.map((leg: any, i: number) => {
      const legStartEta =
        i === 0
          ? trip.departureAt
          : trip.departureAt +
            route.legs
              .slice(0, i)
              .reduce((sum: number, l: any) => sum + l.durationSeconds * 1000, 0);

      return {
        tripId: args.tripId,
        legIndex: i,
        startLat: leg.startLat,
        startLon: leg.startLon,
        endLat: leg.endLat,
        endLon: leg.endLon,
        startEta: legStartEta,
        endEta: legStartEta + leg.durationSeconds * 1000,
        distanceKm: leg.distanceMeters / 1000,
        durationSeconds: leg.durationSeconds,
      };
    });

    await ctx.runMutation(internal.tripLegs.createBatch, { legs: legData });

    // 6. Sample points along the route
    const sampledPoints = sampleRoute(
      route.encodedPolyline,
      trip.departureAt,
      route.durationSeconds,
      budget.reduceSampling || budget.lowFrequency
    );

    // 7. Fetch weather for each sampled point (parallel batches)
    const weatherResults: Array<{
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
    }> = [];
    const batchSize = 5;

    for (let i = 0; i < sampledPoints.length; i += batchSize) {
      const batch = sampledPoints.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map((point) =>
          ctx.runAction(
            internal.providers.weatherRouter.fetchWeatherForPoint,
            {
              lat: point.lat,
              lon: point.lon,
              targetTime: point.etaAt,
              tripId: args.tripId,
            }
          )
        )
      );
      weatherResults.push(...results);
    }

    // 8. Calculate risk scores and prepare weather points
    const weatherPoints = sampledPoints.map((point, i) => {
      const weather = weatherResults[i];
      const risk = calculatePointRisk({
        precipProb: weather.precipProb,
        precipIntensity: weather.precipIntensity,
        windSpeedKmh: weather.windSpeedKmh,
        alertType: weather.alertType,
        alertSeverity: weather.alertSeverity,
        uvIndex: weather.uvIndex,
        visibilityKm: weather.visibilityKm,
      });

      return {
        tripId: args.tripId,
        pointIndex: point.pointIndex,
        lat: point.lat,
        lon: point.lon,
        etaAt: point.etaAt,
        conditionCode: weather.conditionCode,
        precipProb: weather.precipProb,
        precipIntensity: weather.precipIntensity,
        tempCelsius: weather.tempCelsius,
        windSpeedKmh: weather.windSpeedKmh,
        alertType: weather.alertType,
        alertSeverity: weather.alertSeverity,
        riskScore: risk.riskScore,
        riskLevel: risk.riskLevel,
        provider: "auto",
        uvIndex: weather.uvIndex,
        visibilityKm: weather.visibilityKm,
        dewPointCelsius: weather.dewPointCelsius,
        humidityPercent: weather.humidityPercent,
        cloudCoverPercent: weather.cloudCoverPercent,
        airQualityIndex: undefined as number | undefined,
      };
    });

    // 8b. Fetch air quality if user opted in
    const user = await ctx.runQuery(internal.users.getInternal, {
      userId: trip.userId,
    });
    if (user?.preferences?.showAirQuality) {
      const batchSizeAqi = 5;
      for (let i = 0; i < sampledPoints.length; i += batchSizeAqi) {
        const batch = sampledPoints.slice(i, i + batchSizeAqi);
        const aqiResults = await Promise.all(
          batch.map((point) =>
            ctx.runAction(
              internal.providers.weatherAirPollution.fetchAirQuality,
              { lat: point.lat, lon: point.lon }
            )
          )
        );
        for (let j = 0; j < aqiResults.length; j++) {
          const aqi = aqiResults[j];
          if (aqi != null) {
            weatherPoints[i + j] = {
              ...weatherPoints[i + j],
              airQualityIndex: aqi,
            };
          }
        }
      }
    }

    // 9. Save weather points
    await ctx.runMutation(internal.tripWeatherPoints.createBatch, {
      points: weatherPoints,
    });

    // 10. Calculate overall route risk
    const pointScores = weatherPoints.map((p) => p.riskScore);
    const routeRisk = calculateRouteRisk(pointScores);

    // 11. Update trip with results
    await ctx.runMutation(internal.trips.updateFromPipeline, {
      tripId: args.tripId,
      overallRiskScore: routeRisk.riskScore,
      totalDistanceKm: route.distanceMeters / 1000,
      totalDurationSeconds: route.durationSeconds,
      encodedPolyline: route.encodedPolyline,
    });

    // 12. Generate AI summary (non-blocking — if it fails, trip is still usable)
    try {
      const weatherSummary = weatherPoints.map((p) => ({
        idx: p.pointIndex,
        condition: p.conditionCode,
        temp: p.tempCelsius,
        precip: p.precipProb,
        wind: p.windSpeedKmh,
        risk: p.riskScore,
        alert: p.alertType,
      }));

      await ctx.runAction(internal.providers.llm.generateTripSummary, {
        tripId: args.tripId,
        userId: trip.userId,
        departureAt: trip.departureAt,
        weatherData: JSON.stringify(weatherSummary),
        overallRiskScore: routeRisk.riskScore,
        totalDistanceKm: route.distanceMeters / 1000,
        totalDurationSeconds: route.durationSeconds,
      });
    } catch (err) {
      console.warn("AI summary generation failed (non-critical):", err);
    }

    // 13. Schedule departure alternatives analysis (non-blocking)
    try {
      await ctx.runAction(internal.departureOptimizer.analyzeAlternatives, {
        tripId: args.tripId,
      });
    } catch (err) {
      console.warn("Departure analysis failed (non-critical):", err);
    }

    console.log(
      `Pipeline complete for trip ${args.tripId}: ${weatherPoints.length} weather points, risk ${routeRisk.riskScore} (${routeRisk.riskLevel})`
    );
  },
});
