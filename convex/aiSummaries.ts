import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const create = internalMutation({
  args: {
    tripId: v.id("trips"),
    userId: v.id("users"),
    departureAt: v.number(),
    recommendation: v.string(),
    reasons: v.array(v.string()),
    confidence: v.number(),
    analysisType: v.union(
      v.literal("trip_summary"),
      v.literal("departure_analysis")
    ),
    bestDepartureWindow: v.optional(
      v.object({
        startHour: v.number(),
        endHour: v.number(),
        riskReduction: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Remove existing summary of same type for this trip
    const existing = await ctx.db
      .query("ai_summaries")
      .withIndex("byTripAndType", (q) =>
        q.eq("tripId", args.tripId).eq("analysisType", args.analysisType)
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return await ctx.db.insert("ai_summaries", args);
  },
});

export const getByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("ai_summaries")
      .withIndex("byTripAndType", (q) =>
        q.eq("tripId", args.tripId).eq("analysisType", "trip_summary")
      )
      .first();
  },
});

export const getDepartureAnalysis = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("ai_summaries")
      .withIndex("byTripAndType", (q) =>
        q.eq("tripId", args.tripId).eq("analysisType", "departure_analysis")
      )
      .first();
  },
});
