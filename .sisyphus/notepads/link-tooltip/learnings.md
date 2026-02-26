# Notepad: link-tooltip

## Learnings
<!-- Append findings here, never overwrite -->

### Script: `scripts/refresh-posts-index.mjs`
- Created a Node.js ESM script to scan `content/blogs/` and `content/notes/`.
- Extracts `title` and `description` from MDX `metadata` export using regex.
- Derives slugs by stripping the `YYMMDD-` prefix, consistent with `lib/content.ts`.
- Generates `lib/data/posts-index.json` mapping URLs to metadata for tooltip previews.
- Added `prebuild` script to `package.json` to ensure the index is always fresh.

## Issues
<!-- Problems encountered -->

## Decisions
<!-- Architectural choices made during execution -->
- Created `config/link-types.ts` to define MDX link relationship types and their visual styling metadata.
- Exported `LinkType` union, `LINK_TYPES` mapping, and `isLinkType` type guard.
- Configured 6 types: reference, mention, joke, aside, further-reading, warning.
- Verified with `pnpm type-check`.

- Added 'og_cache' table to 'convex/schema.ts' with fields: url, title, description, fetchedAt.
- Indexed 'og_cache' by 'url' for efficient lookup.
- Verified schema update with 'pnpm type-check'.

### Convex OG Cache backend (Wave 4)
- Created `convex/ogCache.ts` — `getByUrl` query + `upsert` mutation.
  - `getByUrl` returns projected fields only (excludes `_id`/`_creationTime`) using `v.union(v.object({...}), v.null())`.
  - `upsert` uses `withIndex("by_url")` → `.unique()` to check existence, then `patch` or `insert`. Always sets `fetchedAt: Date.now()`.
- Created `convex/ogCacheActions.ts` — `fetchAndCacheOG` action.
  - Uses `AbortSignal.timeout(5000)` for 5s fetch timeout (V8-compatible, no Node.js APIs).
  - Handles BOTH attribute orderings in OG meta tags (property-first and content-first).
  - Full try/catch: outer failure falls back to hostname via another try/catch-wrapped upsert.
  - Returns `null`; never throws.
- **Gotcha**: `_generated/api.d.ts` must be manually updated to include new modules when `convex dev` hasn't been run. Added `ogCache` and `ogCacheActions` imports to `fullApi`. This is the correct approach when deploying Convex changes without a live connection.
- `pnpm type-check` → 0 errors after api.d.ts update.

## MDX Link Tooltip Integration
- Successfully wired `LinkTooltip` into MDX `a` element mapping in `mdx-components.tsx`.
- Confirmed `TooltipProvider` is already present in `app/layout.tsx` wrapping the main content area within `ConvexClientProvider`.
- `LinkTooltip` is imported from `@/components/mdx/link-tooltip`.
- Verified changes with `pnpm type-check` and `pnpm lint`.
- **Webpack Dynamic Import Gotcha**: Webpack's dynamic import with glob patterns (e.g., ) eagerly includes ALL files matching the pattern in its namespace object. If non-JS/TS/MDX files like  are in those directories, webpack will attempt to parse them, failing with a  if it doesn't have a loader configured for . Moving such meta-files out of the scanned subdirectories fixes the build blocker without requiring webpack configuration changes.
- **Webpack Dynamic Import Gotcha**: Webpack's dynamic import with glob patterns (e.g., `import(\`./\${path}\`)`) eagerly includes ALL files matching the pattern in its namespace object. If non-JS/TS/MDX files like `AGENTS.md` are in those directories, webpack will attempt to parse them, failing with a `ModuleParseError` if it doesn't have a loader configured for `.md`. Moving such meta-files out of the scanned subdirectories fixes the build blocker without requiring webpack configuration changes.

## [2026-02-26] T7 Playwright QA Results

**Environment**: Dev server at http://localhost:3001, Brave browser (Chromium), headless mode

**Test Page Status**: Draft `260226-test-tooltips.mdx` returns 404 — requires `NEXT_PUBLIC_SHOW_DRAFTS=true` env var. Tested against real blog pages instead.

### Screenshot Evidence (all saved to `.sisyphus/evidence/task-7-qa/`)

- [fail] **Annotated internal link tooltip** (`01-internal-annotated.png`): Blog list page (SSR, JS disabled). "Fixing sleep schedule" link found and scrolled into view. Tooltip did NOT appear — no `[role="tooltip"]` element rendered. With JS enabled: page crashes before tooltip can appear due to LinkTooltipInner render error.
- [fail] **Plain internal link tooltip** (`02-internal-plain.png`): Open-source blog post (SSR, JS disabled). Internal `/` link scrolled into view. No tooltip rendered — SSR doesn't execute client-side tooltip logic.
- [fail] **External link tooltip** (`03-external.png`): Open-source blog post (SSR). `github.com` article link (e.g., "GitHub", "Copilot") scrolled into view. No tooltip rendered in SSR mode.
- [fail] **Anchor link (no tooltip)** (`04-anchor.png`): Open-source blog post (SSR). 7 anchor links found (`href^="#"`). Scrolled to one — correctly NO tooltip (expected behavior confirmed in SSR context).
- **Full page** (`05-full-page.png`): Full-page screenshot of open-source blog post (SSR) — page renders completely with all content.

### Console Errors (JS-enabled mode)
1. `Warning: Cannot update a component (HotReload) while rendering a different component (LinkTooltipInner)` — `link-tooltip.tsx:160` — Illegal setState during render
2. `ErrorBoundary caught: [CONVEX Q(ogCache:getByUrl)] Could not find public function for 'ogCache:getByUrl'. Did you forget to run 'npx convex dev'?` — Convex backend not deployed in local dev
3. `[Fast Refresh] performing full reload` — cascading from the Convex error

### Root Cause Analysis
- **Primary failure**: `LinkTooltipInner` calls `useQuery(api.ogCache.getByUrl, ...)` during render, which triggers Convex to throw because `ogCache:getByUrl` is not deployed locally
- **Secondary failure**: The Convex error fires during React's render phase, triggering "Cannot update component while rendering" — non-recoverable error that crashes the entire article tree
- **Effect**: Blog post pages show "Something went wrong" error boundary; no article links visible/hoverable in JS-enabled mode

### What Works (SSR)
- Links render correctly in server-side HTML (39 links on blog post, full article content)
- `article a` elements exist and are properly structured
- Anchor links correctly have no tooltip mechanism

### What Needs Fix Before Full QA
1. Deploy Convex with `npx convex dev` or `pnpm build:local` to register `ogCache:getByUrl`
2. OR fix `LinkTooltipInner` to not call Convex query during the render phase that causes setState
3. Set `NEXT_PUBLIC_SHOW_DRAFTS=true` to access the dedicated test draft page
