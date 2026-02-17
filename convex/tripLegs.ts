import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const createBatch = internalMutation({
  args: {
    legs: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const leg of args.legs) {
      const id = await ctx.db.insert("trip_legs", leg);
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
      .query("trip_legs")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const clearByTrip = internalMutation({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const legs = await ctx.db
      .query("trip_legs")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();
    for (const leg of legs) {
      await ctx.db.delete(leg._id);
    }
  },
});
