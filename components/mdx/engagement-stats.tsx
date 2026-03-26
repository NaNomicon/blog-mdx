"use client";

import { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Eye, Heart, ThumbsUp, Rocket } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CompactReactions, type CompactReactionItem } from "@/components/mdx/compact-reactions";
import { cn } from "@/lib/utils";

const REACTION_ICONS = {
  heart: Heart,
  like: ThumbsUp,
  rocket: Rocket,
} as const;

const REACTION_LABELS = {
  heart: "Heart",
  like: "Like",
  rocket: "Rocket",
} as const;

const MAX_VISIBLE_REACTIONS = 3;

export const EngagementStats = memo(function EngagementStats({ slug, className }: { slug: string; className?: string }) {
  const engagement = useQuery(api.engagement.getEngagement, { slug });

  if (!engagement) return (
    <div className={cn("flex items-center gap-4 text-xs font-medium text-muted-foreground animate-pulse", className)}>
      <div className="h-4 w-12 bg-muted rounded" />
      <div className="h-4 w-12 bg-muted rounded" />
    </div>
  );

  const views = engagement.views;
  const reactions = engagement.reactions
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const reactionItems: CompactReactionItem[] = reactions.map((reaction) => {
    const Icon = REACTION_ICONS[reaction.type as keyof typeof REACTION_ICONS];
    const label = REACTION_LABELS[reaction.type as keyof typeof REACTION_LABELS];

    return {
      type: reaction.type,
      count: reaction.count,
      label,
      icon: Icon ? (
        <Icon className="h-3.5 w-3.5 fill-muted-foreground/20" />
      ) : (
        <span className="text-sm leading-none">{reaction.type}</span>
      ),
      tooltipIcon: Icon ? (
        <Icon className="h-3.5 w-3.5 fill-primary-foreground/20" />
      ) : (
        <span className="text-sm leading-none">{reaction.type}</span>
      ),
    };
  });

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-4 text-xs font-medium text-muted-foreground", className)}>
        <div className="flex items-center gap-1.5" title="Views">
          <Eye className="h-3.5 w-3.5" />
          <span>{views}</span>
        </div>

        <CompactReactions
          reactions={reactionItems}
          maxVisible={MAX_VISIBLE_REACTIONS}
          panelClassName="w-auto min-w-[10rem] rounded-xl border border-border/60 bg-background/95 p-2 text-foreground shadow-lg backdrop-blur"
          panelSide="bottom"
          panelSideOffset={8}
          renderReaction={(reaction) => (
            <div key={reaction.type} className="flex items-center gap-1.5" title={reaction.label ?? reaction.type}>
              {reaction.icon}
              <span>{reaction.count}</span>
            </div>
          )}
          renderOverflowTrigger={(hiddenCount) => (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-sm text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`Show ${hiddenCount} more reactions`}
            >
              <span>+{hiddenCount}</span>
            </button>
          )}
          renderPanelReaction={(reaction) => (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/50 px-2 py-1.5 text-xs text-foreground">
              <div className="flex min-w-0 items-center gap-1.5">
                {reaction.tooltipIcon ?? reaction.icon}
                {reaction.label ? <span className="truncate">{reaction.label}</span> : null}
              </div>
              <span className="font-semibold">{reaction.count}</span>
            </div>
          )}
        />
      </div>
    </TooltipProvider>
  );
});
