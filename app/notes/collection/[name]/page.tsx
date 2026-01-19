import { Suspense } from "react";
import { type Metadata } from "next";
import { getAllPosts, getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata, type Post } from "@/lib/content";
import { generateSEOMetadata, defaultSEOConfig, extractSEOFromNoteMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { NoteDialog } from "@/components/notes/note-dialog";
import { getPaginatedNotes, type NoteFilters } from "@/lib/notes";
import { InfiniteNotesStream } from "@/components/notes/infinite-notes-stream";
import { NotesFilter } from "@/components/notes/notes-filter";
import { BreadcrumbStructuredData } from "@/components/seo/structured-data";

export async function generateMetadata({ 
  params,
  searchParams,
}: { 
  params: { name: string };
  searchParams: { note?: string };
}): Promise<Metadata> {
  const collectionName = decodeURIComponent(params.name);

  if (searchParams.note) {
    const note = await getPostBySlug<NoteMetadata>("notes", searchParams.note, isPreviewMode());
    if (note) {
      const seoConfig = extractSEOFromNoteMetadata(note.metadata, searchParams.note);
      return generateSEOMetadata({
        ...seoConfig,
        title: `${note.metadata.title} | ${collectionName}`,
      });
    }
  }

  return generateSEOMetadata({
    title: `${collectionName} - Notes Collection`,
    description: `Browse all notes in the ${collectionName} collection.`,
    slug: params.name,
    pathPrefix: "/notes/collection",
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
  searchParams: { 
    tag?: string; 
    note?: string;
    from?: string;
    to?: string;
    sort?: "asc" | "desc";
    view?: "masonry" | "list";
  };
}) {
  const collectionName = decodeURIComponent(params.name);
  
  const filters: NoteFilters = {
    collection: collectionName,
    tag: searchParams.tag,
    from: searchParams.from,
    to: searchParams.to,
    sort: searchParams.sort,
  };

  const { notes: initialNotes, hasMore } = await getPaginatedNotes(filters, 1, 10);

  if (initialNotes.length === 0 && !searchParams.tag && !searchParams.from && !searchParams.to) {
    notFound();
  }

  // Get tags specifically for this collection for the filter
  const allNotes = await getAllPosts<NoteMetadata>("notes", isPreviewMode());
  const collectionNotes = allNotes.filter(n => n.metadata.collection === collectionName);
  const allTags = Array.from(new Set(collectionNotes.flatMap(n => n.metadata.tags || []))) as string[];

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
    <div className="min-h-screen">
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: defaultSEOConfig.siteUrl! },
          { name: "Notes", url: `${defaultSEOConfig.siteUrl}/notes` },
          { name: collectionName, url: `${defaultSEOConfig.siteUrl}/notes/collection/${params.name}` }
        ]}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">
        {/* Header Section */}
        <section className="space-y-8">
          <Button variant="ghost" asChild className="hover:bg-primary/5 hover:text-primary transition-colors">
            <Link href="/notes" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Back to all notes</span>
            </Link>
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground/60">
                <div className="h-px w-8 bg-border" />
                <span className="text-xs font-bold uppercase tracking-[0.3em]">Collection</span>
              </div>
              <h1 className="text-5xl sm:text-6xl font-light tracking-tight">
                {collectionName}
                <span className="text-primary">.</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                A curated stream of thoughts and discoveries from the <span className="text-foreground font-medium">{collectionName}</span> collection.
              </p>
            </div>

            <div className="flex-shrink-0">
              <Suspense fallback={
                <div className="flex flex-col items-end gap-3 py-2">
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <div className="h-10 w-[180px] bg-muted/20 animate-pulse rounded-md" />
                    <div className="h-10 w-[220px] bg-muted/20 animate-pulse rounded-md" />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-10 w-[100px] bg-muted/20 animate-pulse rounded-md" />
                    <div className="h-10 w-[80px] bg-muted/20 animate-pulse rounded-md" />
                    <div className="h-10 w-[80px] bg-muted/20 animate-pulse rounded-md" />
                  </div>
                </div>
              }>
                <NotesFilter 
                  collections={[]} 
                  tags={allTags} 
                  hideCollection={true} 
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
            <div className="text-center py-24 border rounded-2xl bg-muted/30 border-dashed">
              <p className="text-muted-foreground italic">No notes found matching your filters in this collection.</p>
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
