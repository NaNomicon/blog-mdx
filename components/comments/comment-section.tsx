"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@/convex/_generated/api";
import type { CommentWithMeta } from "@/lib/comments";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentThread } from "@/components/comments/comment-thread";
import { UsernamePicker } from "@/components/comments/username-picker";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { generateRandomUsername } from "@/lib/username-generator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Sort = "newest" | "oldest" | "top";

const SORTS: Sort[] = ["newest", "oldest", "top"];

export function CommentSection({ postSlug }: { postSlug: string }) {
  const t = useTranslations("Comments");
  const { isAuthenticated, isLoading, ensureAuthenticated } = useAnonymousAuth();

  const [sort, setSort] = useState<Sort>("newest");
  const [claimedUsername, setClaimedUsername] = useState<string | null>(null);

  const profile = useQuery(api.comments.getUserProfile);
  const username = claimedUsername ?? profile?.displayName ?? null;
  const currentUserId = profile?.userId ?? null;

  const setUsername = useMutation(api.comments.setUsername);

  // Auto-claim a random username once signed in, so the comment input is
  // available immediately on a fresh (no profile) session.
  const autoClaimedRef = useRef(false);
  useEffect(() => {
    if (username || !isAuthenticated || autoClaimedRef.current) return;
    autoClaimedRef.current = true;
    const name = generateRandomUsername();
    setUsername({ username: name })
      .then(() => setClaimedUsername(name))
      .catch(() => {
        autoClaimedRef.current = false;
      });
  }, [username, isAuthenticated, setUsername]);

  const { results, status, loadMore, isLoading: commentsLoading } = usePaginatedQuery(
    api.comments.getComments,
    { postSlug, sort },
    { initialNumItems: 20 }
  );

  const commentIds = useMemo(() => (results ?? []).map((c) => c._id), [results]);
  const votes = useQuery(
    api.comments.getUserVotes,
    isAuthenticated && commentIds.length > 0 ? { commentIds } : "skip"
  );
  const votesMap = Object.fromEntries((votes ?? []).map((v) => [v.commentId, v.direction]));

  const mergedComments = useMemo<CommentWithMeta[]>(
    () => (results ?? []).map((c) => ({ ...c, userVote: votesMap[c._id] ?? null })),
    [results, votesMap]
  );

  const handleFocus = async () => {
    await ensureAuthenticated();
  };

  const noop = () => {};

  return (
    <section
      id="comments"
      className="mx-auto w-full max-w-2xl scroll-mt-20 space-y-4"
      aria-label={t("section.title")}
    >
      <h2 className="text-lg font-semibold">{t("section.title")}</h2>

      <div onFocusCapture={handleFocus}>
        {username && (
          <div className="mb-2">
            <UsernamePicker currentUsername={username} onUsernameChange={setClaimedUsername} />
          </div>
        )}
        <CommentForm postSlug={postSlug} username={username} onSubmitted={noop} />
      </div>

      <div role="group" aria-label="sort" className="flex gap-1">
        {SORTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSort(s)}
            aria-pressed={sort === s}
            className={cn(
              "rounded px-2 py-1 text-xs",
              sort === s ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(`sort.${s}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : commentsLoading && mergedComments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : mergedComments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-6">
          {mergedComments.map((comment) => (
            <li key={comment._id}>
              <CommentThread
                comment={comment}
                depth={0}
                currentUserId={currentUserId}
                username={username}
                onReply={noop}
                onEdit={noop}
                onDelete={noop}
              />
            </li>
          ))}
        </ul>
      )}

      {status === "CanLoadMore" && (
        <Button variant="outline" size="sm" onClick={() => loadMore(20)}>
          {t("loadMore")}
        </Button>
      )}
    </section>
  );
}
