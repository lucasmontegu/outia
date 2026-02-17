"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import OpenAI from "openai";

const MODEL = "gpt-4o-mini";
const COST_PER_1K_INPUT = 0.00015;
const COST_PER_1K_OUTPUT = 0.0006;

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");
  return new OpenAI({ apiKey });
}

export const generateTripSummary = internalAction({
  args: {
    tripId: v.id("trips"),
    userId: v.id("users"),
    departureAt: v.number(),
    weatherData: v.string(), // JSON stringified weather points
    overallRiskScore: v.number(),
    totalDistanceKm: v.number(),
    totalDurationSeconds: v.number(),
  },
  handler: async (ctx, args) => {
    const client = getClient();

    const prompt = `Eres un asistente de clima en ruta para la app Outia. Analiza los datos de clima de un viaje y genera una recomendacion breve en español.

DATOS DEL VIAJE:
- Salida: ${new Date(args.departureAt).toLocaleString("es")}
- Distancia: ${Math.round(args.totalDistanceKm)} km
- Duracion: ${Math.round(args.totalDurationSeconds / 3600)}h ${Math.round((args.totalDurationSeconds % 3600) / 60)}min
- Riesgo general: ${args.overallRiskScore}/100

PUNTOS DE CLIMA:
${args.weatherData}

Responde en JSON con este formato exacto:
{
  "recommendation": "recomendacion en 1-2 oraciones",
  "reasons": ["razon 1", "razon 2", "razon 3"],
  "confidence": 0.85
}

La recomendacion debe ser accionable (ej: "Buen momento para salir" o "Considera retrasar 2 horas"). Las razones deben ser especificas del clima. La confianza es 0-1 basada en la calidad de los datos.`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 300,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    // Log API cost
    const inputTokens = completion.usage?.prompt_tokens ?? 0;
    const outputTokens = completion.usage?.completion_tokens ?? 0;
    const cost =
      (inputTokens / 1000) * COST_PER_1K_INPUT +
      (outputTokens / 1000) * COST_PER_1K_OUTPUT;

    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openai",
      endpoint: "chat/completions",
      estimatedCostUsd: cost,
      tripId: args.tripId,
    });

    // Save AI summary
    await ctx.runMutation(internal.aiSummaries.create, {
      tripId: args.tripId,
      userId: args.userId,
      departureAt: args.departureAt,
      recommendation: parsed.recommendation ?? "Sin recomendacion disponible",
      reasons: parsed.reasons ?? [],
      confidence: parsed.confidence ?? 0.5,
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
    alternativeRisks: v.string(), // JSON: [{hourOffset, risk}]
  },
  handler: async (ctx, args) => {
    const client = getClient();

    const prompt = `Analiza ventanas de salida alternativas para un viaje. El riesgo actual es ${args.currentRisk}/100 saliendo a las ${new Date(args.departureAt).toLocaleTimeString("es")}.

Riesgos alternativos: ${args.alternativeRisks}

Responde en JSON:
{
  "recommendation": "recomendacion sobre mejor hora de salida",
  "reasons": ["razon 1", "razon 2"],
  "confidence": 0.8,
  "bestWindow": { "startHour": 7, "endHour": 9, "riskReduction": 25 }
}`;

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 250,
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content);

    const inputTokens = completion.usage?.prompt_tokens ?? 0;
    const outputTokens = completion.usage?.completion_tokens ?? 0;
    const cost =
      (inputTokens / 1000) * COST_PER_1K_INPUT +
      (outputTokens / 1000) * COST_PER_1K_OUTPUT;

    await ctx.runMutation(internal.apiUsage.log, {
      provider: "openai",
      endpoint: "chat/completions",
      estimatedCostUsd: cost,
      tripId: args.tripId,
    });

    await ctx.runMutation(internal.aiSummaries.create, {
      tripId: args.tripId,
      userId: args.userId,
      departureAt: args.departureAt,
      recommendation: parsed.recommendation ?? "Sin analisis disponible",
      reasons: parsed.reasons ?? [],
      confidence: parsed.confidence ?? 0.5,
      analysisType: "departure_analysis",
      bestDepartureWindow: parsed.bestWindow,
    });
  },
});
