import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const log = internalMutation({
  args: {
    provider: v.string(),
    endpoint: v.string(),
    estimatedCostUsd: v.number(),
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args) => {
    const date = new Date().toISOString().split("T")[0];
    await ctx.db.insert("api_usage", {
      provider: args.provider,
      endpoint: args.endpoint,
      estimatedCostUsd: args.estimatedCostUsd,
      date,
      tripId: args.tripId,
    });
  },
});

export const getDailyTotal = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("api_usage")
      .withIndex("byDate", (q) => q.eq("date", args.date))
      .collect();
    return records.reduce((sum, r) => sum + r.estimatedCostUsd, 0);
  },
});

export const getMonthlyTotal = query({
  args: { yearMonth: v.string() }, // "2026-02"
  handler: async (ctx, args) => {
    const records = await ctx.db.query("api_usage").collect();
    return records
      .filter((r) => r.date.startsWith(args.yearMonth))
      .reduce((sum, r) => sum + r.estimatedCostUsd, 0);
  },
});

export const shouldThrottle = internalQuery({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const yearMonth = today.substring(0, 7);

    const allRecords = await ctx.db.query("api_usage").collect();

    const dailyTotal = allRecords
      .filter((r) => r.date === today)
      .reduce((sum, r) => sum + r.estimatedCostUsd, 0);

    const monthlyTotal = allRecords
      .filter((r) => r.date.startsWith(yearMonth))
      .reduce((sum, r) => sum + r.estimatedCostUsd, 0);

    return {
      dailyTotal,
      monthlyTotal,
      reduceSampling: dailyTotal > 12,
      lowFrequency: monthlyTotal > 360,
      disabled: monthlyTotal > 450,
    };
  },
});
