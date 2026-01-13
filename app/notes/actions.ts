"use server";

import { getPaginatedNotes, type NoteFilters } from "@/lib/notes";

export async function fetchNotesAction(
  filters: NoteFilters,
  page: number = 1,
  limit: number = 10
) {
  return await getPaginatedNotes(filters, page, limit);
}
