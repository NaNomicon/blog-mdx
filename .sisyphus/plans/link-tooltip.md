# MDX Link Tooltip Feature

## TL;DR

> **Quick Summary**: Add contextual hover tooltips to all links in MDX blog content. Internal links show post metadata instantly (static JSON); external links query a Convex-cached OG metadata table with on-demand fetching.
>
> **Deliverables**:
> - `config/link-types.ts` — 6 annotated relationship types with colors/icons
> - `convex/ogCache.ts` + `convex/actions/fetchAndCacheOG.ts` — OG metadata storage and live fetch
> - `scripts/refresh-posts-index.mjs` — build-time posts index generator
> - `lib/data/posts-index.json` — static slug→metadata map for internal links
> - `components/mdx/link-tooltip.tsx` — smart link component with tooltip UI
> - `mdx-components.tsx` update — wire `LinkTooltip` into the `a` element mapping
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: T2 (schema) → T4 (Convex functions) → T5 (component) → T6/T7

---

## Context

### Original Request
Add hover tooltips to links in MDX blog content showing (1) what the link is, and (2) how it relates to the content — annotated by type: reference, mention, joke, aside, further-reading, warning.

### Interview Summary
- **Scope**: Both internal + external links; MDX content only
- **Authoring**: Markdown title attribute — `[text](url "reference | This explains the theory")` — type + pipe + optional note
- **Un-annotated links**: Tooltip still shows, type badge just omitted
- **Internal links**: Post title + description from content system → served instantly via static JSON import (no loading state)
- **External links**: OG metadata (title + description) → stored in Convex, fetched on-demand; loading state accepted
- **OG cache strategy**: Convex table `og_cache`, populated lazily on first hover, 30-day TTL before re-fetch

