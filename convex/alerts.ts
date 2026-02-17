import { internalMutation, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const create = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("alerts", {
      ...args,
      sentAsPush: false,
    });
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("alerts")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(50);
  },
});

export const listByTrip = query({
  args: { tripId: v.id("trips") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("alerts")
      .withIndex("byTripId", (q) => q.eq("tripId", args.tripId))
      .collect();
  },
});

export const markRead = mutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const alert = await ctx.db.get(args.alertId);
    if (!alert || alert.userId !== user._id) return;
    await ctx.db.patch(args.alertId, { readAt: Date.now() });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const unread = await ctx.db
      .query("alerts")
      .withIndex("byUserIdAndRead", (q) =>
        q.eq("userId", user._id).eq("readAt", undefined)
      )
      .collect();

    const now = Date.now();
    for (const alert of unread) {
      await ctx.db.patch(alert._id, { readAt: now });
    }
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    const unread = await ctx.db
      .query("alerts")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
    return unread.filter((a) => !a.readAt).length;
  },
});

export const markSentAsPush = internalMutation({
  args: { alertId: v.id("alerts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.alertId, { sentAsPush: true });
  },
});
