# lib/ — Core Utilities & Data Layer

Central utility layer. All server-side content fetching, env validation, SEO helpers, and shared functions live here.

## Files

| File | Exports | Purpose |
|------|---------|---------|
| `content.ts` | `getAllPosts`, `getPostBySlug`, `getAdjacentPosts`, `isPreviewMode`, `BlogPostMetadataSchema`, `NoteMetadataSchema` | MDX content loader — **server only** (uses `fs`) |
| `notes.ts` | `getFilteredNotes`, `getPaginatedNotes`, `applyNoteFilters`, `NoteFilters` | Notes filtering and pagination |
| `seo.ts` | `generateSEOMetadata`, `extractSEOFromBlogMetadata`, `extractSEOFromNoteMetadata` | SEO metadata generation |
| `utils.ts` | `cn`, `generateSlug` | Tailwind merge + slug generation (handles emojis/special chars) |
| `env.ts` | `env` | Zod-validated env vars — use this instead of `process.env` |
| `error-handler.ts` | `logError`, `createErrorHandler` | Error logging with severity levels |
| `version.ts` | app version + build metadata | Version info |

## Key Patterns

### Content Loading (`content.ts`)
```typescript
// Get all blog posts (sorted by publishDate desc)
const posts = await getAllPosts<BlogPostMetadata>("blogs", isPreviewMode());

// Get single post by slug (also checks drafts by default)
const post = await getPostBySlug<BlogPostMetadata>("blogs", slug);

// Prev/next navigation
const { prev, next } = await getAdjacentPosts<BlogPostMetadata>("blogs", slug);
```

**Type discrimination**: Notes MUST have `collection`; blogs MUST NOT. Enforced at load time — mismatched files are silently skipped.

**Caching**: `getAllPosts` wrapped in React `cache` + `unstable_cache`. No manual cache invalidation needed.

### Notes Filtering (`notes.ts`)
```typescript
const { notes, total, hasMore } = await getPaginatedNotes(
  { collection: "books", tag: "typescript", sort: "desc", showSpoilers: false },
  page,    // 1-indexed
  10       // limit
);
```

Sort order: pinned notes first, then by date.

### Env Access (`env.ts`)
```typescript
import { env } from "@/lib/env";
const token = env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN; // validated at startup
```

### Error Handling (`error-handler.ts`)
```typescript
import { logError } from "@/lib/error-handler";
try { ... } catch (error) {
  logError(error, { severity: "high", additionalData: { context: "my-fn" } });
}
```

## Anti-Patterns

- **Never** import `fs` or `path` outside `content.ts` — server-only constraint
- **Never** use `process.env.X` directly — import from `@/lib/env`
- **Never** call content functions from client components — they are server-side only
- **Never** skip the `metadata` export in MDX — files without it are silently omitted from lists
