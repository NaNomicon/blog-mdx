import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { auth } from "./auth";

/**
 * Increments the view count for a given slug, ensuring uniqueness per user.
 */
export const recordView = mutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      // If not authenticated, we can't track uniqueness reliably
      // But we should probably not increment at all or just increment anyway
      // Given the logic in ViewTracker, we expect to be authenticated.
      return null;
    }

    // Check if this user has already viewed this slug
    const existingEvent = await ctx.db
      .query("view_events")
      .withIndex("by_slug_and_userId", (q) =>
        q.eq("slug", args.slug).eq("userId", userId)
      )
      .unique();

    if (existingEvent) {
      // Already recorded this user's view for this post
      return null;
    }

    // Record the view event
    await ctx.db.insert("view_events", {
      slug: args.slug,
      userId: userId,
    });

    // Increment the aggregate count
    const existing = await ctx.db
      .query("views")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        count: existing.count + 1,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("views", {
        slug: args.slug,
        count: 1,
        lastUpdated: Date.now(),
      });
    }
    return null;
  },
});

/**
 * Gets engagement stats (views and aggregated reactions) for a slug.
 */
export const getEngagement = query({
  args: { slug: v.string() },
  returns: v.object({
    views: v.number(),
    reactions: v.array(
      v.object({
        type: v.string(),
        count: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const viewDoc = await ctx.db
      .query("views")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();

    return {
      views: viewDoc?.count ?? 0,
      reactions: reactions.map((r) => ({
        type: r.type,
        count: r.count,
      })),
    };
  },
});

/**
 * Toggles a reaction for the current user.
 */
export const toggleReaction = mutation({
  args: {
    slug: v.string(),
    reactionType: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingUserReaction = await ctx.db
      .query("user_reactions")
      .withIndex("by_slug_and_userId_and_reactionType", (q) =>
        q.eq("slug", args.slug).eq("userId", userId).eq("reactionType", args.reactionType)
      )
      .unique();

    const reactionDoc = await ctx.db
      .query("reactions")
      .withIndex("by_slug_and_type", (q) =>
        q.eq("slug", args.slug).eq("type", args.reactionType)
      )
      .unique();

    if (existingUserReaction) {
      // Remove reaction
      await ctx.db.delete(existingUserReaction._id);
      if (reactionDoc) {
        await ctx.db.patch(reactionDoc._id, {
          count: Math.max(0, reactionDoc.count - 1),
        });
      }
    } else {
      // Add reaction
      await ctx.db.insert("user_reactions", {
        slug: args.slug,
        userId,
        reactionType: args.reactionType,
      });

      if (reactionDoc) {
        await ctx.db.patch(reactionDoc._id, {
          count: reactionDoc.count + 1,
        });
      } else {
        await ctx.db.insert("reactions", {
          slug: args.slug,
          type: args.reactionType,
          count: 1,
        });
      }
    }

    return null;
  },
});

/**
 * Gets reactions the current user has already picked for a slug.
 */
export const getUserReactions = query({
  args: { slug: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    const userReactions = await ctx.db
      .query("user_reactions")
      .withIndex("by_slug_and_userId", (q) =>
        q.eq("slug", args.slug).eq("userId", userId)
      )
      .collect();

    return userReactions.map((ur) => ur.reactionType);
  },
});
