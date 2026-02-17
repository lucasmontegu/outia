"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Evaluates a trip for alert-worthy conditions:
 * - High risk segments (score > 60)
 * - Weather changes since last check
 * - Better departure time suggestions
 */
export const evaluateTrip = internalAction({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.runQuery(internal.trips.getInternal, {
      tripId: args.tripId,
    });
    if (!trip || trip.status === "cancelled") return;

    const weatherPoints = await ctx.runQuery(
      internal.tripWeatherPoints.listInternal,
      { tripId: args.tripId }
    );

    if (weatherPoints.length === 0) return;

    // Check for high risk segments
    const highRiskPoints = weatherPoints.filter((p: any) => p.riskScore > 60);
    if (highRiskPoints.length > 0) {
      const worstPoint = highRiskPoints.reduce((a: any, b: any) =>
        a.riskScore > b.riskScore ? a : b
      );

      const severityLabel =
        worstPoint.riskScore > 75 ? "extreme" : "high";

      await ctx.runMutation(internal.alerts.create, {
        userId: trip.userId,
        tripId: args.tripId,
        type: "high_risk",
        severity: worstPoint.riskScore > 75 ? "critical" : "warning",
        title: `Riesgo ${severityLabel === "extreme" ? "extremo" : "alto"} en tu ruta`,
        message: `Se detectaron condiciones de riesgo ${severityLabel === "extreme" ? "extremo" : "alto"} (${worstPoint.riskScore}/100) en un punto de tu ruta. Condicion: ${worstPoint.conditionCode}, precipitacion ${worstPoint.precipProb}%.`,
        metadata: {
          pointIndex: worstPoint.pointIndex,
          riskScore: worstPoint.riskScore,
          conditionCode: worstPoint.conditionCode,
        },
      });
    }

    // Check for thunderstorm or severe weather alerts
    const severePoints = weatherPoints.filter(
      (p: any) =>
        p.alertSeverity === "severe" || p.alertSeverity === "extreme"
    );
    if (severePoints.length > 0) {
      await ctx.runMutation(internal.alerts.create, {
        userId: trip.userId,
        tripId: args.tripId,
        type: "weather_change",
        severity: "critical",
        title: "Alerta meteorologica severa",
        message: `Hay ${severePoints.length} alerta(s) meteorologica(s) activa(s) en tu ruta. Considera reprogramar tu viaje.`,
      });
    }
  },
});

/**
 * Evaluates alternative departure windows (+/- 1, 2, 3 hours).
 */
export const evaluateDepartureWindow = internalAction({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const trip = await ctx.runQuery(internal.trips.getInternal, {
      tripId: args.tripId,
    });
    if (!trip) return;

    // Only suggest if current risk is moderate or higher
    if ((trip.overallRiskScore ?? 0) < 30) return;

    await ctx.runMutation(internal.alerts.create, {
      userId: trip.userId,
      tripId: args.tripId,
      type: "departure_suggestion",
      severity: "info",
      title: "Considera cambiar tu hora de salida",
      message: `Tu ruta tiene un riesgo de ${trip.overallRiskScore}/100. Puedes probar saliendo mas temprano o mas tarde para mejores condiciones.`,
    });
  },
});