### Metis Review — Gaps Addressed
- **Server/client boundary**: `LinkTooltip` is `'use client'`. Internal data uses static JSON import. External data uses Convex `useQuery` + action.
- **Script format**: `.mjs` (native ESM, zero new deps, consistent with existing JS scripts)
- **Posts index location**: `lib/data/` (committed to repo, never gitignored)
- **Don't spread `title` to DOM `<a>`**: Destructure and discard before spreading props
- **`TooltipTrigger` uses `asChild`**: Prevents invalid DOM nesting (no `<button>` inside `<p>`)
- **OG fetch timeout**: 5s per URL max in Convex action
- **Graceful degradation**: Tooltip still renders on fetch errors (show URL hostname as fallback)
- **Anchor links (#...)**: Excluded from tooltip logic entirely
- **Image-wrapped links**: Detect `<img>` child in props, skip tooltip
- **Pipe in note text**: Use `split('|', 2)` — first `|` is the separator, rest is the note
- **Footnote links**: `href.startsWith('#')` guard handles these

---

## Work Objectives

### Core Objective
Replace the plain `<a>` link renderer in MDX content with a smart `LinkTooltip` component that shows a Shadcn Tooltip on hover, containing the linked content's identity and the author-annotated relationship type.

### Concrete Deliverables
- `config/link-types.ts` with 6 type definitions
- `convex/schema.ts` updated with `og_cache` table
- `convex/ogCache.ts` — `getByUrl` query + `upsert` mutation
- `convex/actions/fetchAndCacheOG.ts` — Convex HTTP action
- `scripts/refresh-link-data.mjs` — generates `lib/data/posts-index.json`
- `lib/data/posts-index.json` — slug → `{title, description, href}` map
- `components/mdx/link-tooltip.tsx` — client component
- `mdx-components.tsx` — updated `a` mapping

### Definition of Done
- [x] `pnpm lint && pnpm type-check` passes with 0 errors
- [x] Hovering an annotated MDX link shows tooltip with type badge + content
- [x] Hovering an un-annotated MDX link shows tooltip with title/description only
- [x] External link tooltip shows loading state then resolves to OG content
- [x] Links with `#` anchors have no tooltip
- [x] `pnpm build:local` exits 0

### Must Have
- Title attribute parsing: `"type | note"` format with `split('|', 2)`
- Type badge with distinct colors for all 6 types
- Tooltip for both internal (instant) and external (Convex-backed) links
- Graceful degradation when OG fetch fails (show URL hostname as fallback)
- `TooltipProvider` present in `app/layout.tsx` (check; add if missing)

### Must NOT Have (Guardrails)
- NO `title` prop forwarded to the DOM `<a>` element (causes browser native tooltip conflict)
- NO `lib/content.ts` import inside `LinkTooltip` (server-only, `node:fs` — will throw)
- NO tooltip on anchor/hash links (`href.startsWith('#')` → render plain `<a>`, no tooltip)
- NO tooltip outside MDX content (nav, notes stream, footer links)
- NO image preview or cover image in the tooltip (title + description + badge only)
- NO Convex changes beyond `og_cache` table and its two function files
- NO retroactive annotation of existing MDX posts (opt-in per link)
- NO animations on the type badge beyond static color/label
- NO `components/ui/tooltip.tsx` modification (Shadcn primitive — don't touch)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: NO (blog has no automated tests)
- **Automated tests**: None
- **Agent-Executed QA**: ALWAYS (Playwright for UI; Bash for build/lint)

### QA Policy
Every task includes agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.
- **UI/Tooltip**: Playwright — navigate to post, hover link, assert tooltip DOM
- **Build/Lint**: Bash — `pnpm lint`, `pnpm type-check`, `pnpm build:local`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — no deps, 3 parallel):
├── Task 1: config/link-types.ts [quick]
├── Task 2: convex/schema.ts — add og_cache table [quick]
└── Task 3: scripts/refresh-link-data.mjs + lib/data/posts-index.json [quick]

Wave 2 (After T2 — Convex functions):
└── Task 4: convex/ogCache.ts + convex/actions/fetchAndCacheOG.ts [unspecified-high]

Wave 3 (After T1, T3, T4 — main component):
└── Task 5: components/mdx/link-tooltip.tsx [visual-engineering]

Wave 4 (After T5 — integration + QA, 2 parallel):
├── Task 6: mdx-components.tsx update + TooltipProvider check + package.json [quick]
└── Task 7: Playwright QA [unspecified-high]

Critical Path: T2 → T4 → T5 → T6/T7
Max Concurrent: 3 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| T1 | — | T5 |
| T2 | — | T4 |
| T3 | — | T5 |
| T4 | T2 | T5 |
| T5 | T1, T3, T4 | T6, T7 |
| T6 | T5 | — |
| T7 | T5 | — |

### Agent Dispatch Summary
- **Wave 1**: 3 × `quick`
- **Wave 2**: 1 × `unspecified-high`
- **Wave 3**: 1 × `visual-engineering`
- **Wave 4**: 1 × `quick` + 1 × `unspecified-high`

---

## TODOs

---

- [x] 1. Define link relationship types config

  **What to do**:
  - Create `config/link-types.ts`
  - Export `LinkType` union type: `'reference' | 'mention' | 'joke' | 'aside' | 'further-reading' | 'warning'`
  - Export `LINK_TYPES` const object keyed by `LinkType` with: `label` (display string), `tailwindBg` (Tailwind bg color class), `tailwindText` (text color class), `icon` (Lucide icon name as string)
  - Color mapping: `reference` → blue-500, `mention` → purple-500, `joke` → amber-400, `aside` → zinc-500, `further-reading` → emerald-500, `warning` → red-500
  - Export `isLinkType(value: string): value is LinkType` type guard
  - Pure TypeScript — no React imports, no framework dependencies

  **Must NOT do**:
  - Do not add animations or hover effects here (static config only)
  - Do not import from Tailwind config or Shadcn — plain string values only

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single config file, pure TypeScript constants, no UI or framework logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Task 5
  - **Blocked By**: None (start immediately)

  **References**:
  - `config/seo.config.ts` — pattern for how plain-TS config files are structured in this project
  - Lucide icon names reference: https://lucide.dev/icons — pick icons matching type mood (e.g. `BookOpen` for reference, `AtSign` for mention, `Smile` for joke, `SidebarOpen` for aside, `Library` for further-reading, `TriangleAlert` for warning)

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: TypeScript types compile without error
    Tool: Bash
    Steps:
      1. Run: pnpm type-check 2>&1 | tail -5
    Expected Result: No errors, exit code 0
    Evidence: .sisyphus/evidence/task-1-typecheck.txt
  ```

  **Commit**: YES (groups with T2, T3)
  - Message: `feat(link-tooltip): add type config, Convex schema, and posts index script`
  - Files: `config/link-types.ts`

- [x] 2. Update Convex schema with og_cache table

  **What to do**:
  - Open `convex/schema.ts`
  - Add a new table `og_cache` to the `defineSchema` call:
    ```typescript
    og_cache: defineTable({
      url: v.string(),         // full URL (key)
      title: v.string(),       // OG title or page title fallback
      description: v.string(), // OG description or empty string
      fetchedAt: v.number(),   // Unix timestamp ms (Date.now())
    }).index('by_url', ['url']),
    ```
  - Do NOT modify any existing table definitions
  - Run `pnpm build:local` after editing to verify Convex type generation succeeds (or check that `convex/_generated/` updates)

  **Must NOT do**:
  - Do not alter `views`, `reactions`, `user_reactions`, or `view_events` tables
  - Do not add validators beyond what's listed above

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Single schema file addition, well-defined structure
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Task 4
  - **Blocked By**: None (start immediately)

  **References**:
  - `convex/schema.ts` — existing schema structure to follow (add table alongside existing ones)
  - `convex/AGENTS.md` (if it exists) — Convex conventions for this project
  - Convex schema docs: https://docs.convex.dev/database/schemas — `defineTable`, `v.*` validators, `.index()` syntax

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: Convex schema generates types successfully
    Tool: Bash
    Steps:
      1. Run: pnpm type-check 2>&1 | tail -5
    Expected Result: 0 errors, exit code 0
    Evidence: .sisyphus/evidence/task-2-typecheck.txt
  ```

  **Commit**: YES (groups with T1, T3)
  - Message: `feat(link-tooltip): add type config, Convex schema, and posts index script`
  - Files: `convex/schema.ts`

- [x] 3. Build posts-index generation script

  **What to do**:
  - Create `scripts/refresh-posts-index.mjs` (plain ESM, no compilation needed)
  - Script reads all MDX files in `content/blogs/` and `content/notes/`
  - For each file, extract the `metadata` export (use a regex or AST parse to get `title`, `description`, `publishDate`, `collection`)
  - Build a map: `{ [slug]: { title, description, href, type: 'blog' | 'note' } }`
    - slug is derived from filename (strip `YYMMDD-` prefix if desired, or use full filename without `.mdx`)
    - href: `/blog/[slug]` for blogs, `/notes/[slug]` for notes
  - Write the map to `lib/data/posts-index.json` (create `lib/data/` if not exists)
  - Add to `package.json` `scripts`: `"prebuild": "node scripts/refresh-posts-index.mjs"` and `"prebuild:local": "node scripts/refresh-posts-index.mjs"` if `build:local` exists
  - Also add to `.gitignore` if `lib/data/` is not already tracked: it should be committed, NOT gitignored
  - Add `lib/data/*.json` to git tracking if needed

  **Must NOT do**:
  - Do not use TypeScript (must be `.mjs` to run without compilation)
  - Do not fetch any external URLs (OG fetching is handled by Convex at runtime)
  - Do not fail the build if a single MDX file has a parse error — log warning and skip

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Node.js script, file I/O, no UI
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: Task 5
  - **Blocked By**: None (start immediately)

  **References**:
  - `lib/content.ts` — how MDX files are read and slug extraction is done (follow same patterns)
  - `scripts/new-blog.js` (or similar) — existing script format to match for consistency
  - `package.json` `scripts` section — where to add `prebuild` and check for `build:local`

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: Script generates valid JSON index
    Tool: Bash
    Steps:
      1. Run: node scripts/refresh-posts-index.mjs
      2. Run: node -e "const d = JSON.parse(require('fs').readFileSync('lib/data/posts-index.json','utf8')); console.log('keys:', Object.keys(d).length)"
    Expected Result: Script exits 0; JSON has >0 keys; each entry has title, description, href fields
    Evidence: .sisyphus/evidence/task-3-posts-index.txt
  ```

  **Commit**: YES (groups with T1, T2)
  - Message: `feat(link-tooltip): add type config, Convex schema, and posts index script`
  - Files: `scripts/refresh-posts-index.mjs`, `lib/data/posts-index.json`, `package.json`

- [x] 4. Add Convex OG cache query, mutation, and action

  **What to do**:
  - Create `convex/ogCache.ts` with:
    - `getByUrl` query: `args: { url: v.string() }`, returns the `og_cache` document or `null`
    - `upsert` mutation: `args: { url: v.string(), title: v.string(), description: v.string() }`, uses `by_url` index to check existence, then `db.insert` or `db.patch`; sets `fetchedAt: Date.now()`
  - Create `convex/actions/fetchAndCacheOG.ts` (or `convex/ogCacheActions.ts`) as a Convex `action`:
    - `args: { url: v.string() }`
    - Fetches the URL with `fetch(url, { signal: AbortSignal.timeout(5000) })` (5s timeout)
    - Parses HTML response with regex or `cheerio` to extract `<meta property='og:title'>`, `<meta property='og:description'>`, `<title>` as fallbacks
    - Calls `ctx.runMutation(api.ogCache.upsert, { url, title, description })` to store result
    - On any error (network, timeout, parse failure): calls `upsert` with `title: url, description: ''` and logs warning — NEVER throws/crashes
  - Add `returns` validator to both the query and mutation per Convex conventions

  **Must NOT do**:
  - Do not use `node:` APIs (Convex actions run in V8 environment, not Node.js)
  - Do not throw errors from the action — graceful degradation only
  - Do not re-fetch if `fetchedAt` is recent (< 30 days) — the client should check before calling the action

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Convex-specific patterns (query/mutation/action), requires careful error handling and timeout handling
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2 (sequential after T2)
  - **Blocks**: Task 5
  - **Blocked By**: Task 2 (schema must exist first)

  **References**:
  - `convex/engagement.ts` — existing query/mutation patterns for this project (follow same structure)
  - `convex/schema.ts` — the `og_cache` table definition added in T2
  - `convex/AGENTS.md` (if exists) — Convex conventions (args/returns validators required)
  - Convex action docs: https://docs.convex.dev/functions/actions — `internalAction`, `ctx.runMutation`, fetch usage
  - Convex query/mutation docs: https://docs.convex.dev/functions/query

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: TypeScript Convex types compile
    Tool: Bash
    Steps:
      1. Run: pnpm type-check 2>&1 | tail -5
    Expected Result: 0 errors
    Evidence: .sisyphus/evidence/task-4-typecheck.txt
  ```

  **Commit**: YES (solo)
  - Message: `feat(link-tooltip): add Convex OG cache query, mutation, and action`
  - Files: `convex/ogCache.ts`, `convex/actions/fetchAndCacheOG.ts` (or equivalent path)
## Final Verification Wave

- [x] F1. **Build + Lint Audit** — `quick`
  Run `pnpm lint && pnpm type-check && pnpm build:local`. Assert: 0 lint errors, 0 type errors, build exits 0.
  Output: `Lint [PASS/FAIL] | Types [PASS/FAIL] | Build [PASS/FAIL] | VERDICT`

- [x] F2. **Full Tooltip QA** — `unspecified-high` (+ `playwright` skill)
  Use Playwright on `http://localhost:3001`. Start dev server. Open a blog post that has at least one annotated link. Hover each annotated link — assert tooltip shows correct badge label, color class, title, description. Verify un-annotated link shows tooltip with title only (no badge). Verify a `#` anchor link shows NO tooltip. Screenshot each scenario to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | VERDICT`

---

## Commit Strategy

- **After T1 + T2 + T3**: `feat(link-tooltip): add type config, Convex schema, and posts index script`
- **After T4**: `feat(link-tooltip): add Convex OG cache query, mutation, and fetch action`
- **After T5**: `feat(link-tooltip): add LinkTooltip component`
- **After T6**: `feat(link-tooltip): wire LinkTooltip into MDX renderer`

---

## Success Criteria

### Verification Commands
```bash
pnpm lint        # Expected: 0 errors
pnpm type-check  # Expected: 0 errors
pnpm build:local # Expected: exit 0
```

### Final Checklist
- [x] Hovering annotated links shows badge + tooltip in MDX posts
- [x] Hovering plain links shows tooltip without badge
- [x] External link tooltips populate from Convex (OG title/description)
- [x] Internal link tooltips resolve instantly (static JSON)
- [x] Anchor links (`#...`) have no tooltip
- [x] `pnpm lint && pnpm type-check` clean

- [x] 5. Build `LinkTooltip` client component

  **What to do**:
  - Create `components/mdx/link-tooltip.tsx`
  - Mark `'use client'` at top (Shadcn Tooltip is interactive, Radix-based)
  - Props: all standard `React.AnchorHTMLAttributes<HTMLAnchorElement>` (i.e., spread `...props` minus `title`)
  - **Parse title attribute** (received via MDX renderer):
    - Destructure `title` out of props, DO NOT forward it to DOM `<a>` (avoids native browser tooltip conflict)
    - If `title` contains `|`: split on first `|` only — `[rawType, note] = title.split('|', 2)`, trim both
    - If `rawType` is a valid `LinkType` (use `isLinkType()` from T1): set `linkType = rawType`, else `linkType = null`
    - If no `|` but `title` is a valid `LinkType`: `linkType = title`, `note = null`
    - If neither: `linkType = null`, `note = title || null`
  - **Detect link kind**:
    - Internal: `href` starts with `/` (path-only) OR matches `https://nanomicon.com/...`
    - Anchor-only: `href` starts with `#` — render plain `<a>` with no tooltip (skip entirely)
    - External: everything else
  - **For internal links**: Import `lib/data/posts-index.json` directly (static JSON import — works in client components, no server-only issue). Look up `href` in the index to get `{ title, description }`.
  - **For external links**: Use `useQuery(api.ogCache.getByUrl, { url: href })` to get cached OG data from Convex. If loading (undefined) — show loading state in tooltip. If null (not cached yet) — call `useMutation(api.ogCache.upsert)` or trigger the Convex action to fetch it.
    - Actually: use a `useMutation` to trigger `fetchAndCacheOG` action on first hover (or mount) for uncached URLs. Show skeleton/spinner while loading.
    - For URLs that are already cached: show tooltip immediately.
  - **Tooltip rendering**: Use Shadcn `Tooltip`, `TooltipTrigger`, `TooltipContent` from `@/components/ui/tooltip`.
    - `TooltipTrigger asChild` — wrap the `<a>` element as the child (not a button)
    - `TooltipContent`: small card containing:
      - If `linkType`: show colored badge (bg from `LINK_TYPES[linkType].tailwindBg`) with label
      - Title: bold short title text
      - Description: muted, max 2 lines (line-clamp-2)
      - If external link: small external link icon on title
    - If no tooltip data available (internal with no match, loading state): render plain `<a>` without tooltip wrapper
  - **Graceful degradation**: If at any point data is null/loading, render children inside a plain `<a>` with original styling

  **Must NOT do**:
  - Do NOT forward `title` prop to the DOM `<a>` element
  - Do NOT use `node:fs` or any server-only imports
  - Do NOT add tooltips to anchor links (`href` starting with `#`)
  - Do NOT depend on Convex for internal links (use static JSON import)
  - Do NOT trigger OG fetch for EVERY uncached link on page load — only trigger on first user hover (use `onMouseEnter` gate)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Non-trivial UI component with state, conditional rendering, two data sources, styled badge/card
  - **Skills**: [`frontend-ui-ux`]
    - `frontend-ui-ux`: Tooltip card layout, badge color system, hover animations, responsive text truncation

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3 (sequential, after T1, T3, T4)
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1 (type defs), 3 (posts-index.json), 4 (Convex OG query/action)

  **References**:
  - `components/ui/tooltip.tsx` — Shadcn Tooltip API (already in project)
  - `config/link-types.ts` — type definitions and color map created in T1
  - `lib/data/posts-index.json` — generated by T3, import directly
  - `convex/_generated/api.ts` — Convex API references for `api.ogCache.getByUrl` and the action
  - `components/mdx/` — browse existing MDX components for styling/class patterns to match
  - Shadcn Tooltip docs: https://ui.shadcn.com/docs/components/tooltip
  - Convex `useQuery`/`useMutation`: https://docs.convex.dev/client/react

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: External link tooltip shows on hover in dev
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on port 3001; visit any blog post with a known external link
    Steps:
      1. Navigate to http://localhost:3001/blog/[slug-with-external-link]
      2. Hover over external link anchor element
      3. Wait up to 3000ms for tooltip to appear
      4. Assert: tooltip content div is visible in DOM
      5. Assert: tooltip contains non-empty title text
      6. Screenshot: .sisyphus/evidence/task-5-external-tooltip.png
    Expected Result: Tooltip appears with title + description text
    Evidence: .sisyphus/evidence/task-5-external-tooltip.png

  Scenario: Anchor links show no tooltip
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running; visit a page with a #anchor link
    Steps:
      1. Navigate to any blog post with a table of contents or anchor links
      2. Hover over an `<a href='#...'>` link
      3. Assert: no tooltip content div appears in DOM
    Expected Result: No tooltip popup, link renders as plain anchor
    Evidence: .sisyphus/evidence/task-5-anchor-no-tooltip.png

  Scenario: Annotated link shows type badge
    Tool: Playwright (playwright skill)
    Preconditions: A test MDX file has a link with title='reference | This explains it' annotation
    Steps:
      1. Visit the test page
      2. Hover over the annotated link
      3. Assert: a badge element with class matching blue color (reference type) is visible
      4. Assert: badge text contains 'Reference' or 'reference'
    Expected Result: Colored type badge appears in tooltip
    Evidence: .sisyphus/evidence/task-5-annotated-badge.png
  ```

  **Commit**: YES (solo)
  - Message: `feat(link-tooltip): add LinkTooltip client component`
  - Files: `components/mdx/link-tooltip.tsx`

- [x] 6. Wire `LinkTooltip` into MDX and layout

  **What to do**:
  - Open `mdx-components.tsx` (root file)
  - Find the `a:` mapping inside `useMDXComponents()`
  - Replace: `a: (props) => <a className='hover:underline font-semibold' {...props} />` with `a: (props) => <LinkTooltip {...props} />`
  - Import `LinkTooltip` from `@/components/mdx/link-tooltip`
  - Open `app/layout.tsx`
  - Verify if `TooltipProvider` from Shadcn is already present somewhere in the component tree (check `components/convex-client-provider.tsx` too)
  - If NOT present: add `<TooltipProvider>` wrapping the children in the layout root
  - If already present: no change needed

  **Must NOT do**:
  - Do not change any other element mapping in `mdx-components.tsx`
  - Do not add `TooltipProvider` if it already exists (would cause nested providers)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small wiring changes to 1-2 files, straightforward substitution
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (after T5)
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: Task 5

  **References**:
  - `mdx-components.tsx` (root) — current `a` mapping (line ~44) to replace
  - `app/layout.tsx` — where to add `TooltipProvider` if missing
  - `components/convex-client-provider.tsx` — check if `TooltipProvider` may already be wrapped here

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: Build passes after wiring
    Tool: Bash
    Steps:
      1. Run: pnpm lint 2>&1 | tail -10
      2. Run: pnpm type-check 2>&1 | tail -10
    Expected Result: 0 lint errors, 0 TypeScript errors
    Evidence: .sisyphus/evidence/task-6-lint-typecheck.txt

  Scenario: No hydration errors in browser console
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on port 3001
    Steps:
      1. Open http://localhost:3001/blog/[any-slug] in Playwright browser
      2. Listen for console messages with level 'error' containing 'hydration'
      3. Hover over any link on the page
    Expected Result: 0 hydration errors in console
    Evidence: .sisyphus/evidence/task-6-no-hydration.txt
  ```

  **Commit**: YES (solo)
  - Message: `feat(link-tooltip): wire LinkTooltip into MDX renderer and layout`
  - Files: `mdx-components.tsx`, `app/layout.tsx` (if modified)

- [x] 7. Playwright QA pass

  **What to do**:
  - Start the dev server: `pnpm dev` on port 3001 (in background via tmux or existing dev server)
  - Create or identify a test MDX blog post that has:
    - An annotated external link: `[text](https://example.com "reference | Used as a source")`
    - An un-annotated external link: `[text](https://github.com)`
    - An annotated internal link: `[text](/blog/some-post "mention | Discussed here")`
    - An anchor link: `[jump](#section)`
  - If no such test post exists: add a temporary draft (`content/drafts/test-tooltips.mdx`) with `NEXT_PUBLIC_SHOW_DRAFTS=true` — verify via localhost only
  - Run the full Playwright QA battery using the `playwright` skill
  - Save all screenshots and DOM captures to `.sisyphus/evidence/task-7-qa/`

  **Must NOT do**:
  - Do not commit the test draft file
  - Do not modify existing blog posts

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Full QA pass with Playwright, cross-scenario coverage
  - **Skills**: [`playwright`]
    - `playwright`: Browser automation for tooltip interaction testing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with T6)
  - **Blocks**: F1-F4 (provides evidence for final verification)
  - **Blocked By**: Task 5

  **References**:
  - QA scenarios defined in Task 5 (external tooltip, anchor no-tooltip, annotated badge)
  - QA scenarios defined in Task 6 (no hydration errors)
  - Dev server config: port 3001 (`pnpm dev`)
  - `playwright` skill: see skill docs for MCP browser control API

  **Acceptance Criteria**:

  **QA Scenarios**:
  ```
  Scenario: Full browser QA battery
    Tool: Playwright (playwright skill)
    Preconditions: Dev server running on http://localhost:3001; test post accessible
    Steps (for each scenario type):
      1. Annotated external link: hover → tooltip appears with badge (reference color) + OG title after load
      2. Un-annotated external link: hover → tooltip appears with title/description, no badge
      3. Annotated internal link: hover → tooltip appears INSTANTLY (no loading state) with badge + post description
      4. Anchor link: hover → NO tooltip, plain anchor styles only
      5. Console: listen for 'error' level messages, assert 0 hydration errors
    Expected Result: All 4 link types behave per spec; 0 console errors
    Failure Indicators: Missing tooltip, wrong badge color, hydration errors, JS exceptions
    Evidence: .sisyphus/evidence/task-7-qa/ (1 screenshot per scenario)
  ```

  **Evidence to Capture**:
  - [x] `task-7-external-annotated.png`
  - [x] `task-7-external-plain.png`
  - [x] `task-7-internal-annotated.png`
  - [x] `task-7-anchor-no-tooltip.png`
  - [x] `task-7-console-clean.txt`

  **Commit**: NO (test draft not committed; no source changes)

