"use client";

import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type CompactReactionItem = {
  type: string;
  count: number;
  label?: string;
  icon: ReactNode;
  tooltipIcon?: ReactNode;
};

type CompactReactionsProps = {
  reactions: CompactReactionItem[];
  maxVisible: number;
  renderReaction: (reaction: CompactReactionItem) => ReactNode;
  renderOverflowTrigger: (hiddenCount: number) => ReactElement;
  renderPanelReaction?: (reaction: CompactReactionItem) => ReactNode;
  showAllInPanel?: boolean;
  panelClassName?: string;
  panelSideOffset?: number;
  panelSide?: ComponentPropsWithoutRef<typeof PopoverContent>["side"];
  panelAlign?: ComponentPropsWithoutRef<typeof PopoverContent>["align"];
};

export function CompactReactions({
  reactions,
  maxVisible,
  renderReaction,
  renderOverflowTrigger,
  renderPanelReaction,
  showAllInPanel = true,
  panelClassName,
  panelSideOffset = 6,
  panelSide = "bottom",
  panelAlign = "center",
}: CompactReactionsProps) {
  const visibleReactions = reactions.slice(0, maxVisible);
  const hiddenReactions = reactions.slice(maxVisible);
  const panelReactions = showAllInPanel ? reactions : hiddenReactions;

  return (
    <>
      {visibleReactions.map((reaction) => renderReaction(reaction))}

      {hiddenReactions.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            {renderOverflowTrigger(hiddenReactions.length)}
          </PopoverTrigger>
          <PopoverContent
            align={panelAlign}
            className={panelClassName}
            side={panelSide}
            sideOffset={panelSideOffset}
          >
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {panelReactions.map((reaction) => (
                <div key={reaction.type} className="min-w-0">
                  {renderPanelReaction ? renderPanelReaction(reaction) : renderReaction(reaction)}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}
