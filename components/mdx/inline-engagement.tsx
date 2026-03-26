"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ThumbsUp, Rocket, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Theme } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CompactReactions, type CompactReactionItem } from "@/components/mdx/compact-reactions";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const PREDEFINED_REACTIONS = [
  { type: "heart", icon: Heart, label: "Heart", emoji: "❤️" },
  { type: "like", icon: ThumbsUp, label: "Like", emoji: "👍" },
  { type: "rocket", icon: Rocket, label: "Rocket", emoji: "🚀" },
];

const MAX_VISIBLE_CUSTOM_REACTIONS = 3;

export function InlineEngagement({ slug, className }: { slug: string; className?: string }) {
  const engagement = useQuery(api.engagement.getEngagement, { slug });
  const userReactions = useQuery(api.engagement.getUserReactions, { slug }) ?? [];
  const toggleReaction = useMutation(api.engagement.toggleReaction);
  const { resolvedTheme } = useTheme();

  const handleToggleReaction = async (reactionType: string) => {
    try {
      await toggleReaction({ slug, reactionType });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Failed to update reaction.");
    }
  };

  const views = engagement?.views ?? 0;
  const reactionsMap = new Map(
    engagement?.reactions.map((r) => [r.type, r.count]) ?? []
  );
  const customReactions = (engagement?.reactions ?? [])
    .filter((reaction) => reaction.count > 0)
    .filter((reaction) => !PREDEFINED_REACTIONS.some((predefined) => predefined.type === reaction.type))
    .sort((a, b) => b.count - a.count);
  const customReactionItems: CompactReactionItem[] = customReactions.map((reaction) => ({
    type: reaction.type,
    count: reaction.count,
    label: reaction.type,
    icon: <span className="text-sm leading-none">{reaction.type}</span>,
    tooltipIcon: <span className="text-sm leading-none">{reaction.type}</span>,
  }));

  const emojiPickerTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-4 py-4 border-y border-border/40 text-muted-foreground", className)}>
        {/* View Count */}
        <div className="flex items-center gap-1.5 px-2 py-1 text-sm font-medium">
          <Eye className="h-4 w-4" />
          <span>{views} views</span>
        </div>

        <div className="h-4 w-px bg-border/60" />

        {/* Reactions */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {PREDEFINED_REACTIONS.map(({ type, icon: Icon, label, emoji }) => {
            const isActive = userReactions.includes(type);
            const count = reactionsMap.get(type) ?? 0;
            
            return (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-8 px-2 gap-1.5 rounded-md transition-all hover:bg-muted",
                      isActive ? "text-primary bg-primary/5 hover:bg-primary/10" : "text-muted-foreground"
                    )}
                    onClick={() => handleToggleReaction(type)}
                  >
                    <Icon className={cn("h-3.5 w-3.5", isActive && "fill-current")} />
                    {count > 0 && <span className="text-xs font-bold">{count}</span>}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{label} {emoji}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

            <CompactReactions
              reactions={customReactionItems}
              maxVisible={MAX_VISIBLE_CUSTOM_REACTIONS}
              panelClassName="w-auto min-w-[10rem] rounded-xl border border-border/60 bg-background/95 p-2 text-foreground shadow-lg backdrop-blur"
              renderReaction={(reaction) => {
                const isActive = userReactions.includes(reaction.type);

              return (
                <AnimatePresence key={reaction.type} mode="popLayout">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-2 gap-1.5 rounded-md transition-all hover:bg-muted",
                        isActive ? "text-primary bg-primary/5 hover:bg-primary/10" : "text-muted-foreground"
                      )}
                      onClick={() => handleToggleReaction(reaction.type)}
                    >
                      {reaction.icon}
                      <span className="text-xs font-bold">{reaction.count}</span>
                    </Button>
                  </motion.div>
                </AnimatePresence>
              );
            }}
            renderOverflowTrigger={(hiddenCount) => (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 gap-1.5 rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
              >
                <span className="text-xs font-bold">+{hiddenCount}</span>
              </Button>
            )}
              renderPanelReaction={(reaction) => (
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/50 px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted",
                    userReactions.includes(reaction.type) && "border-primary/40 bg-primary/10 text-primary"
                  )}
                  onClick={() => handleToggleReaction(reaction.type)}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    {reaction.tooltipIcon ?? reaction.icon}
                  </div>
                  <span className="font-semibold">{reaction.count}</span>
                </button>
              )}
            />

          {/* Add Reaction Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-md text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" className="w-auto p-0 border-none shadow-none" sideOffset={8}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  handleToggleReaction(emojiData.emoji);
                }}
                theme={emojiPickerTheme}
                lazyLoadEmojis={true}
                searchPlaceholder="Search emojis..."
                width={300}
                height={400}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