---

## Final Verification Wave

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each Must Have: verify implementation exists (read file, confirm component/function exists). For each Must NOT Have: search codebase for forbidden patterns. Check that `lib/data/posts-index.json` was generated and committed. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm lint` + `pnpm type-check`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod code, unused imports, `title` prop leaked to DOM `<a>` element. Check no Convex action throws uncaught errors.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Types [N errors] | VERDICT`

- [x] F3. **Real QA** — `unspecified-high` (+ `playwright` skill)
  Run dev server on port 3001. Test every QA scenario from T1-T6. Additionally test cross-concern integration:
  - Internal link with annotation shows badge + internal post description
  - External link starts loading state, then populates tooltip
  - Anchor link (`#section`) shows plain link, no tooltip
  - Mobile simulation (375px viewport): no tooltip visible, no JS errors
  Save all evidence to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual git diff. Verify 1:1 alignment. Check no cross-task contamination. Ensure `title` parsing handles all annotated edge cases (type-only, note-only, neither, pipe in note).
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N] | VERDICT`

---

## Commit Strategy

- **T1+T2+T3**: `feat(link-tooltip): add type config, Convex schema, and posts index script`
- **T4**: `feat(link-tooltip): add Convex OG cache query, mutation, and action`
- **T5**: `feat(link-tooltip): add LinkTooltip client component`
- **T6**: `feat(link-tooltip): wire LinkTooltip into MDX renderer and layout`

## Success Criteria

### Verification Commands
```bash
pnpm lint              # Expected: 0 errors
pnpm type-check        # Expected: 0 TypeScript errors
node scripts/refresh-posts-index.mjs  # Expected: exits 0
node -e "JSON.parse(require('fs').readFileSync('lib/data/posts-index.json','utf8'))"  # Expected: valid JSON
```

### Final Checklist
- [x] `config/link-types.ts` defines 6 types with distinct colors
- [x] `convex/schema.ts` has `og_cache` table with `by_url` index
- [x] `convex/ogCache.ts` has `getByUrl` query and `upsert` mutation
- [x] Convex action `fetchAndCacheOG` fetches and stores OG metadata with 5s timeout
- [x] `scripts/refresh-posts-index.mjs` generates `lib/data/posts-index.json`
- [x] `components/mdx/link-tooltip.tsx` is `'use client'`, never forwards `title` to DOM, handles all 3 link kinds (internal, external, anchor)
- [x] `mdx-components.tsx` maps `a` to `LinkTooltip`
- [x] `pnpm lint && pnpm type-check` clean
