# app/blog/ — Blog Route Pages

Two page files handle all blog rendering. Both are **server components** with ISR.

## Files

| File | Route | Purpose |
|------|-------|---------|
| `page.tsx` | `/blog` | Listing page — all posts as cards |
| `[slug]/page.tsx` | `/blog/:slug` | Post page — MDX content + engagement |

## ISR Configuration

```typescript
// page.tsx (listing)
export const revalidate = 1800; // 30 minutes

// [slug]/page.tsx (post)
export const revalidate = 3600; // 1 hour
```

## Post Page Architecture

```
[slug]/page.tsx
  → generateStaticParams() — pre-renders all posts at build
  → getPostBySlug("blogs", slug, isPreviewMode()) — resolves from blogs/ or drafts/
  → dynamic(() => import(`@/content/${post.type}/${slug}.mdx`)) — loads MDX
  → BlogPostStructuredData + BreadcrumbStructuredData (SEO)
  → ViewTracker (fires Convex view record on mount)
  → InlineEngagement (top, no border)
  → BlogLayout → <MDXContent />
  → InlineEngagement (bottom)
```

**`post.type`** is either `"blogs"` or `"drafts"` — the dynamic import uses it to resolve the correct directory. Never hardcode the type.

## Listing Page Architecture

```
page.tsx
  → getAllPosts<BlogPostMetadata>("blogs", isPreviewMode())
  → Card grid: cover_image (square crop), date, EngagementStats, title, description (3 lines), tags (max 3)
```

## Metadata & SEO

Post page pattern:
```typescript
// Metadata
const seoConfig = extractSEOFromBlogMetadata(post.metadata, params.slug);
return generateSEOMetadata(seoConfig);

// Structured data (in JSX)
<BlogPostStructuredData ... />
<BreadcrumbStructuredData items={[Home, Blog, PostTitle]} />
```

Always include both structured data components on new post-type pages.

## Adding a New Blog-Adjacent Route

1. Create `app/blog/your-route/page.tsx`
2. Add `export const revalidate = N` (no default revalidation)
3. Use `generateSEOMetadata()` for metadata
4. Use `getAllPosts` / `getPostBySlug` from `@/lib/content` — not direct fs reads

## Anti-Patterns

- **Never** use `fs` directly — use `@/lib/content` functions
- **Never** hardcode `"blogs"` in the dynamic import path — use `post.type`
- **Never** omit `notFound()` when post is null
- **Never** import MDX statically — always `dynamic()` to avoid build-time module issues
