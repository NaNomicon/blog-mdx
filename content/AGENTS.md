# Content Authoring Guide

This guide covers how to create and manage blog posts and short-form notes.

---

## 1. Blog Posts (`content/blogs/`)

### Create a New Post

```bash
pnpm new-blog    # scaffolds YYMMDD-slug.mdx with metadata template
```

Or create manually: `YYMMDD-slug.mdx` (e.g. `260301-my-post.mdx`). The date prefix controls sort order.

### Required Metadata

Every file MUST export a `metadata` object — files without it are silently skipped.

```typescript
export const metadata = {
  title: "Your Post Title",
  publishDate: "2026-03-01",        // YYYY-MM-DD — controls published date display
  description: "One-sentence summary for SEO and blog listing",
  category: "Technology",           // displayed on post page
  cover_image: "https://images.pexels.com/photos/123/...",  // shown in listing card
  tldr: "Quick summary for readers in a hurry",  // optional
  tags: ["typescript", "nextjs"],   // optional — max 3 shown in listing
};
```

**Do not add `collection`** — that field is for notes. Adding it causes the file to be treated as a note and silently excluded from the blog.

### Content Structure

```mdx
export const metadata = { ... };

> Optional blockquote intro or TL;DR callout

## Section Heading

Regular prose. Supports all standard Markdown.
```

### Available Custom Components

Use these directly in MDX (no import needed):

```mdx
<Callout type="info">Informational note</Callout>
<Callout type="warning">Be careful about this</Callout>
<Callout type="danger">Critical — do not skip</Callout>
<Callout type="tip">Helpful suggestion</Callout>

<YouTube id="dQw4w9WgXcQ" />

# Headings auto-generate anchor links (h1–h6)
```

Code blocks use syntax highlighting automatically:
````mdx
```typescript
const x: string = "hello";
```
````

### Cover Image

- External URLs OK: Pexels (`images.pexels.com`), Unsplash, `via.placeholder.com`, `picsum.photos`
- Local: place in `public/covers/` and reference as `/covers/my-image.jpg`
- Aspect ratio: displayed as square in listing card, any ratio on post page

### Drafts

Place in `content/drafts/` instead of `content/blogs/`. Same format. Visible only when `NEXT_PUBLIC_SHOW_DRAFTS=true`.

### SEO Notes

- `description` → used for meta description and OG
- `cover_image` → used as OG image
- `title` → page `<title>` tag
- `publishDate` → shown in structured data

---

## 2. Notes (`content/notes/`)

Short-form notes stream: book takeaways, links, ideas, thoughts. Different from blog posts — no ToC, no engagement stats, just content + metadata.

### Create a New Note

```bash
pnpm new-note    # scaffolds YYMMDD-slug.mdx with metadata template
```

Or create manually: `YYMMDD-slug.mdx` (e.g. `260301-my-note.mdx`).

### Required Metadata

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

### Note Types

| Type | When to use |
|------|-------------|
| `thought` | Personal reflection or opinion |
| `link` | Interesting article/resource — add `source_url` |
| `book` | Book notes/takeaways — add `book_title` |
| `idea` | Early-stage idea or concept |

### Content Style

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

### Spoiler Notes

Set `spoiler: true` for notes that reveal plot details, give away conclusions, or are speculative. They appear collapsed in the stream unless the reader toggles "Show spoilers".

### Collections

Collections group notes into filterable streams. Use consistent names (lowercase, hyphenated). Existing collections visible at `/notes` — match naming to existing ones if adding to a series.

### Filtering

Readers can filter by `collection`, `tag`, date range, and `showSpoilers` in the notes stream UI.

---

## 3. Link Annotations (Tooltips)

Links in MDX render with hover tooltips that show title, description, and optional context. **Always annotate external links** so readers get useful context instead of generic OG metadata.

### Syntax

```mdx
[visible text](url "type | Your helpful note about why this link matters")
```

### Annotation Types

| Type | When to use |
|------|-------------|
| `reference` | Source material, documentation, specs |
| `mention` | Referencing another post, person, or project in passing |
| `joke` | Humorous or ironic link |
| `aside` | Tangential but interesting |
| `further-reading` | Deep-dive or follow-up resource |
| `warning` | Link contains sensitive, controversial, or paywalled content |

### Examples

```mdx
[curl](https://curl.se "reference | Command-line tool for transferring data with URLs")
[Rémi Verschelde](https://theregister.com/... "mention | Godot engine maintainer discussing AI PR spam")
[relevant xkcd](https://xkcd.com/1319 "joke | The 'automation' comic")
[sleep research](https://hubermanlab.com/... "further-reading | Full podcast episode on circadian biology")
```

### Why Annotate?

- **Without annotation**: tooltip shows only the page’s OG title + description (often generic or unhelpful — e.g. `curl` just shows "curl.se")
- **With annotation**: tooltip shows a colored badge, the OG data, AND your note — much more useful to readers

### Rules

- **Always annotate external links** — bare URLs produce generic tooltips that aren’t helpful
- **Internal links** (`/blog/...`, `/notes/...`) auto-resolve title/description from the posts index — annotation is optional but encouraged for context
- **Anchor links** (`#section`) have no tooltip — no annotation needed
- The `type` is optional: `[text](url "Just a plain note without type")` works too
- Keep notes concise (5–15 words) — explain *why* the link matters, not *what* the page is
