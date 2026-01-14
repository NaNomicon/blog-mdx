"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, ThumbsUp, Rocket, Share2, Plus } from "lucide-react";
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

export function Engagement({ slug }: { slug: string }) {
  const engagement = useQuery(api.engagement.getEngagement, { slug });
  const userReactions = useQuery(api.engagement.getUserReactions, { slug }) ?? [];
  const toggleReaction = useMutation(api.engagement.toggleReaction);
  const { resolvedTheme } = useTheme();

  const handleToggleReaction = async (reactionType: string) => {
    try {
      await toggleReaction({ slug, reactionType });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Failed to update reaction. Please try again.");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const views = engagement?.views ?? 0;
  const reactionsMap = new Map(
    engagement?.reactions.map((r) => [r.type, r.count]) ?? []
  );

  const emojiPickerTheme = resolvedTheme === "dark" ? Theme.DARK : Theme.LIGHT;

  return (
    <TooltipProvider>
      {/* Desktop Reaction Bar */}
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 flex-col items-center gap-4 z-50">
        <div className="flex flex-col items-center gap-1 mb-4 text-muted-foreground">
          <Eye className="h-5 w-5" />
          <span className="text-xs font-medium">{views}</span>
        </div>
        
        {PREDEFINED_REACTIONS.map(({ type, icon: Icon, label, emoji }) => {
          const count = reactionsMap.get(type) ?? 0;
          const isActive = userReactions.includes(type);
          
          return (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full transition-all duration-300",
                      isActive 
                        ? "bg-primary/10 text-primary hover:bg-primary/20" 
                        : "hover:bg-muted"
                    )}
                    onClick={() => handleToggleReaction(type)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.8 }}
                      animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    >
                      <Icon className={cn("h-6 w-6", isActive && "fill-current")} />
                    </motion.div>
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">{count}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{label} ({emoji})</p>
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Display active custom reactions for the user on desktop too */}
        <AnimatePresence>
          {userReactions
            .filter((type) => !PREDEFINED_REACTIONS.some((pr) => pr.type === type))
            .map((type) => (
              <motion.div
                key={type}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex flex-col items-center gap-1"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-full bg-primary/10 text-primary hover:bg-primary/20"
                  onClick={() => handleToggleReaction(type)}
                >
                  <span className="text-xl">{type}</span>
                </Button>
                <span className="text-xs font-medium text-muted-foreground">
                  {reactionsMap.get(type) ?? 0}
                </span>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Emoji Picker Button Desktop */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="w-auto p-0 border-none shadow-none" sideOffset={16}>
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                handleToggleReaction(emojiData.emoji);
              }}
              theme={emojiPickerTheme}
              lazyLoadEmojis={true}
              searchPlaceholder="Search emojis..."
            />
          </PopoverContent>
        </Popover>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full mt-4"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Share Post</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Mobile Sticky Engagement Bar */}
      <div className="lg:hidden fixed bottom-4 left-4 z-50 flex items-center gap-2 max-w-[calc(100vw-2rem)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1 bg-background/80 backdrop-blur-md border rounded-full p-1.5 shadow-lg overflow-x-auto no-scrollbar"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 text-muted-foreground border-r pr-3 flex-shrink-0">
            <Eye className="h-4 w-4" />
            <span className="text-sm font-medium">{views}</span>
          </div>

          <div className="flex items-center gap-1 px-1">
            {PREDEFINED_REACTIONS.map(({ type, icon: Icon }) => {
              const isActive = userReactions.includes(type);
              const count = reactionsMap.get(type) ?? 0;
              
              return (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-9 px-2 gap-1.5 rounded-full transition-all flex-shrink-0",
                    isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                  )}
                  onClick={() => handleToggleReaction(type)}
                >
                  <Icon className={cn("h-4 w-4", isActive && "fill-current")} />
                  {count > 0 && <span className="text-xs font-bold">{count}</span>}
                </Button>
              );
            })}

            {/* User's custom reactions on mobile */}
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
                      className="h-9 px-2 gap-1.5 rounded-full text-primary bg-primary/10 flex-shrink-0"
                      onClick={() => handleToggleReaction(type)}
                    >
                      <span className="text-base leading-none">{type}</span>
                      <span className="text-xs font-bold">{reactionsMap.get(type)}</span>
                    </Button>
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Emoji Picker Button Mobile */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full text-muted-foreground flex-shrink-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-[min(350px,calc(100vw-2rem))] p-0 border-none shadow-none" sideOffset={16}>
                <EmojiPicker
                  onEmojiClick={(emojiData) => {
                    handleToggleReaction(emojiData.emoji);
                  }}
                  theme={emojiPickerTheme}
                  lazyLoadEmojis={true}
                  searchPlaceholder="Search emojis..."
                  width="100%"
                  height={400}
                />
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
