"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { type Post, type NoteMetadata } from "@/lib/content";
import { NoteCard } from "./note-card";
import { fetchNotesAction } from "@/app/notes/actions";
import { type NoteFilters } from "@/lib/notes";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfiniteNotesStreamProps {
  initialNotes: Post<NoteMetadata>[];
  filters: NoteFilters;
  hasMore: boolean;
  currentLayout: string;
}

export function InfiniteNotesStream({
  initialNotes,
  filters,
  hasMore: initialHasMore,
  currentLayout,
}: InfiniteNotesStreamProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const observerTarget = useRef<HTMLDivElement>(null);

  // Memoize loadMore to avoid unnecessary effect re-runs
  const loadMore = useCallback(() => {
    if (isPending || !hasMore) return;

    startTransition(async () => {
      const nextPage = page + 1;
      const result = await fetchNotesAction(filters, nextPage);
      setNotes((prev) => [...prev, ...result.notes]);
      setPage(nextPage);
      setHasMore(result.hasMore);
    });
  }, [page, filters, hasMore, isPending]);

  // Reset when filters change (initialNotes change when server component re-renders)
  useEffect(() => {
    setNotes(initialNotes);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialNotes, initialHasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isPending) {
          loadMore();
        }
      },
      { threshold: 0, rootMargin: "800px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isPending, loadMore]);

  return (
    <div className="space-y-12">
      <div className={cn(
        currentLayout === "masonry" 
          ? "columns-1 md:columns-2 lg:columns-2 gap-8" 
          : "flex flex-col max-w-3xl mx-auto w-full"
      )}>
        {notes.map((note) => (
          <NoteCard key={note.slug} note={note} />
        ))}
      </div>

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-20">
          {isPending && (
            <div className="flex items-center gap-2 text-muted-foreground/50 animate-in fade-in duration-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs font-medium uppercase tracking-widest">Loading more notes...</span>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && notes.length > 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm italic">
          No more notes to show.
        </div>
      )}
    </div>
  );
}
