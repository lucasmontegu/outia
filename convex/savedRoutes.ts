import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow } from "./users";

const locationFields = {
  lat: v.number(),
  lon: v.number(),
  address: v.optional(v.string()),
  placeId: v.optional(v.string()),
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db
      .query("saved_routes")
      .withIndex("byUserIdAndLastUsed", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    origin: v.object(locationFields),
    destination: v.object(locationFields),
    stops: v.array(v.object(locationFields)),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    return await ctx.db.insert("saved_routes", {
      userId: user._id,
      name: args.name,
      origin: args.origin,
      destination: args.destination,
      stops: args.stops,
      lastUsedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("saved_routes"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const route = await ctx.db.get(args.id);
    if (!route || route.userId !== user._id) {
      throw new Error("Route not found");
    }
    if (args.name) {
      await ctx.db.patch(args.id, { name: args.name });
    }
  },
});

export const remove = mutation({
  args: { id: v.id("saved_routes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const route = await ctx.db.get(args.id);
    if (!route || route.userId !== user._id) {
      throw new Error("Route not found");
    }
    await ctx.db.delete(args.id);
  },
});

export const markUsed = mutation({
  args: { id: v.id("saved_routes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const route = await ctx.db.get(args.id);
    if (!route || route.userId !== user._id) return;
    await ctx.db.patch(args.id, { lastUsedAt: Date.now() });
  },
});
