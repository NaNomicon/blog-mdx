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

  og_cache: defineTable({
    url: v.string(), // full URL (key for lookup)
    title: v.string(), // OG title or page <title> fallback
    description: v.string(), // OG description or empty string
    fetchedAt: v.number(), // Unix timestamp ms (Date.now())
  }).index("by_url", ["url"]),

  view_events: defineTable({
    slug: v.string(),
    userId: v.id("users"),
  }).index("by_slug_and_userId", ["slug", "userId"]),

  comments: defineTable({
    postSlug: v.string(),
    parentId: v.optional(v.id("comments")),
    authorId: v.id("users"),
    username: v.string(),
    content: v.string(),
    depth: v.number(),
    score: v.number(),
    replyCount: v.number(),
    isEdited: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_slug_createdAt", ["postSlug", "createdAt"])
    .index("by_slug_score_createdAt", ["postSlug", "score", "createdAt"])
    .index("by_parent_createdAt", ["parentId", "createdAt"])
    .index("by_author", ["authorId"]),

  comment_votes: defineTable({
    commentId: v.id("comments"),
    voterId: v.id("users"),
    direction: v.union(v.literal("up"), v.literal("down")),
    createdAt: v.number(),
  }).index("by_comment_voter", ["commentId", "voterId"]),

  usernames: defineTable({
    username: v.string(),
    displayName: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_username", ["username"])
    .index("by_user", ["userId"]),
});
