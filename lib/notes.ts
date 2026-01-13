import { getAllPosts, isPreviewMode, type NoteMetadata, type Post } from "./content";

export interface NoteFilters {
  collection?: string;
  tag?: string;
  from?: string;
  to?: string;
  sort?: "asc" | "desc";
}

export async function getFilteredNotes(filters: NoteFilters) {
  let notes = await getAllPosts<NoteMetadata>("notes", isPreviewMode());

  // Apply filters
  if (filters.collection) {
    notes = notes.filter(n => n.metadata.collection === filters.collection);
  }
  
  if (filters.tag) {
    const selectedTags = filters.tag.split(",");
    notes = notes.filter(n => 
      selectedTags.every(tag => n.metadata.tags?.includes(tag))
    );
  }

  // Date range filter
  if (filters.from || filters.to) {
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    
    notes = notes.filter(n => {
      const publishDate = new Date(n.metadata.publishDate);
      if (fromDate && publishDate < fromDate) return false;
      if (toDate && publishDate > toDate) return false;
      return true;
    });
  }

  // Sort
  const sortOrder = filters.sort || "desc";
  notes = notes.sort((a, b) => {
    const dateA = new Date(a.metadata.publishDate).getTime();
    const dateB = new Date(b.metadata.publishDate).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return notes;
}

export async function getPaginatedNotes(
  filters: NoteFilters,
  page: number = 1,
  limit: number = 10
) {
  const allNotes = await getFilteredNotes(filters);
  const total = allNotes.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const notes = allNotes.slice(start, end);

  return {
    notes,
    total,
    hasMore: end < total,
  };
}
