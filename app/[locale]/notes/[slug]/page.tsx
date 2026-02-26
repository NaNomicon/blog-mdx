import {
  getPostBySlug,
  getAllPosts,
  getAdjacentPosts,
  type NoteMetadata,
} from "@/lib/content";
import { notFound } from "next/navigation";
import {
  generateSEOMetadata,
  extractSEOFromNoteMetadata,
  defaultSEOConfig,
} from "@/lib/seo";
import type { Metadata } from "next";
import NotesPage from "../page";
import { NoteDialog } from "@/components/notes/note-dialog";
import { BlogPostStructuredData } from "@/components/seo/structured-data";
import { FallbackBanner } from "@/components/i18n/fallback-banner";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: any;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getPostBySlug<NoteMetadata>(slug, "notes", locale);
  if (!result) return {};
  const { post: note } = result;

  const seoConfig = extractSEOFromNoteMetadata(note.metadata, slug);
  return generateSEOMetadata({ ...seoConfig, locale });
}

export async function generateStaticParams() {
  const notes = await getAllPosts<NoteMetadata>("notes");
  return notes.map((note) => ({
    slug: note.slug,
  }));
}

// 🚀 ISR Magic - Revalidate every hour!
export const revalidate = 3600; // 1 hour in seconds

export default async function NotePage({ params, searchParams }: Props) {
  const { locale, slug } = await params;

  const [noteResult, adjacent] = await Promise.all([
    getPostBySlug<NoteMetadata>(slug, "notes", locale),
    getAdjacentPosts<NoteMetadata>("notes", slug),
  ]);

  if (!noteResult) notFound();
  const { post: note, isFallback } = noteResult;

  return (
    <>
      <BlogPostStructuredData
        title={note.metadata.title}
        description={
          note.metadata.description || `Read ${note.metadata.title} in my notes.`
        }
        author={defaultSEOConfig.author!}
        publishDate={note.metadata.publishDate}
        category={note.metadata.collection}
        slug={slug}
        siteUrl={defaultSEOConfig.siteUrl}
        pathPrefix="/notes"
      />
      {isFallback && <FallbackBanner />}
      <NotesPage params={params} searchParams={searchParams} />
      <NoteDialog note={note} prev={adjacent.prev} next={adjacent.next} />
    </>
  );
}
