import { type Metadata } from "next";
import { Suspense } from "react";
import { getAllPosts, getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata, type Post } from "@/lib/content";
import { NoteCard } from "@/components/notes/note-card";
import { generateSEOMetadata } from "@/lib/seo";
import { NotesFilter } from "@/components/notes/notes-filter";
import { NoteDialog } from "@/components/notes/note-dialog";

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
  };
}) {
  let notes = await getAllPosts<NoteMetadata>("notes", isPreviewMode());

  // Get all possible filters from ALL notes before filtering
  const allCollections = Array.from(new Set(notes.map(n => n.metadata.collection).filter(Boolean))) as string[];
  const allTags = Array.from(new Set(notes.flatMap(n => n.metadata.tags || []))) as string[];

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

  // Apply filters
  if (searchParams.collection) {
    notes = notes.filter(n => n.metadata.collection === searchParams.collection);
  }
  
  const tagFilter = searchParams.tag;
  if (tagFilter) {
    const selectedTags = tagFilter.split(",");
    notes = notes.filter(n => 
      selectedTags.every(tag => n.metadata.tags?.includes(tag))
    );
  }

  // Date range filter
  if (searchParams.from || searchParams.to) {
    const fromDate = searchParams.from ? new Date(searchParams.from) : null;
    const toDate = searchParams.to ? new Date(searchParams.to) : null;
    
    notes = notes.filter(n => {
      const publishDate = new Date(n.metadata.publishDate);
      if (fromDate && publishDate < fromDate) return false;
      if (toDate && publishDate > toDate) return false;
      return true;
    });
  }

  // Sort
  const sortOrder = searchParams.sort || "desc";
  notes = notes.sort((a, b) => {
    const dateA = new Date(a.metadata.publishDate).getTime();
    const dateB = new Date(b.metadata.publishDate).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

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

        {/* Masonry Feed */}
        <section>
          {notes.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-2 gap-8">
              {notes.map((note) => (
                <NoteCard key={note.slug} note={note} />
              ))}
            </div>
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
