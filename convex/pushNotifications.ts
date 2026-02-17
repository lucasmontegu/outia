"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Sends a push notification via Expo Push API.
 */
export const sendPush = internalAction({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    data: v.optional(v.any()),
    alertId: v.optional(v.id("alerts")),
  },
  handler: async (ctx, args) => {
    // Get user's push token
    const user = await ctx.runQuery(internal.users.getInternal, {
      userId: args.userId,
    });
    if (!user?.expoPushToken) {
      console.warn("No push token for user", args.userId);
      return;
    }

    // Check if user has notifications enabled
    if (user.preferences?.notificationsEnabled === false) {
      return;
    }

    const message = {
      to: user.expoPushToken,
      sound: "default",
      title: args.title,
      body: args.body,
      data: args.data ?? {},
    };

    try {
      const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data?.status === "ok" && args.alertId) {
        await ctx.runMutation(internal.alerts.markSentAsPush, {
          alertId: args.alertId,
        });
      }

      if (result.data?.status === "error") {
        console.error("Push notification error:", result.data.message);
      }
    } catch (err) {
      console.error("Failed to send push notification:", err);
    }
  },
});
