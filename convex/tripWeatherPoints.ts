import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const createBatch = internalMutation({
  args: {
    points: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const point of args.points) {
      const id = await ctx.db.insert("trip_weather_points", point);
      ids.push(id);
    }
    return ids;
  },
});

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const trip = await ctx.db.get(args.tripId);
    if (!trip || trip.userId !== user._id) return [];

    return await ctx.db
      .query("trip_weather_points")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const clearByTrip = internalMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const points = await ctx.db
      .query("trip_weather_points")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();
    for (const point of points) {
      await ctx.db.delete(point._id);
    }
  },
});

export const listInternal = internalQuery({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trip_weather_points")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});
