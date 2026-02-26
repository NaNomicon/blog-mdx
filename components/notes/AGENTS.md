# components/notes/ — Notes Stream UI

Convex-powered infinite scroll notes feed with filtering, detail view, and spoiler management.

## Files

| Component | Purpose | Client? |
|-----------|---------|---------|
| `infinite-notes-stream.tsx` | Infinite scroll list using `usePaginatedQuery` | Client |
| `note-card.tsx` | Single note card in the stream | Client |
| `note-detail.tsx` | Expanded note content view | Server/Client |
| `note-dialog.tsx` | Modal dialog for note details | Client |
| `notes-filter.tsx` | Filter bar (collection, tag, date, spoiler toggle) | Client |
| `share-note.tsx` | Share button with clipboard copy | Client |
| `spoiler-toggle-button.tsx` | Toggle button for spoiler visibility | Client |

## Data Flow

```
app/notes/page.tsx (server)
  → getFilteredNotes(filters) from lib/notes.ts
  → <InfiniteNotesStream /> (client boundary)
      → usePaginatedQuery / URL params for filters
      → <NoteCard /> for each note
      → <NoteDialog /> on click
```

Server page handles initial load + SEO; client components handle interactivity.

## Note Metadata Constraints

- `collection`: REQUIRED — all notes must belong to a collection
- `spoiler: true` → hidden behind toggle by default
- `pinned: true` → always floats to top of stream
- `type`: `thought | link | book | idea` — used for note card visual treatment

## Filter URL Params

Notes filter state lives in URL search params. Key params: `collection`, `tag`, `from`, `to`, `sort` (asc/desc), `showSpoilers`. See `lib/notes.ts::NoteFilters`.

## Anti-Patterns

- **Never** call `getAllPosts` directly from client components — use server page → props
- **Never** render spoiler content without checking `spoiler` flag
- Notes and blogs share slug namespace — `collection` field is the only disambiguator
