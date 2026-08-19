import type { Id } from "@/convex/_generated/dataModel";

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
