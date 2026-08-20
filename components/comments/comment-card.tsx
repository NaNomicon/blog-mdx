"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";
import { Reply, Pencil, Trash2, BadgeCheck } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { MAX_COMMENT_DEPTH, isOwnerUsername } from "@/lib/comments";
import type { CommentWithMeta, CommentCallback } from "@/lib/comments";
import { CommentMarkdown } from "@/components/comments/comment-markdown";
import { VoteButtons } from "@/components/comments/vote-buttons";
import { CommentForm } from "@/components/comments/comment-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const EDIT_WINDOW_MS = 15 * 60 * 1000;

interface CommentCardProps {
  comment: CommentWithMeta;
  depth: number;
  currentUserId: Id<"users"> | null;
  username: string | null;
  onReply: CommentCallback;
  onEdit: CommentCallback;
  onDelete: CommentCallback;
}

export function CommentCard({
  comment,
  depth,
  currentUserId,
  username,
  onReply,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const t = useTranslations("Comments");
  const deleteComment = useMutation(api.comments.deleteComment);

  const [replyOpen, setReplyOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editExpired, setEditExpired] = useState(false);

  const isOwner = currentUserId !== null && comment.authorId === currentUserId;
  const isDeleted = comment.deletedAt !== null;
  const isLeaf = depth >= MAX_COMMENT_DEPTH;

  const canEdit =
    isOwner && !editExpired && Date.now() - comment.createdAt < EDIT_WINDOW_MS && !isDeleted;

  // Hide the Edit button once the 15-min window elapses on a long-lived page.
  // Uses a dedicated editExpired state so the button re-renders away even if
  // the edit form is not open (setEditing(false) on an already-closed form is
  // a React no-op and would leave canEdit stale).
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!canEdit) return;
    const remaining = EDIT_WINDOW_MS - (Date.now() - comment.createdAt);
    if (remaining <= 0) return;
    timerRef.current = setTimeout(() => setEditExpired(true), remaining);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [canEdit, comment.createdAt]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteComment({ commentId: comment._id });
      setConfirmOpen(false);
      onDelete(comment._id);
    } catch {
      toast.error(t("error.generic"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          {!isDeleted && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm",
                  isOwnerUsername(comment.username)
                    ? "font-bold text-green-600 dark:text-green-400"
                    : "font-semibold text-foreground"
                )}
              >
                {comment.username}
              </span>
              {isOwnerUsername(comment.username) && (
                <span
                  className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400"
                  title={t("verified")}
                >
                  <BadgeCheck className="h-3.5 w-3.5" />
                  {t("verified")}
                </span>
              )}
              <span className="text-xs text-muted-foreground/60" aria-hidden="true">·</span>
              <span className="text-xs text-muted-foreground/60">
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground">{t("edited")}</span>
              )}
            </div>
          )}

          {isDeleted ? (
            <p className="text-sm italic text-muted-foreground">{t("deleted")}</p>
          ) : (
            <CommentMarkdown content={comment.content} className="text-sm text-foreground" />
          )}

          {!isDeleted && (
            <div className="flex items-center gap-2">
              <VoteButtons
                commentId={comment._id}
                score={comment.score}
                userVote={comment.userVote}
              />
              {!isLeaf && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setReplyOpen((v) => !v)}
                  aria-expanded={replyOpen}
                >
                  <Reply className="h-3 w-3" />
                  {t("reply")}
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setEditing((v) => !v)}
                  aria-label={t("edit")}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setConfirmOpen(true)}
                  aria-label={t("delete.label")}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {editing && !isDeleted && (
            <CommentForm
              postSlug={comment.postSlug}
              username={username}
              mode="edit"
              commentId={comment._id}
              initialContent={comment.content}
              onEdited={() => {
                setEditing(false);
                onEdit(comment._id);
              }}
              onCancel={() => setEditing(false)}
            />
          )}

          {replyOpen && !isLeaf && (
            <CommentForm
              postSlug={comment.postSlug}
              parentId={comment._id}
              username={username}
              onSubmitted={() => {
                setReplyOpen(false);
                onReply(comment._id);
              }}
            />
          )}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("delete.confirm")}</DialogTitle>
            <DialogDescription>{t("delete.label")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              {t("form.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {t("delete.label")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
