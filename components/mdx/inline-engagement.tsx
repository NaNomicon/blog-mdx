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

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const PREDEFINED_REACTIONS = [
  { type: "heart", icon: Heart, label: "Heart", emoji: "❤️" },
  { type: "like", icon: ThumbsUp, label: "Like", emoji: "👍" },
  { type: "rocket", icon: Rocket, label: "Rocket", emoji: "🚀" },
];

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

          {/* User's custom reactions */}
          <AnimatePresence mode="popLayout">
            {userReactions
              .filter((type) => !PREDEFINED_REACTIONS.some((pr) => pr.type === type))
              .map((type) => (
                <motion.div
                  key={type}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1.5 rounded-md text-primary bg-primary/5 hover:bg-primary/10"
                    onClick={() => handleToggleReaction(type)}
                  >
                    <span className="text-sm leading-none">{type}</span>
                    <span className="text-xs font-bold">{reactionsMap.get(type)}</span>
                  </Button>
                </motion.div>
              ))}
          </AnimatePresence>

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
