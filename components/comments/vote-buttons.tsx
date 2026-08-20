"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { isRateLimitError } from "@convex-dev/rate-limiter";
import type { Id } from "@/convex/_generated/dataModel";

interface VoteButtonsProps {
  commentId: Id<"comments">;
  score: number;
  userVote: "up" | "down" | null;
}

export function VoteButtons({ commentId, score, userVote }: VoteButtonsProps) {
  const t = useTranslations("Comments");
  const voteComment = useMutation(api.comments.voteComment);
  const { ensureAuthenticated } = useAnonymousAuth();

  const [optimisticVote, setOptimisticVote] = useState<"up" | "down" | null>(userVote);
  const [optimisticScore, setOptimisticScore] = useState(score);
  const [inFlight, setInFlight] = useState(false);

  useEffect(() => {
    setOptimisticVote(userVote);
  }, [userVote]);
  useEffect(() => {
    setOptimisticScore(score);
  }, [score]);

  const handleVote = async (direction: "up" | "down") => {
    if (inFlight) return;

    // Deep in the tree — comment-section's lazy auth doesn't cover us.
    // First click signs in (returns false, no vote); user clicks again after.
    const authed = await ensureAuthenticated();
    if (!authed) return;

    const previousVote = optimisticVote;
    const previousScore = optimisticScore;
    let nextVote: "up" | "down" | null;
    let nextScore = previousScore;

    if (previousVote === direction) {
      nextVote = null;
      nextScore += direction === "up" ? -1 : 1;
    } else if (previousVote === null) {
      nextVote = direction;
      nextScore += direction === "up" ? 1 : -1;
    } else {
      nextVote = direction;
      nextScore += direction === "up" ? 2 : -2;
    }

    setOptimisticVote(nextVote);
    setOptimisticScore(nextScore);
    setInFlight(true);

    try {
      await voteComment({ commentId, direction });
    } catch (err) {
      setOptimisticVote(previousVote);
      setOptimisticScore(previousScore);
      toast.error(isRateLimitError(err) ? t("error.rateLimit") : t("error.generic"));
    } finally {
      setInFlight(false);
    }
  };

  return (
    <div className="flex items-center gap-0.5" aria-label="votes">
      <button
        type="button"
        onClick={() => handleVote("up")}
        disabled={inFlight}
        aria-pressed={optimisticVote === "up"}
        aria-label={t("vote.up")}
        className={cn(
          "rounded p-0.5 transition-colors",
          optimisticVote === "up"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground",
          inFlight && "opacity-50"
        )}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <span
        className={cn(
          "min-w-5 text-center text-sm font-semibold tabular-nums",
          optimisticScore > 0
            ? "text-green-600 dark:text-green-400"
            : optimisticScore < 0
              ? "text-red-600 dark:text-red-400"
              : "text-muted-foreground"
        )}
      >
        {optimisticScore}
      </span>
      <button
        type="button"
        onClick={() => handleVote("down")}
        disabled={inFlight}
        aria-pressed={optimisticVote === "down"}
        aria-label={t("vote.down")}
        className={cn(
          "rounded p-0.5 transition-colors",
          optimisticVote === "down"
            ? "text-red-500"
            : "text-muted-foreground hover:text-foreground",
          inFlight && "opacity-50"
        )}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  );
}
