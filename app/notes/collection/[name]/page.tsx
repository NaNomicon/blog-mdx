import { type Metadata } from "next";
import { getAllPosts, getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata, type Post } from "@/lib/content";
import { NoteCard } from "@/components/notes/note-card";
import { generateSEOMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { NoteDialog } from "@/components/notes/note-dialog";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const collectionName = decodeURIComponent(params.name);
  return generateSEOMetadata({
    title: `${collectionName} - Notes Collection`,
    description: `Browse all notes in the ${collectionName} collection.`,
  });
}

export async function generateStaticParams() {
  const notes = await getAllPosts<NoteMetadata>("notes");
  const collections = Array.from(new Set(notes.map(n => n.metadata.collection).filter(Boolean)));
  return collections.map((name) => ({
    name: encodeURIComponent(name!),
  }));
}

export default async function CollectionPage({ 
  params,
  searchParams,
}: { 
  params: { name: string };
  searchParams: { note?: string };
}) {
  const collectionName = decodeURIComponent(params.name);
  const allNotes = await getAllPosts<NoteMetadata>("notes", isPreviewMode());
  const notes = allNotes.filter(n => n.metadata.collection === collectionName);

  if (notes.length === 0) {
    notFound();
  }

  // Handle selected note for dialog
  let selectedNote = null;
  let adjacentNotes: { prev: Post<NoteMetadata> | null; next: Post<NoteMetadata> | null } = { prev: null, next: null };
  if (searchParams.note) {
    selectedNote = notes.find(n => n.slug === searchParams.note) || null;
    if (selectedNote) {
      // Get adjacent notes within this collection context
      const index = notes.findIndex(n => n.slug === searchParams.note);
      adjacentNotes = {
        prev: index > 0 ? notes[index - 1] : null,
        next: index < notes.length - 1 ? notes[index + 1] : null,
      };
    }
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
        {/* Header Section */}
        <section className="space-y-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/notes" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to all notes
            </Link>
          </Button>
          
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-light tracking-tight">
              Collection: <span className="text-primary font-medium">{collectionName}</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'} in this collection.
            </p>
          </div>
        </section>

        {/* Masonry Feed */}
        <section>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
            {notes.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
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
