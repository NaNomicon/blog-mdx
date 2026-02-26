import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Look up cached OG metadata for a given URL.
 * Returns projected fields only (excludes _id / _creationTime).
 */
export const getByUrl = query({
  args: { url: v.string() },
  returns: v.union(
    v.object({
      url: v.string(),
      title: v.string(),
      description: v.string(),
      fetchedAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("og_cache")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();
    if (!doc) return null;
    return {
      url: doc.url,
      title: doc.title,
      description: doc.description,
      fetchedAt: doc.fetchedAt,
    };
  },
});

/**
 * Insert or update OG metadata for a given URL.
 * Always refreshes `fetchedAt` to the current time.
 */
export const upsert = mutation({
  args: {
    url: v.string(),
    title: v.string(),
    description: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("og_cache")
      .withIndex("by_url", (q) => q.eq("url", args.url))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        description: args.description,
        fetchedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("og_cache", {
        url: args.url,
        title: args.title,
        description: args.description,
        fetchedAt: Date.now(),
      });
    }

    return null;
  },
});
