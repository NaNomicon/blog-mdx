"use client";

import React, { useRef, useCallback } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LINK_TYPES, isLinkType } from "@/config/link-types";
import type { LinkType } from "@/config/link-types";
import postsIndex from "@/lib/data/posts-index.json";

// ---------------------------------------------------------------------------
// TooltipCard — pure presentational sub-component
// ---------------------------------------------------------------------------

interface TooltipCardProps {
  title?: string;
  description?: string;
  contextNote?: string | null;
  linkType?: LinkType | null;
  isExternal?: boolean;
  isLoading?: boolean;
}

function TooltipCard({
  title,
  description,
  contextNote,
  linkType,
  isLoading,
}: TooltipCardProps) {
  if (isLoading && !title) {
    return (
      <div className="p-3 space-y-2 min-w-[160px]">
        <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-2 bg-muted rounded animate-pulse w-full" />
        <div className="h-2 bg-muted rounded animate-pulse w-2/3" />
      </div>
    );
  }

  const typeConfig = linkType ? LINK_TYPES[linkType] : null;

  return (
    <div className="p-3 space-y-1.5 min-w-[160px] max-w-xs">
      {/* Type badge */}
      {typeConfig && (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded",
            typeConfig.tailwindBg,
            typeConfig.tailwindText
          )}
        >
          {typeConfig.label}
        </span>
      )}

      {/* Title */}
      {title && (
        <p className="text-sm font-semibold leading-snug text-popover-foreground">
          {title}
        </p>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description}
        </p>
      )}

      {/* Context note (from author annotation) */}
      {contextNote && (
        <p className="text-xs text-muted-foreground/80 italic border-t border-border/50 pt-1.5 mt-1.5">
          {contextNote}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// LinkTooltip — main exported component
// ---------------------------------------------------------------------------

interface LinkTooltipProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  children?: React.ReactNode;
}

export function LinkTooltip(props: LinkTooltipProps) {
  const { title: rawTitle, href = "", ...restProps } = props;

  // Parse type and note from title attribute
  let linkType: LinkType | null = null;
  let contextNote: string | null = null;
  if (rawTitle) {
    const pipeIdx = rawTitle.indexOf("|");
    if (pipeIdx !== -1) {
      const rawType = rawTitle.slice(0, pipeIdx).trim();
      const rawNote = rawTitle.slice(pipeIdx + 1).trim();
      if (isLinkType(rawType)) linkType = rawType;
      if (rawNote) contextNote = rawNote;
    } else {
      // No pipe: check if the whole thing is a type or just a note
      const trimmedTitle = rawTitle.trim();
      if (isLinkType(trimmedTitle)) {
        linkType = trimmedTitle;
      } else if (trimmedTitle) {
        contextNote = trimmedTitle;
      }
    }
  }

  // Link kind detection
  const isAnchor = href.startsWith("#");
  const isInternal =
    !isAnchor &&
    (href.startsWith("/") ||
      href.startsWith("https://nanomicon.com/") ||
      href.startsWith("http://nanomicon.com/"));
  const isExternal =
    !isAnchor &&
    !isInternal &&
    (href.startsWith("http://") || href.startsWith("https://"));

  // Anchor links: plain render (no tooltip)
  if (isAnchor) {
    return (
      <a href={href} {...restProps}>
        {props.children}
      </a>
    );
  }

  // Internal link data from static JSON
  // postsIndex is typed as Record<string, { title: string; description: string; href: string; type: string }>
  const internalData = isInternal
    ? (
        postsIndex as Record<
          string,
          { title: string; description: string; href: string; type: string }
        >
      )[href] ?? null
    : null;

  return (
    <LinkTooltipErrorBoundary href={href} restProps={restProps}>
      <LinkTooltipInner
        href={href}
        isInternal={isInternal}
        isExternal={isExternal}
        internalData={internalData}
        linkType={linkType}
        contextNote={contextNote}
        restProps={restProps}
      >
        {props.children}
      </LinkTooltipInner>
    </LinkTooltipErrorBoundary>
  );
}
class LinkTooltipErrorBoundary extends React.Component<
  { href: string; restProps: React.AnchorHTMLAttributes<HTMLAnchorElement>; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { href: string; restProps: React.AnchorHTMLAttributes<HTMLAnchorElement>; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.warn("LinkTooltip Convex Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <a href={this.props.href} {...this.props.restProps}>
          {this.props.children}
        </a>
      );
    }
    return this.props.children;
  }
}


// ---------------------------------------------------------------------------
// Inner component — isolates Convex hooks so they only run for external links
// ---------------------------------------------------------------------------

interface LinkTooltipInnerProps {
  href: string;
  isInternal: boolean;
  isExternal: boolean;
  internalData: { title: string; description: string; href: string; type: string } | null;
  linkType: LinkType | null;
  contextNote: string | null;
  restProps: React.AnchorHTMLAttributes<HTMLAnchorElement>;
  children?: React.ReactNode;
}

function LinkTooltipInner({
  href,
  isInternal,
  isExternal,
  internalData,
  linkType,
  contextNote,
  restProps,
  children,
}: LinkTooltipInnerProps) {
  // External link Convex data
  const externalData = useQuery(
    api.ogCache.getByUrl,
    isExternal ? { url: href } : "skip"
  );
  const [isFetchPending, setIsFetchPending] = React.useState(false);

  // Trigger fetch on first hover if data is null or stale (>30 days)
  const hasFetchedRef = useRef(false);
  const fetchOG = useAction(api.ogCacheActions.fetchAndCacheOG);
  const handleMouseEnter = useCallback(() => {
    if (!isExternal) return;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const isStale =
      externalData != null &&
      Date.now() - externalData.fetchedAt > THIRTY_DAYS_MS;
    if ((externalData === null || isStale) && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      setIsFetchPending(true);
      fetchOG({ url: href })
        .catch(() => {})
        .finally(() => setIsFetchPending(false));
    }
  }, [isExternal, externalData, href, fetchOG]);

  // Tooltip content derivation
  const tooltipTitle = isInternal ? internalData?.title : externalData?.title;
  const tooltipDescription = isInternal
    ? internalData?.description
    : externalData?.description;
  const hasTooltipData = !!(tooltipTitle || contextNote || linkType);

  // The base anchor element (note: title is NOT forwarded to DOM)
  const linkEl = (
    <a
      href={href}
      onMouseEnter={handleMouseEnter}
      className={cn("hover:underline font-semibold", restProps.className)}
      {...restProps}
    >
      {children}
    </a>
  );

  // Skip tooltip wrapper if nothing to show and not loading
  if (!hasTooltipData && !isExternal) {
    return linkEl;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
      <TooltipContent className="z-50 max-w-xs p-0 bg-popover border border-border shadow-lg rounded-lg overflow-hidden">
        <TooltipCard
          title={tooltipTitle}
          description={tooltipDescription}
          contextNote={contextNote}
          linkType={linkType}
          isExternal={isExternal}
          isLoading={isExternal && (externalData === undefined || isFetchPending)}
        />
      </TooltipContent>
    </Tooltip>
  );
}
