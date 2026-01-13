import { getPostBySlug, getAdjacentPosts, isPreviewMode, type NoteMetadata } from "@/lib/content";
import { NoteDialog } from "@/components/notes/note-dialog";

export default async function NoteModal({ params }: { params: { slug: string } }) {
  const [note, adjacent] = await Promise.all([
    getPostBySlug<NoteMetadata>("notes", params.slug, isPreviewMode()),
    getAdjacentPosts<NoteMetadata>("notes", params.slug, isPreviewMode()),
  ]);

  if (!note) return null;

  return <NoteDialog note={note} prev={adjacent.prev} next={adjacent.next} />;
}
