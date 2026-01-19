import { type Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAllPosts, getPostBySlug, isPreviewMode, type NoteMetadata } from "@/lib/content";
import { NoteCard } from "@/components/notes/note-card";
import { generateSEOMetadata, defaultSEOConfig, extractSEOFromNoteMetadata } from "@/lib/seo";
import { NotesFilter } from "@/components/notes/notes-filter";
import { SpoilerToggleButton } from "@/components/notes/spoiler-toggle-button";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { cn } from "@/lib/utils";
import { applyNoteFilters, type NoteFilters } from "@/lib/notes";
import { InfiniteNotesStream } from "@/components/notes/infinite-notes-stream";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { note?: string };
}): Promise<Metadata> {
  if (searchParams.note) {
    const note = await getPostBySlug<NoteMetadata>("notes", searchParams.note, isPreviewMode());
    if (note) {
      const seoConfig = extractSEOFromNoteMetadata(note.metadata, searchParams.note);
      return generateSEOMetadata({
        ...seoConfig,
        // Override canonical to avoid duplicate content if needed, 
        // but for sharing purposes we want the specific note title/desc
      });
    }
  }

  return generateSEOMetadata({
    title: "Notes & Snippets",
    description: "Short-form thoughts, quick tips, and web discoveries.",
    slug: "notes",
    pathPrefix: "",
  });
}

export const revalidate = 1800; // 30 minutes

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { 
    collection?: string; 
    tag?: string; 
    note?: string;
    from?: string;
    to?: string;
    sort?: "asc" | "desc";
    view?: "masonry" | "list";
    spoilers?: string;
  };
}) {
  // Redirect old query parameter links to the new path-based clean URLs
  if (searchParams.note) {
    redirect(`/notes/${searchParams.note}`);
  }

  const showSpoilers = searchParams.spoilers === "true";
  const filters: NoteFilters = {
    collection: searchParams.collection,
    tag: searchParams.tag,
    from: searchParams.from,
    to: searchParams.to,
    sort: searchParams.sort,
    showSpoilers,
  };

  // Get ALL notes ONCE (cached in lib/content)
  const allNotes = await getAllPosts<NoteMetadata>("notes", isPreviewMode());
  
  // Extract filter data from ALL notes
  const allCollections = Array.from(new Set(allNotes.map(n => n.metadata.collection).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(allNotes.flatMap(n => n.metadata.tags || []))) as string[];

  // Apply filters and pagination locally from the already-fetched notes
  const filteredNotes = applyNoteFilters(allNotes, filters);

  // Calculate hidden spoilers count
  const notesWithSpoilers = applyNoteFilters(allNotes, { ...filters, showSpoilers: true });
  const hiddenCount = notesWithSpoilers.length - filteredNotes.length;

  const initialNotes = filteredNotes.slice(0, 10);
  const hasMore = filteredNotes.length > 10;

  const currentLayout = searchParams.view || "masonry";

  return (
    <div className="space-y-0 min-h-screen bg-background">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: defaultSEOConfig.siteUrl! },
          { name: "Notes", url: `${defaultSEOConfig.siteUrl}/notes` },
        ]}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
        {/* Header Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b pb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground/60">
                <div className="h-px w-8 bg-border" />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Knowledge Base</span>
              </div>
              <h1 className="text-5xl sm:text-7xl font-light tracking-tight">
                Notes
                <span className="text-primary">.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                A stream of short-form thoughts, quick tips, and discoveries.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Suspense fallback={
                <div className="flex flex-wrap items-center justify-end gap-3 py-2">
                  <div className="h-10 w-[160px] bg-muted/20 animate-pulse rounded-md" />
                  <div className="h-10 w-[180px] bg-muted/20 animate-pulse rounded-md" />
                  <div className="h-10 w-[220px] bg-muted/20 animate-pulse rounded-md" />
                </div>
              }>
                <NotesFilter 
                  collections={allCollections} 
                  tags={allTags} 
                  hiddenCount={hiddenCount}
                  initialFilters={{
                    collection: searchParams.collection,
                    tag: searchParams.tag,
                    from: searchParams.from,
                    to: searchParams.to,
                    sort: searchParams.sort,
                    view: searchParams.view,
                    spoilers: searchParams.spoilers,
                  }}
                />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Notes Feed */}
        <section>
          {initialNotes.length > 0 ? (
            <InfiniteNotesStream 
              initialNotes={initialNotes}
              filters={filters}
              hasMore={hasMore}
              currentLayout={currentLayout}
            />
          ) : (
            <div className="text-center py-24 border rounded-2xl bg-muted/20 flex flex-col items-center justify-center space-y-4">
              <p className="text-muted-foreground">No notes found matching your filters.</p>
              {!showSpoilers && hiddenCount > 0 && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-700 flex flex-col items-center gap-4">
                  <p className="text-sm text-muted-foreground/60 max-w-md">
                    Note: The spoiler toggle is currently on, hiding {hiddenCount} contents.
                  </p>
                  <SpoilerToggleButton />
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
