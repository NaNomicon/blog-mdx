import { type Metadata } from "next";
import { Suspense } from "react";
import { getAllPosts, getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata, type Post } from "@/lib/content";
import { NoteCard } from "@/components/notes/note-card";
import { generateSEOMetadata } from "@/lib/seo";
import { NotesFilter } from "@/components/notes/notes-filter";
import { NoteDialog } from "@/components/notes/note-dialog";
import { cn } from "@/lib/utils";
import { getFilteredNotes, getPaginatedNotes, type NoteFilters } from "@/lib/notes";
import { InfiniteNotesStream } from "@/components/notes/infinite-notes-stream";

export async function generateMetadata(): Promise<Metadata> {
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

  // Handle selected note for dialog
  let selectedNote = null;
  let adjacentNotes: { prev: Post<NoteMetadata> | null; next: Post<NoteMetadata> | null } = { prev: null, next: null };
  if (searchParams.note) {
    const [note, adjacent] = await Promise.all([
      getPostBySlug<NoteMetadata>("notes", searchParams.note, isPreviewMode()),
      getAdjacentPosts<NoteMetadata>("notes", searchParams.note, isPreviewMode()),
    ]);
    selectedNote = note;
    adjacentNotes = adjacent;
  }

  const currentLayout = searchParams.view || "masonry";

  return (
    <div className="space-y-0 min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-12 space-y-12">
        {/* Header Section */}
        <section className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tight">
              Notes
              <span className="text-muted-foreground">.</span>
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A stream of short-form thoughts, quick tips, and discoveries.
          </p>

          <div className="pt-8">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-muted/20 rounded-lg max-w-md mx-auto" />}>
              <NotesFilter collections={allCollections} tags={allTags} />
            </Suspense>
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
            <div className="text-center py-24 border rounded-2xl bg-muted/30">
              <p className="text-muted-foreground">No notes found matching your filters.</p>
            </div>
          )}
        </section>
      </div>

      {/* Note Dialog */}
      {selectedNote && (
        <NoteDialog 
          note={selectedNote} 
          prev={adjacentNotes.prev} 
          next={adjacentNotes.next} 
        />
      )}
    </div>
  );
}
