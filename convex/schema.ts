import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  views: defineTable({
    slug: v.string(),
    count: v.number(),
    lastUpdated: v.number(),
  }).index("by_slug", ["slug"]),

  reactions: defineTable({
    slug: v.string(),
    type: v.string(), // emoji or reaction id
    count: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_slug_and_type", ["slug", "type"]),

  user_reactions: defineTable({
    slug: v.string(),
    reactionType: v.string(),
    userId: v.id("users"), // linked to the auth user
  }).index("by_slug", ["slug"])
    .index("by_slug_and_userId", ["slug", "userId"])
    .index("by_slug_and_userId_and_reactionType", ["slug", "userId", "reactionType"]),

  view_events: defineTable({
    slug: v.string(),
    userId: v.id("users"),
  }).index("by_slug_and_userId", ["slug", "userId"]),
});
