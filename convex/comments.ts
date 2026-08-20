import { v, ConvexError } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { auth } from "./auth";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";
import { checkCommentRateLimit, checkVoteRateLimit } from "./rateLimits";
import { OWNER_USERNAME } from "../lib/comments";

const commentReturnValidator = v.object({
  _id: v.id("comments"),
  postSlug: v.string(),
  parentId: v.union(v.id("comments"), v.null()),
  authorId: v.id("users"),
  username: v.string(),
  content: v.string(),
  depth: v.number(),
  score: v.number(),
  isEdited: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
  deletedAt: v.union(v.number(), v.null()),
  userVote: v.union(v.literal("up"), v.literal("down"), v.null()),
  replyCount: v.number(),
});

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;
const EDIT_WINDOW_MS = 15 * 60 * 1000;

export const addComment = mutation({
  args: v.object({
    postSlug: v.string(),
    parentId: v.optional(v.union(v.id("comments"), v.null())),
    content: v.string(),
  }),
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Rate limit before any DB work so username-less users burn tokens, not lookups.
    await checkCommentRateLimit(ctx);

    // Resolve username server-side from the usernames row — never accept from client.
    const profile = await ctx.db
      .query("usernames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!profile) throw new Error("Set a username first");

    const content = args.content.trim();
    if (!content) throw new Error("Comment content cannot be empty");

    // Schema parentId is v.optional (undefined for top-level); null must become undefined.
    const parentId = args.parentId ?? undefined;

    let depth = 0;
    let parent: Doc<"comments"> | null = null;
    if (parentId) {
      parent = await ctx.db.get(parentId);
      if (!parent) throw new Error("Parent comment not found");
      if (parent.postSlug !== args.postSlug)
        throw new Error("Parent comment belongs to a different post");
      if (parent.depth >= 3)
        throw new Error("Maximum nesting depth reached (4 levels)");
      // Replies to deleted comments allowed (Reddit pattern) — no deletedAt check.
      depth = parent.depth + 1;
    }

    const now = Date.now();
    const id = await ctx.db.insert("comments", {
      postSlug: args.postSlug,
      parentId,
      authorId: userId,
      username: profile.displayName,
      content,
      depth,
      score: 0,
      replyCount: 0,
      isEdited: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });

    if (parent) {
      await ctx.db.patch(parent._id, { replyCount: parent.replyCount + 1 });
    }

    return id;
  },
});

export const editComment = mutation({
  args: v.object({
    commentId: v.id("comments"),
    content: v.string(),
  }),
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== userId) throw new Error("Not your comment");
    if (comment.deletedAt) throw new Error("Cannot edit a deleted comment");

    if (Date.now() - comment.createdAt > EDIT_WINDOW_MS) {
      throw new ConvexError({
        kind: "editExpired",
        message: "Edit window expired",
      });
    }

    const content = args.content.trim();
    if (!content) throw new Error("Comment content cannot be empty");

    await ctx.db.patch(args.commentId, {
      content,
      isEdited: true,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteComment = mutation({
  args: v.object({ commentId: v.id("comments") }),
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.authorId !== userId) throw new Error("Not your comment");

    await ctx.db.patch(args.commentId, {
      deletedAt: Date.now(),
      content: "",
    });
    return null;
  },
});

export const voteComment = mutation({
  args: v.object({
    commentId: v.id("comments"),
    direction: v.union(v.literal("up"), v.literal("down")),
  }),
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await checkVoteRateLimit(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    if (comment.deletedAt) throw new Error("Cannot vote on a deleted comment");

    // OCC retries re-execute the whole handler — read score fresh, don't cache it.
    // .collect() not .unique(): Convex indexes aren't unique constraints.
    const existing = await ctx.db
      .query("comment_votes")
      .withIndex("by_comment_voter", (q) =>
        q.eq("commentId", args.commentId).eq("voterId", userId)
      )
      .collect();

    let scoreDelta = 0;

    if (existing.length === 0) {
      await ctx.db.insert("comment_votes", {
        commentId: args.commentId,
        voterId: userId,
        direction: args.direction,
        createdAt: Date.now(),
      });
      scoreDelta = args.direction === "up" ? 1 : -1;
    } else {
      // N > 1 means a duplicate slipped through OCC — keep first, delete the rest.
      for (const dup of existing.slice(1)) {
        await ctx.db.delete(dup._id);
      }
      const vote = existing[0];
      if (vote.direction === args.direction) {
        await ctx.db.delete(vote._id);
        scoreDelta = args.direction === "up" ? -1 : 1;
      } else {
        await ctx.db.patch(vote._id, { direction: args.direction });
        scoreDelta = args.direction === "up" ? 2 : -2;
      }
    }

    await ctx.db.patch(args.commentId, {
      score: comment.score + scoreDelta,
    });
    return null;
  },
});

export const setUsername = mutation({
  args: v.object({
    username: v.string(),
    token: v.optional(v.string()),
  }),
  returns: v.null(),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const username = args.username.trim();
    if (!USERNAME_REGEX.test(username))
      throw new Error("Username must be 3-30 characters, alphanumeric + underscore");

    const usernameLower = username.toLowerCase();

    if (usernameLower === OWNER_USERNAME) {
      if (args.token !== process.env.AUTHOR_VERIFICATION_TOKEN)
        throw new ConvexError({
          kind: "ownerTokenInvalid",
          message: "Invalid author verification token",
        });
    }

    const existing = await ctx.db
      .query("usernames")
      .withIndex("by_username", (q) => q.eq("username", usernameLower))
      .first();
    if (existing && existing.userId !== userId) {
      throw new ConvexError({
        kind: "usernameTaken",
        message: "Username taken",
      });
    }

    const owned = await ctx.db
      .query("usernames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (owned) {
      await ctx.db.delete(owned._id);
    }

    await ctx.db.insert("usernames", {
      username: usernameLower,
      displayName: username,
      userId,
      createdAt: Date.now(),
    });
    return null;
  },
});

