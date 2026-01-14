import { getPostBySlug, getAllPosts, getAdjacentPosts, isPreviewMode, type NoteMetadata } from "@/lib/content";
import { notFound } from "next/navigation";
import { NoteDetail } from "@/components/notes/note-detail";
import { InlineEngagement } from "@/components/mdx/inline-engagement";
import { ViewTracker } from "@/components/mdx/view-tracker";
import { generateSEOMetadata } from "@/lib/seo";
import { BlogPostStructuredData } from "@/components/seo/structured-data";
import { seoConfig } from "@/config/seo.config";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const note = await getPostBySlug<NoteMetadata>("notes", params.slug, isPreviewMode());
  if (!note) return {};
  
  return generateSEOMetadata({
    title: note.metadata.title,
    description: note.metadata.description || `Read ${note.metadata.title} in my notes.`,
    pathPrefix: "/notes",
  });
}

export async function generateStaticParams() {
  const notes = await getAllPosts<NoteMetadata>("notes");
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

export default async function NotePage({ params }: { params: { slug: string } }) {
  const [note, adjacent] = await Promise.all([
    getPostBySlug<NoteMetadata>("notes", params.slug, isPreviewMode()),
    getAdjacentPosts<NoteMetadata>("notes", params.slug, isPreviewMode()),
  ]);

  if (!note) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <ViewTracker slug={params.slug} mode="immediate" />
      <BlogPostStructuredData
        title={note.metadata.title}
        description={note.metadata.description || ""}
        publishDate={note.metadata.publishDate}
        author={seoConfig.author}
        slug={note.slug}
        category={note.metadata.collection}
        pathPrefix="/notes"
      />
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 text-muted-foreground hover:text-primary">
          <Link href="/notes" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to all notes
          </Link>
        </Button>
      </div>
      
      <InlineEngagement slug={params.slug} className="border-t-0 mb-8" />

      <NoteDetail note={note} prev={adjacent.prev} next={adjacent.next} />

      <InlineEngagement slug={params.slug} className="mt-16" />
    </div>
  );
}
