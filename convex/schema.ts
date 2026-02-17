import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const locationFields = {
  lat: v.number(),
  lon: v.number(),
  address: v.optional(v.string()),
  placeId: v.optional(v.string()),
};

export default defineSchema({
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.optional(v.string()),
    externalId: v.string(),
    onboardingCompleted: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
    expoPushToken: v.optional(v.string()),
    preferences: v.optional(
      v.object({
        riskThreshold: v.optional(v.number()),
        units: v.optional(v.union(v.literal("metric"), v.literal("imperial"))),
        notificationsEnabled: v.optional(v.boolean()),
        showAirQuality: v.optional(v.boolean()),
      })
    ),
  })
    .index("byExternalId", ["externalId"])
    .index("byToken", ["tokenIdentifier"]),

  saved_places: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("home"),
      v.literal("work"),
      v.literal("custom")
    ),
    lat: v.number(),
    lon: v.number(),
    address: v.string(),
    placeId: v.optional(v.string()),
  }).index("byUserId", ["userId"]),

  saved_routes: defineTable({
    userId: v.id("users"),
    name: v.string(),
    origin: v.object(locationFields),
    destination: v.object(locationFields),
    stops: v.array(v.object(locationFields)),
    lastUsedAt: v.optional(v.number()),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndLastUsed", ["userId", "lastUsedAt"]),

  trips: defineTable({
    userId: v.id("users"),
    origin: v.object(locationFields),
    destination: v.object(locationFields),
    stops: v.array(v.object(locationFields)),
    departureAt: v.number(),
    timezone: v.string(),
    status: v.union(
      v.literal("planning"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    overallRiskScore: v.optional(v.number()),
    totalDistanceKm: v.optional(v.number()),
    totalDurationSeconds: v.optional(v.number()),
    encodedPolyline: v.optional(v.string()),
    savedRouteId: v.optional(v.id("saved_routes")),
    lastWeatherFetchAt: v.optional(v.number()),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndStatus", ["userId", "status"])
    .index("byStatus", ["status"]),

  trip_legs: defineTable({
    tripId: v.id("trips"),
    legIndex: v.number(),
    startLat: v.number(),
    startLon: v.number(),
    endLat: v.number(),
    endLon: v.number(),
    startEta: v.number(),
    endEta: v.number(),
    distanceKm: v.number(),
    durationSeconds: v.number(),
  }).index("byTripId", ["tripId"]),

  trip_weather_points: defineTable({
    tripId: v.id("trips"),
    legId: v.optional(v.id("trip_legs")),
    pointIndex: v.number(),
    lat: v.number(),
    lon: v.number(),
    etaAt: v.number(),
    conditionCode: v.string(),
    precipProb: v.number(),
    precipIntensity: v.optional(v.number()),
    tempCelsius: v.number(),
    windSpeedKmh: v.number(),
    alertType: v.optional(v.string()),
    alertSeverity: v.optional(
      v.union(
        v.literal("minor"),
        v.literal("moderate"),
        v.literal("severe"),
        v.literal("extreme")
      )
    ),
    riskScore: v.number(),
    riskLevel: v.union(
      v.literal("low"),
      v.literal("moderate"),
      v.literal("high"),
      v.literal("extreme")
    ),
    provider: v.string(),
    uvIndex: v.optional(v.number()),
    visibilityKm: v.optional(v.number()),
    dewPointCelsius: v.optional(v.number()),
    humidityPercent: v.optional(v.number()),
    cloudCoverPercent: v.optional(v.number()),
    airQualityIndex: v.optional(v.number()),
  })
    .index("byTripId", ["tripId"])
    .index("byTripAndLeg", ["tripId", "legId"]),

  trip_daily_scores: defineTable({
    userId: v.id("users"),
    originLat: v.number(),
    originLon: v.number(),
    destLat: v.number(),
    destLon: v.number(),
    date: v.string(),
    overallScore: v.number(),
    summary: v.optional(v.string()),
    bestDepartureHour: v.optional(v.number()),
  })
    .index("byUserId", ["userId"])
    .index("byUserIdAndDate", ["userId", "date"]),

  alerts: defineTable({
    userId: v.id("users"),
    tripId: v.optional(v.id("trips")),
    type: v.union(
      v.literal("high_risk"),
      v.literal("weather_change"),
      v.literal("departure_suggestion"),
      v.literal("rain_imminent"),
      v.literal("system")
    ),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("critical")
    ),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.any()),
    readAt: v.optional(v.number()),
    sentAsPush: v.optional(v.boolean()),
  })
    .index("byUserId", ["userId"])
    .index("byTripId", ["tripId"])
    .index("byUserIdAndRead", ["userId", "readAt"]),

  ai_summaries: defineTable({
    tripId: v.id("trips"),
    userId: v.id("users"),
    departureAt: v.number(),
    recommendation: v.string(),
    reasons: v.array(v.string()),
    confidence: v.number(),
    bestDepartureWindow: v.optional(
      v.object({
        startHour: v.number(),
        endHour: v.number(),
        riskReduction: v.number(),
      })
    ),
    analysisType: v.union(
      v.literal("trip_summary"),
      v.literal("departure_analysis")
    ),
  })
    .index("byTripId", ["tripId"])
    .index("byTripAndType", ["tripId", "analysisType"])
    .index("byUserId", ["userId"]),

  api_usage: defineTable({
    provider: v.string(),
    endpoint: v.string(),
    estimatedCostUsd: v.number(),
    date: v.string(),
    tripId: v.optional(v.id("trips")),
  })
    .index("byProviderAndDate", ["provider", "date"])
    .index("byDate", ["date"]),
});