export const getComments = query({
  args: v.object({
    postSlug: v.string(),
    sort: v.union(v.literal("newest"), v.literal("oldest"), v.literal("top")),
    paginationOpts: paginationOptsValidator,
  }),
  returns: paginationResultValidator(commentReturnValidator),
  handler: async (ctx, args) => {
    let base;
    if (args.sort === "top") {
      base = ctx.db
        .query("comments")
        .withIndex("by_slug_score_createdAt", (q) => q.eq("postSlug", args.postSlug))
        .order("desc");
    } else {
      base = ctx.db
        .query("comments")
        .withIndex("by_slug_createdAt", (q) => q.eq("postSlug", args.postSlug))
        .order(args.sort === "oldest" ? "asc" : "desc");
    }

    // Top-level only — the slug indexes don't cover parentId, so filter it out.
    // ponytail: .filter() runs post-index in memory, so a page can be sparse on
    // reply-heavy posts (20 index rows may yield <20 top-level comments). Add a
    // compound by_slug_parent_createdAt index (or isTopLevel field) if that matters.
    const paginated = await base
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .paginate(args.paginationOpts);

    return {
      ...paginated,
      page: paginated.page.map((doc) => ({
        _id: doc._id,
        postSlug: doc.postSlug,
        parentId: doc.parentId ?? null,
        authorId: doc.authorId,
        username: doc.username,
        content: doc.content,
        depth: doc.depth,
        score: doc.score,
        isEdited: doc.isEdited,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        deletedAt: doc.deletedAt ?? null,
        userVote: null,
        replyCount: doc.replyCount,
      })),
    };
  },
});

export const getCommentCount = query({
  args: v.object({ postSlug: v.string() }),
  returns: v.number(),
  handler: async (ctx, args) => {
    // ponytail: counts ALL comments (incl. replies + deleted) for the post via
    // the by_slug_createdAt index. Post's total comment count; not just top-level.
    const docs = await ctx.db
      .query("comments")
      .withIndex("by_slug_createdAt", (q) => q.eq("postSlug", args.postSlug))
      .collect();
    return docs.length;
  },
});

export const getReplies = query({
  args: v.object({ parentId: v.id("comments") }),
  returns: v.array(commentReturnValidator),
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("comments")
      .withIndex("by_parent_createdAt", (q) => q.eq("parentId", args.parentId))
      .order("asc")
      .collect();

    return docs.map((doc) => ({
      _id: doc._id,
      postSlug: doc.postSlug,
      parentId: doc.parentId ?? null,
      authorId: doc.authorId,
      username: doc.username,
      content: doc.content,
      depth: doc.depth,
      score: doc.score,
      isEdited: doc.isEdited,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt ?? null,
      userVote: null,
      replyCount: doc.replyCount,
    }));
  },
});

export const getUserVotes = query({
  args: v.object({ commentIds: v.array(v.id("comments")) }),
  returns: v.array(
    v.object({
      commentId: v.id("comments"),
      direction: v.union(v.literal("up"), v.literal("down")),
    })
  ),
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    // Parallel per-ID lookups via by_comment_voter (no by_voter index exists).
    const votes = await Promise.all(
      args.commentIds.map((commentId) =>
        ctx.db
          .query("comment_votes")
          .withIndex("by_comment_voter", (q) =>
            q.eq("commentId", commentId).eq("voterId", userId)
          )
          .first()
      )
    );

    return votes
      .filter((v) => v !== null)
      .map((v) => ({ commentId: v!.commentId, direction: v!.direction }));
  },
});

export const getUserProfile = query({
  args: {},
  returns: v.union(
    v.object({
      userId: v.id("users"),
      username: v.string(),
      displayName: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("usernames")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (!profile) return null;

    return {
      userId,
      username: profile.username,
      displayName: profile.displayName,
    };
  },
});
