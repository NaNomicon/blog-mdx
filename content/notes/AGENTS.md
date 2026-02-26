# content/notes/ — Notes Authoring Guide

Short-form notes stream: book takeaways, links, ideas, thoughts. Different from blog posts — no ToC, no engagement stats, just content + metadata.

## Create a New Note

```bash
pnpm new-note    # scaffolds YYMMDD-slug.mdx with metadata template
```

Or create manually: `YYMMDD-slug.mdx` (e.g. `260301-my-note.mdx`).

## Required Metadata

```typescript
export const metadata = {
  title: "Note Title",
  publishDate: "2026-03-01",            // YYYY-MM-DD or "YYYY-MM-DD HH:MM"
  collection: "collection-name",        // REQUIRED — groups notes into streams
  type: "thought",                      // thought | link | book | idea (optional)
  description: "Short summary",         // optional — SEO + note card preview
  tags: ["tag1", "tag2"],              // optional — filterable in notes stream

  // Book-specific
  book_title: "Book Name",             // optional — shown for type: "book"
  source_url: "https://...",           // optional — for type: "link"

  // Visibility
  spoiler: true,                        // optional — hidden behind toggle by default
  pinned: true,                         // optional — floats to top of stream
};
```

**`collection` is mandatory.** Without it the file is treated as a blog post and excluded from notes.

## Note Types

| Type | When to use |
|------|-------------|
| `thought` | Personal reflection or opinion |
| `link` | Interesting article/resource — add `source_url` |
| `book` | Book notes/takeaways — add `book_title` |
| `idea` | Early-stage idea or concept |

## Content Style

Notes are intentionally short (1–3 paragraphs). No `##` headings — use plain prose.

```mdx
export const metadata = {
  title: "Serendipity favors those who show up",
  publishDate: "2026-03-01",
  collection: "miscellaneous",
  type: "thought",
};

Brief prose content here. One idea per note. No need for section headings.
```

## Spoiler Notes

Set `spoiler: true` for notes that reveal plot details, give away conclusions, or are speculative. They appear collapsed in the stream unless the reader toggles "Show spoilers".

## Collections

Collections group notes into filterable streams. Use consistent names (lowercase, hyphenated). Existing collections visible at `/notes` — match naming to existing ones if adding to a series.

## Filtering

Readers can filter by `collection`, `tag`, date range, and `showSpoilers` in the notes stream UI.
