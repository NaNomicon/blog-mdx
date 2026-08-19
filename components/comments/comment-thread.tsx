"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { CommentWithMeta, CommentCallback } from "@/lib/comments";
import { CommentCard } from "@/components/comments/comment-card";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { Button } from "@/components/ui/button";

const MAX_DEPTH = 3;

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
  const [expanded, setExpanded] = useState(false);

  const canExpand = comment.replyCount > 0;
  const isLeaf = depth >= MAX_DEPTH;

  const replies = useQuery(
    api.comments.getReplies,
    canExpand && expanded ? { parentId: comment._id } : "skip"
  );
  const votes = useQuery(
    api.comments.getUserVotes,
    isAuthenticated && canExpand && expanded && replies && replies.length > 0
      ? { commentIds: replies.map((r) => r._id) }
      : "skip"
  );

  const votesMap = Object.fromEntries((votes ?? []).map((v) => [v.commentId, v.direction]));
  const mergedReplies = replies?.map((r) => ({ ...r, userVote: votesMap[r._id] ?? null }));

  return (
    <div className="space-y-2">
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
      )}

      {expanded && mergedReplies && mergedReplies.length > 0 && (
        <ul className="space-y-3 border-l border-border/40 pl-4">
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
  );
}
