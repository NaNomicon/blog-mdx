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
      {currentLayout === "masonry" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Column 1: Even indices */}
          <div className="flex flex-col gap-8">
            {notes
              .filter((_, i) => i % 2 === 0)
              .map((note) => (
                <NoteCard key={note.slug} note={note} />
              ))}
          </div>
          {/* Column 2: Odd indices */}
          <div className="flex flex-col gap-8">
            {notes
              .filter((_, i) => i % 2 !== 0)
              .map((note) => (
                <NoteCard key={note.slug} note={note} />
              ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col max-w-3xl mx-auto w-full gap-8">
          {notes.map((note) => (
            <NoteCard key={note.slug} note={note} />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={observerTarget} className="flex justify-center py-20 min-h-[120px]">
          {isPending && (
            <div className="flex items-center gap-2 text-muted-foreground/40 animate-in fade-in duration-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Synchronizing...</span>
            </div>
          )}
        </div>
      )}
      
      {!hasMore && notes.length > 0 && (
        <div className="text-center py-20">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">There&apos;s no more notes to show.</span>
        </div>
      )}
    </div>
  );
}

