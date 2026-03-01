"use server";

import { getAllPosts } from "@/lib/content";
import { getPaginatedNotes, type NoteFilters } from "@/lib/notes";
import type { NoteMetadata } from "@/lib/content";

export async function fetchNotesAction(
  filters: NoteFilters,
  page: number = 1,
  limit: number = 10,
  locale: string = "en",
  showEn: boolean = false
) {
  if (showEn && locale !== "en") {
    const [localePosts, enPosts] = await Promise.all([
      getAllPosts<NoteMetadata>("notes", locale),
      getAllPosts<NoteMetadata>("notes", "en"),
    ]);
    const localeSlugs = new Set(localePosts.map((n) => n.slug));
    const enOnlyPosts = enPosts
      .filter((n) => !localeSlugs.has(n.slug))
      .map((n) => ({ ...n, _enOnly: true as const }));
    const merged = [...localePosts, ...enOnlyPosts];
    return getPaginatedNotes(filters, page, limit, locale, merged);
  }
  return getPaginatedNotes(filters, page, limit, locale);
}
