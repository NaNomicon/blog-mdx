"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CommentWithMeta, CommentCallback } from "@/lib/comments";
import { MAX_COMMENT_DEPTH } from "@/lib/comments";
import { CommentCard } from "@/components/comments/comment-card";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { Button } from "@/components/ui/button";

interface CommentThreadProps {
  comment: CommentWithMeta;
  depth: number;
  currentUserId: Id<"users"> | null;
  username: string | null;
  onReply: CommentCallback;
  onEdit: CommentCallback;
  onDelete: CommentCallback;
}

export function CommentThread({
  comment,
  depth,
  currentUserId,
  username,
  onReply,
  onEdit,
  onDelete,
}: CommentThreadProps) {
  const t = useTranslations("Comments");
  const { isAuthenticated } = useAnonymousAuth();
  const [expanded, setExpanded] = useState(depth === 0);
  const [collapsed, setCollapsed] = useState(false);

  const canExpand = comment.replyCount > 0;
  const isLeaf = depth >= MAX_COMMENT_DEPTH;

  const replies = useQuery(
    api.comments.getReplies,
    canExpand && expanded && !collapsed ? { parentId: comment._id } : "skip"
  );
  const votes = useQuery(
    api.comments.getUserVotes,
    isAuthenticated && canExpand && expanded && !collapsed && replies && replies.length > 0
      ? { commentIds: replies.map((r) => r._id) }
      : "skip"
  );

  const votesMap = Object.fromEntries((votes ?? []).map((v) => [v.commentId, v.direction]));
  const mergedReplies = replies?.map((r) => ({ ...r, userVote: votesMap[r._id] ?? null }));

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="flex w-full items-center gap-1.5 rounded px-1 py-0.5 text-left text-xs text-muted-foreground hover:bg-muted/40"
      >
        <ChevronDown className="h-3 w-3 shrink-0" />
        <span className="truncate font-medium">
          {comment.username} · {t("showReplies", { count: comment.replyCount })}
        </span>
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <button
          type="button"
          aria-label="Collapse thread"
          onClick={() => setCollapsed(true)}
          className="w-1 shrink-0 cursor-pointer rounded-full bg-border/40 transition-colors hover:bg-border"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <CommentCard
            comment={comment}
            depth={depth}
            currentUserId={currentUserId}
            username={username}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          {canExpand && !isLeaf && (
            <div className="pl-2.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    {t("hideReplies")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    {t("showReplies", { count: comment.replyCount })}
                  </>
                )}
              </Button>
            </div>
          )}

          {expanded && mergedReplies && mergedReplies.length > 0 && (
            <ul className="space-y-5">
              {mergedReplies.map((reply) => (
                <li key={reply._id}>
                  <CommentThread
                    comment={reply}
                    depth={depth + 1}
                    currentUserId={currentUserId}
                    username={username}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
