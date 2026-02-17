import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const upsertScore = internalMutation({
  args: {
    userId: v.id("users"),
    originLat: v.number(),
    originLon: v.number(),
    destLat: v.number(),
    destLon: v.number(),
    date: v.string(),
    overallScore: v.number(),
    bestDepartureHour: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("trip_daily_scores")
      .withIndex("byUserIdAndDate", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        overallScore: args.overallScore,
        bestDepartureHour: args.bestDepartureHour,
      });
    } else {
      await ctx.db.insert("trip_daily_scores", args);
    }
  },
});

export const getWeeklyScores = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const scores = await ctx.db
      .query("trip_daily_scores")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();

    return dates.map((date) => {
      const score = scores.find((s) => s.date === date);
      return {
        date,
        overallScore: score?.overallScore ?? null,
        bestDepartureHour: score?.bestDepartureHour ?? null,
      };
    });
  },
});
