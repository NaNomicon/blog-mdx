import { type Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAllPosts, getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata, type Post } from "@/lib/content";
import { NoteCard } from "@/components/notes/note-card";
import { generateSEOMetadata, defaultSEOConfig, extractSEOFromNoteMetadata } from "@/lib/seo";
import { NotesFilter } from "@/components/notes/notes-filter";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { cn } from "@/lib/utils";
import { getFilteredNotes, getPaginatedNotes, type NoteFilters } from "@/lib/notes";
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
  };
}) {
  // Redirect old query parameter links to the new path-based clean URLs
  if (searchParams.note) {
    redirect(`/notes/${searchParams.note}`);
  }

  const filters: NoteFilters = {
    collection: searchParams.collection,
    tag: searchParams.tag,
    from: searchParams.from,
    to: searchParams.to,
    sort: searchParams.sort,
  };

  const { notes: initialNotes, hasMore } = await getPaginatedNotes(filters, 1, 10);
  
  // Get ALL notes just for filter counts/lists (this is still fast as it's just reading metadata)
  const allNotes = await getAllPosts<NoteMetadata>("notes", isPreviewMode());
  const allCollections = Array.from(new Set(allNotes.map(n => n.metadata.collection).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(allNotes.flatMap(n => n.metadata.tags || []))) as string[];

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
              <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted/20 rounded-lg max-w-md mx-auto" />}>
                <NotesFilter collections={allCollections} tags={allTags} />
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
            <div className="text-center py-24 border rounded-2xl bg-muted/20">
              <p className="text-muted-foreground">No notes found matching your filters.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
