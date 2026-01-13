import { type Metadata } from "next";
import { getAllPosts, getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata, type Post } from "@/lib/content";
import { NoteCard } from "@/components/notes/note-card";
import { generateSEOMetadata } from "@/lib/seo";
import { StickyHeader } from "@/components/notes/sticky-header";
import { NoteDialog } from "@/components/notes/note-dialog";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "Notes & Snippets",
    description: "Short-form thoughts, quick tips, and web discoveries.",
  });
}

export const revalidate = 1800; // 30 minutes

export default async function NotesPage({
  searchParams,
}: {
  searchParams: { collection?: string; tag?: string; note?: string };
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
    notes = notes.filter(n => n.metadata.tags?.includes(tagFilter));
  }

  return (
    <div className="space-y-0 min-h-screen bg-muted/20">
      <StickyHeader collections={allCollections} tags={allTags} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
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
        </section>

        {/* Masonry Feed */}
        <section>
          {notes.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
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
