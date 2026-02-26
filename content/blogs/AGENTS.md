# content/blogs/ — Blog Post Authoring Guide

## Create a New Post

```bash
pnpm new-blog    # scaffolds YYMMDD-slug.mdx with metadata template
```

Or create manually: `YYMMDD-slug.mdx` (e.g. `260301-my-post.mdx`). The date prefix controls sort order.

## Required Metadata

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

## Content Structure

```mdx
export const metadata = { ... };

> Optional blockquote intro or TL;DR callout

## Section Heading

Regular prose. Supports all standard Markdown.
```

## Available Custom Components

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

## Cover Image

- External URLs OK: Pexels (`images.pexels.com`), Unsplash, `via.placeholder.com`, `picsum.photos`
- Local: place in `public/covers/` and reference as `/covers/my-image.jpg`
- Aspect ratio: displayed as square in listing card, any ratio on post page

## Drafts

Place in `content/drafts/` instead of `content/blogs/`. Same format. Visible only when `NEXT_PUBLIC_SHOW_DRAFTS=true`.

## SEO Notes

- `description` → used for meta description and OG
- `cover_image` → used as OG image
- `title` → page `<title>` tag
- `publishDate` → shown in structured data
