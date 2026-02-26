# AGENTS.md

This guide provides essential information for agentic coding assistants working on this repository.

## Overview

Personal blog: Next.js 14 App Router + MDX content + Convex real-time backend. Site: nanomicon.com (NaN's Blog). `pnpm` monorepo with standalone Docker output.

## Structure

```
blog-mdx/
├── app/              # App Router routes (15+ files, 8 route segments)
├── components/
│   ├── mdx/          # Custom MDX rendering components (13 files) → see AGENTS.md
│   ├── notes/        # Convex-powered notes stream (7 files) → see AGENTS.md
│   ├── nav/          # Site navigation (5 files)
│   ├── seo/          # Structured data components
│   └── ui/           # Shadcn UI primitives (do not modify directly)
├── lib/              # Core utilities and data layer (7 files) → see AGENTS.md
├── convex/           # Real-time backend: views, reactions, auth → see AGENTS.md
├── content/
│   ├── blogs/        # Production posts (YYMMDD-slug.mdx)
│   ├── notes/        # Notes stream entries (YYMMDD-slug.mdx)
│   └── drafts/       # Hidden in production (NEXT_PUBLIC_SHOW_DRAFTS=true to view)
├── config/           # seo.config.ts — site identity, social handles, OG settings
├── scripts/          # CLI scaffolding and dev tools (new-blog, new-note, version-bump)
├── docs/             # PRDs (prd/) and changelogs (logs/2026/)
└── public/           # Static assets, covers, OG images
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/edit blog post | `content/blogs/YYMMDD-slug.mdx` | Use `pnpm new-blog` |
| Add/edit note | `content/notes/YYMMDD-slug.mdx` | Use `pnpm new-note` |
| Draft content | `content/drafts/` | Set `NEXT_PUBLIC_SHOW_DRAFTS=true` |
| Content schemas/fetching | `lib/content.ts` | `getAllPosts`, `getPostBySlug` |
| Notes filtering/pagination | `lib/notes.ts` | `getFilteredNotes`, `getPaginatedNotes` |
| SEO metadata | `lib/seo.ts` | `generateSEOMetadata()` |
| Site identity / OG / social | `config/seo.config.ts` | siteName, siteUrl, twitterHandle |
| Env validation | `lib/env.ts` | Use `env.X` not `process.env.X` |
| View counts / reactions | `convex/engagement.ts` | Real-time via Convex |
| Convex schema | `convex/schema.ts` | views, reactions, user_reactions, view_events |
| MDX rendering | `components/mdx/` | blog-layout, callout, code, table-of-contents |
| Notes UI (infinite scroll) | `components/notes/` | infinite-notes-stream, note-card, note-dialog |
| Error handling | `components/error-boundary.tsx`, `lib/error-handler.ts` | |
| New page/route | `app/` | Server component by default |
| MDX element mapping | `mdx-components.tsx` (root) | Maps HTML elements → custom renderers |

## Development Commands

```bash
pnpm dev                    # Dev server on port 3001 (NOT 3000)
pnpm build                  # Deploy Convex + build Next.js
pnpm build:local            # Build without deploying Convex
pnpm build:analyze          # Bundle analysis (ANALYZE=true)
pnpm start                  # Production server on port 3001
pnpm lint                   # ESLint
pnpm type-check             # tsc --noEmit (TypeScript strict)
pnpm new-blog               # Scaffold new blog post MDX
pnpm new-note               # Scaffold new note MDX
pnpm version:patch/minor/major  # Bump semver
pnpm verify-analytics       # Verify Cloudflare Analytics config
NEXT_PUBLIC_SHOW_DRAFTS=true pnpm dev   # Preview drafts
```

### Testing
No custom test files. Manually test in development. Run `pnpm lint` and `pnpm type-check` before committing.

## Code Style Guidelines

### Imports
Use `@/` alias for internal imports. Group: external libs, internal libs, components.
```typescript
import type { Metadata } from "next";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateSEOMetadata } from "@/lib/seo";
```

### TypeScript
Strict mode enabled. Use `type` for type-only imports. Use Zod for validation. Interfaces for component props.

### File Naming
- Components: PascalCase (`BlogLayout.tsx`)
- Utilities/lib: kebab-case (`error-handler.ts`)
- MDX: `YYMMDD-slug.mdx` (`260113-example.mdx`)
- Hooks: kebab-case starting with `use-`

### Component Structure
```typescript
'use client';  // Only for interactive features
import { cn } from "@/lib/utils";
export function Component({ className }: ComponentProps) {
  return <div className={cn("base-classes", className)}>{/* content */}</div>;
}
```

### Styling
Tailwind CSS classes with `cn()` utility. Always support dark mode with `dark:` variants.

### Error Handling
Use Error Boundary (`components/error-boundary.tsx`) and `logError()` from `@/lib/error-handler`.
```typescript
try { /* code */ } catch (error) {
  logError(error, { severity: 'high', additionalData: { context: '...' } });
}
```

## MDX Content

Every MDX file **must** export a `metadata` object.

**Blog post** (`BlogPostMetadataSchema`):
```typescript
export const metadata = {
  title: "Title", publishDate: "YYYY-MM-DD", description: "...",
  category: "...", cover_image: "/path.png", tldr: "...", tags: []
};
```

**Note** (`NoteMetadataSchema`):
```typescript
export const metadata = {
  title: "Title", publishDate: "YYYY-MM-DD",
  collection: "collection-name",  // REQUIRED — distinguishes notes from blogs
  type: "thought" | "link" | "book" | "idea",  // optional
  spoiler: true,   // optional — hidden by default in notes filter
  pinned: true,    // optional — floats to top of notes stream
  tags: []
};
```

**Critical**: Notes **must** have `collection`. Blogs **must not** have `collection`. `lib/content.ts` enforces this — mismatched files are silently skipped.

## SEO
Use `generateSEOMetadata()` from `@/lib/seo`. Include `BlogPostStructuredData` and `BreadcrumbStructuredData`. See `app/blog/[slug]/page.tsx`.

## Environment Variables
Use `env` from `@/lib/env` (Zod-validated) — **never** `process.env` directly in app code.

Key vars:
- `NEXT_PUBLIC_SHOW_DRAFTS` — show drafts in dev
- `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN`
- `CONVEX_SITE_URL` — Convex auth (backend only)
- `NEXT_PUBLIC_SITE_URL` — canonical URL override

## Next.js App Router
Server components by default. Use `'use client'` for interactivity. Use `dynamic()`, `notFound()`. ISR: `export const revalidate = 3600`.

## Convex
`convex deploy` runs during `pnpm build`. Types in `convex/_generated/`. Provider in `components/convex-client-provider.tsx`.

## Tech Stack
Next.js 14 (App Router), Tailwind CSS + Shadcn UI, MDX, Convex, Lucide/Simple Icons, Zod, pnpm

## Anti-Patterns

- **Never** use `process.env.X` in app code → use `env.X` from `@/lib/env`
- **Never** use `fs` outside `lib/content.ts` (server-only Node.js API)
- **Never** add `'use client'` unless component needs interactivity
- **Never** suppress type errors (`as any`, `@ts-ignore`)
- **Never** commit `.env.local`
- **Never** omit `metadata` export from MDX files — silently skipped by content loader
- Convex functions must have `args`/`returns` validators (see `convex/AGENTS.md`)
- `pnpm build` **skips ESLint and TypeScript checks** — always run `pnpm lint && pnpm type-check` manually

## Key Gotchas

- Dev server runs on **port 3001**, not 3000
- `pnpm build` runs `convex deploy` first — use `pnpm build:local` to skip
- Drafts excluded in production; set `NEXT_PUBLIC_SHOW_DRAFTS=true` to preview
- Notes with `spoiler: true` are hidden by default; `pinned: true` floats to top
- Docker output: `standalone` mode, multi-platform via `scripts/docker-build.sh`
- ISR revalidation: `revalidate = 3600` on blog/note pages

## Linting & Type Checking
Always run before committing: `pnpm lint` (ESLint) and `pnpm type-check` (TypeScript strict)
Build does NOT run these automatically — must be run manually.
