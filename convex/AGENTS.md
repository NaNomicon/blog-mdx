# convex/ — Real-Time Backend

Convex functions for post engagement (views + reactions), OG metadata caching for link tooltips, and anonymous auth. Used by `components/mdx/view-tracker.tsx`, `components/mdx/engagement.tsx`, and `components/mdx/link-tooltip.tsx`.

## Files

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema: `views`, `reactions`, `user_reactions`, `view_events`, `og_cache` + `authTables` |
| `engagement.ts` | Queries/mutations: recordView, getEngagement, toggleReaction, getUserReactions |
| `auth.ts` | Auth configuration (convex-dev/auth) |
| `ogCache.ts` | Queries/mutations: getByUrl, upsert, deleteByUrl — OG metadata cache for external links |
| `ogCacheActions.ts` | Action: fetchAndCacheOG — fetches OG title/description from external URLs (5s timeout) |
| `auth.config.ts` | Auth provider config — Anonymous provider, reads `CONVEX_SITE_URL` |
| `http.ts` | HTTP webhook handler |
| `_generated/` | Auto-generated types — **never edit manually** |

## Schema

```
views          { slug, count, lastUpdated }   index: by_slug
reactions      { slug, type, count }          index: by_slug, by_slug_and_type
user_reactions { slug, reactionType, userId } index: by_slug_and_userId_and_reactionType
view_events    { slug, userId }               index: by_slug_and_userId
```
og_cache        { url, title, description, fetchedAt } index: by_url
```

### OG Cache Flow
1. `link-tooltip.tsx` → `useQuery(ogCache.getByUrl)` for cached data
2. On hover (cache miss or stale >30d) → `useAction(ogCacheActions.fetchAndCacheOG)`
3. Action fetches URL with 5s timeout, parses `og:title` + `og:description`, upserts to `og_cache`

Auth: Anonymous provider (no login required). User identity stored via Convex auth session.

## Convex Function Syntax (MANDATORY)

Always use the **new** Convex syntax with validators:

```typescript
// Query
export const getEngagement = query({
  args: { slug: v.string() },
  returns: v.object({ views: v.number(), reactions: v.array(v.object({ ... })) }),
  handler: async (ctx, args) => { ... },
});

// Mutation
export const recordView = mutation({
  args: { slug: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => { ... },
});
```

**Never** use the old function syntax without `args`/`returns` validators.

## Deploy

- `pnpm build` auto-runs `convex deploy` before Next.js build
- `pnpm build:local` skips Convex deploy
- Local dev: Convex runs in cloud dev mode (not local), configured via `.env.local`
- **After modifying Convex files**: Run `npx convex dev --once` to deploy changes and regenerate `_generated/` types (otherwise TypeScript will error on new/changed functions)

## Anti-Patterns

- **Never** edit `_generated/` manually
- **Never** use old Convex syntax (no `args`/`returns` validators)
- **Never** store sensitive data in Convex — it's for engagement metrics only
- **Never** expose internal Convex functions via `http.ts` without auth checks
