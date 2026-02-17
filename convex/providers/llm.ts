"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, Output } from "ai";
import { z } from "zod";

// Free models router — automatically picks a free model that supports
// the features needed (structured output, tool calling, etc.)
const MODEL = "minimax/minimax-m2.5";

function getModel() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const openrouter = createOpenRouter({ apiKey });
  return openrouter(MODEL);
}

const tripSummarySchema = z.object({
  recommendation: z.string().describe("Recomendacion accionable en 1-2 oraciones"),
  reasons: z.array(z.string()).describe("2-3 razones especificas del clima"),
  confidence: z.number().describe("Confianza 0-1 basada en calidad de datos"),
});

const departureAnalysisSchema = z.object({
  recommendation: z.string().describe("Recomendacion sobre mejor hora de salida"),
  reasons: z.array(z.string()).describe("1-2 razones"),
  confidence: z.number().describe("Confianza 0-1"),
  bestWindow: z.object({
    startHour: z.number(),
    endHour: z.number(),
    riskReduction: z.number(),
  }).describe("Ventana de salida optima"),
});

export const generateTripSummary = internalAction({
  args: {
    tripId: v.id("trips"),
    userId: v.id("users"),
    departureAt: v.number(),
    weatherData: v.string(),
    overallRiskScore: v.number(),
    totalDistanceKm: v.number(),
    totalDurationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const model = getModel();

    const { output } = await generateText({
      model,
      output: Output.object({ schema: tripSummarySchema }),
      prompt: `Eres un asistente de clima en ruta para la app Outia. Analiza los datos de clima de un viaje y genera una recomendacion breve en español.

DATOS DEL VIAJE:
- Salida: ${new Date(args.departureAt).toLocaleString("es")}
- Distancia: ${Math.round(args.totalDistanceKm)} km
- Duracion: ${Math.round(args.totalDurationSeconds / 3600)}h ${Math.round((args.totalDurationSeconds % 3600) / 60)}min
- Riesgo general: ${args.overallRiskScore}/100

PUNTOS DE CLIMA:
${args.weatherData}

La recomendacion debe ser accionable (ej: "Buen momento para salir" o "Considera retrasar 2 horas"). Las razones deben ser especificas del clima. La confianza es 0-1 basada en la calidad de los datos.`,
      temperature: 0.3,
      maxOutputTokens: 300,
    });

    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openrouter",
      endpoint: MODEL,
      estimatedCostUsd: 0,
      tripId: args.tripId,
    });

    await ctx.runMutation(internal.aiSummaries.create, {
      tripId: args.tripId,
      userId: args.userId,
      departureAt: args.departureAt,
      recommendation: output?.recommendation ?? "Sin recomendacion disponible",
      reasons: output?.reasons ?? [],
      confidence: output?.confidence ?? 0.5,
      analysisType: "trip_summary",
    });
  },
});

export const generateDepartureAnalysis = internalAction({
  args: {
    tripId: v.id("trips"),
    userId: v.id("users"),
    departureAt: v.number(),
    currentRisk: v.number(),
    alternativeRisks: v.string(),
  },
  handler: async (ctx, args) => {
    const model = getModel();

    const { output } = await generateText({
      model,
      output: Output.object({ schema: departureAnalysisSchema }),
      prompt: `Analiza ventanas de salida alternativas para un viaje. El riesgo actual es ${args.currentRisk}/100 saliendo a las ${new Date(args.departureAt).toLocaleTimeString("es")}.

Riesgos alternativos: ${args.alternativeRisks}`,
      temperature: 0.3,
      maxOutputTokens: 250,
    });

    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openrouter",
      endpoint: MODEL,
      estimatedCostUsd: 0,
      tripId: args.tripId,
    });

    await ctx.runMutation(internal.aiSummaries.create, {
      tripId: args.tripId,
      userId: args.userId,
      departureAt: args.departureAt,
      recommendation: output?.recommendation ?? "Sin analisis disponible",
      reasons: output?.reasons ?? [],
      confidence: output?.confidence ?? 0.5,
      analysisType: "departure_analysis",
      bestDepartureWindow: output?.bestWindow,
    });
  },
});
