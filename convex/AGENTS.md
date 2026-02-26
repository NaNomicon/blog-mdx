# convex/ — Real-Time Backend

Convex functions for post engagement (views + reactions) and anonymous auth. Used by `components/mdx/view-tracker.tsx` and `components/mdx/engagement.tsx`.

## Files

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema: `views`, `reactions`, `user_reactions`, `view_events` + `authTables` |
| `engagement.ts` | Queries/mutations: recordView, getEngagement, toggleReaction, getUserReactions |
| `auth.ts` | Auth configuration (convex-dev/auth) |
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

## Anti-Patterns

- **Never** edit `_generated/` manually
- **Never** use old Convex syntax (no `args`/`returns` validators)
- **Never** store sensitive data in Convex — it's for engagement metrics only
- **Never** expose internal Convex functions via `http.ts` without auth checks
