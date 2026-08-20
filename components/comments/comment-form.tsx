"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { isRateLimitError } from "@convex-dev/rate-limiter";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { CommentMarkdown } from "@/components/comments/comment-markdown";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  postSlug: string;
  parentId?: Id<"comments"> | null;
  username: string | null;
  mode?: "create" | "edit";
  commentId?: Id<"comments">;
  initialContent?: string;
  onSubmitted?: () => void;
  onEdited?: () => void;
  onCancel?: () => void;
}

type Tab = "write" | "preview";

export function CommentForm({
  postSlug,
  parentId,
  username,
  mode = "create",
  commentId,
  initialContent = "",
  onSubmitted,
  onEdited,
  onCancel,
}: CommentFormProps) {
  const t = useTranslations("Comments");
  const addComment = useMutation(api.comments.addComment);
  const editComment = useMutation(api.comments.editComment);
  const { ensureAuthenticated } = useAnonymousAuth();

  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<Tab>("write");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === "edit";

  // Username is rendered by the parent (CommentSection) as its own picker.
  // Rendering a picker here with a noop callback would dead-end the flow.
  if (!username) {
    return null;
  }

  const submit = async () => {
    if (!content.trim() || submitting) return;
    const authed = await ensureAuthenticated();
    if (!authed) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit && commentId) {
        await editComment({ commentId, content });
        onEdited?.();
      } else {
        await addComment({ postSlug, parentId: parentId ?? null, content });
        setContent("");
        onSubmitted?.();
      }
    } catch (err) {
      if (isRateLimitError(err)) {
        toast.error(t("error.rateLimit"));
        setError(t("error.rateLimit"));
      } else if (err instanceof ConvexError && err.data?.kind === "editExpired") {
        toast.error(t("error.editExpired"));
        setError(t("error.editExpired"));
      } else {
        toast.error(t("error.generic"));
        setError(t("error.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {parentId && (
        <p className="text-xs text-muted-foreground">{t("form.replyingTo", { username })}</p>
      )}

      <div role="tablist" aria-label="markdown" className="flex gap-1">
        {(["write", "preview"] as Tab[]).map((tabs) => (
          <button
            key={tabs}
            type="button"
            role="tab"
            aria-selected={tab === tabs}
            onClick={() => setTab(tabs)}
            className={cn(
              "rounded px-2 py-1 text-xs",
              tab === tabs
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tabs === "write" ? "Write" : t("form.preview")}
          </button>
        ))}
      </div>

      {tab === "write" ? (
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("form.placeholder")}
          rows={4}
          className="w-full"
        />
      ) : (
        <div className="rounded-md border bg-muted/40 px-3 py-2">
          <CommentMarkdown content={content} />
        </div>
      )}

      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          {submitting
            ? t("form.saving")
            : isEdit
              ? t("form.save")
              : t("form.submit")}
        </Button>
        {isEdit && onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t("form.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
