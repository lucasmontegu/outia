import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("saved_places")
      .withIndex("byUserId", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("home"), v.literal("work"), v.literal("custom")),
    lat: v.number(),
    lon: v.number(),
    address: v.string(),
    placeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db.insert("saved_places", {
      userId: user._id,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("saved_places"),
    name: v.optional(v.string()),
    lat: v.optional(v.number()),
    lon: v.optional(v.number()),
    address: v.optional(v.string()),
    placeId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const place = await ctx.db.get(args.id);
    if (!place || place.userId !== user._id) {
      throw new Error("Place not found");
    }

    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(args.id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("saved_places") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const place = await ctx.db.get(args.id);
    if (!place || place.userId !== user._id) {
      throw new Error("Place not found");
    }
    await ctx.db.delete(args.id);
  },
});
