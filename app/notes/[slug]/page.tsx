import { getPostBySlug, getAllPosts, getAdjacentPosts, isPreviewMode, type NoteMetadata } from "@/lib/content";
import { notFound } from "next/navigation";
import { generateSEOMetadata, extractSEOFromNoteMetadata, defaultSEOConfig } from "@/lib/seo";
import type { Metadata } from "next";
import NotesPage from "../page";
import { NoteDialog } from "@/components/notes/note-dialog";
import { BlogPostStructuredData } from "@/components/seo/structured-data";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const note = await getPostBySlug<NoteMetadata>("notes", params.slug, isPreviewMode());
  if (!note) return {};
  
  const seoConfig = extractSEOFromNoteMetadata(note.metadata, params.slug);
  return generateSEOMetadata(seoConfig);
}

export async function generateStaticParams() {
  const notes = await getAllPosts<NoteMetadata>("notes");
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

// 🚀 ISR Magic - Revalidate every hour!
export const revalidate = 3600; // 1 hour in seconds

export default async function NotePage({ 
  params,
  searchParams 
}: { 
  params: { slug: string };
  searchParams: any;
}) {
  const [note, adjacent] = await Promise.all([
    getPostBySlug<NoteMetadata>("notes", params.slug, isPreviewMode()),
    getAdjacentPosts<NoteMetadata>("notes", params.slug, isPreviewMode()),
  ]);

  if (!note) notFound();

  return (
    <>
      <BlogPostStructuredData
        title={note.metadata.title}
        description={note.metadata.description || `Read ${note.metadata.title} in my notes.`}
        author={defaultSEOConfig.author!}
        publishDate={note.metadata.publishDate}
        category={note.metadata.collection}
        slug={params.slug}
        siteUrl={defaultSEOConfig.siteUrl}
        pathPrefix="/notes"
      />
      <NotesPage searchParams={searchParams} />
      <NoteDialog note={note} prev={adjacent.prev} next={adjacent.next} />
    </>
  );
}
