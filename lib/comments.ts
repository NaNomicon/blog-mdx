import type { Id } from "../convex/_generated/dataModel";

// 0-indexed nesting cap (depth 3 = 4 levels). Server enforces in addComment
// (rejects when parent.depth >= 3); clients use it to hide reply/expand UI.
export const MAX_COMMENT_DEPTH = 3;

// Reserved blog-owner username (case-insensitive: nanomicon/NaNomicon/…).
// Only claimable via a server-side verification token (see convex/comments.ts
// setUsername). Comments by this username get the green "Owner" badge.
export const OWNER_USERNAME = "nanomicon";

export const isOwnerUsername = (username: string) =>
  username.toLowerCase() === OWNER_USERNAME;

export interface CommentWithMeta {
  _id: Id<"comments">;
  postSlug: string;
  parentId: Id<"comments"> | null;
  authorId: Id<"users">;
  username: string;
  content: string;
  depth: number;
  score: number;
  isEdited: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt: number | null;
  userVote: "up" | "down" | null;
  replyCount: number;
}

export type CommentCallback = (commentId: Id<"comments">) => void;
