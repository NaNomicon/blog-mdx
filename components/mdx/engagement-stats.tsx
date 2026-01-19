"use client";

import { memo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Eye, Heart, ThumbsUp, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const REACTION_ICONS = {
  heart: Heart,
  like: ThumbsUp,
  rocket: Rocket,
} as const;

export const EngagementStats = memo(function EngagementStats({ slug, className }: { slug: string; className?: string }) {
  const engagement = useQuery(api.engagement.getEngagement, { slug });

  if (!engagement) return (
    <div className={cn("flex items-center gap-4 text-xs font-medium text-muted-foreground animate-pulse", className)}>
      <div className="h-4 w-12 bg-muted rounded" />
      <div className="h-4 w-12 bg-muted rounded" />
    </div>
  );

  const views = engagement.views;
  const reactions = engagement.reactions.filter((r) => r.count > 0);

  return (
    <div className={cn("flex items-center gap-4 text-xs font-medium text-muted-foreground", className)}>
      <div className="flex items-center gap-1.5" title="Views">
        <Eye className="h-3.5 w-3.5" />
        <span>{views}</span>
      </div>
      
      {reactions.map((r) => {
        const Icon = REACTION_ICONS[r.type as keyof typeof REACTION_ICONS];
        return (
          <div key={r.type} className="flex items-center gap-1.5" title={r.type}>
            {Icon ? (
              <Icon className="h-3.5 w-3.5 fill-muted-foreground/20" />
            ) : (
              <span className="text-sm leading-none">{r.type}</span>
            )}
            <span>{r.count}</span>
          </div>
        );
      })}
    </div>
  );
});
