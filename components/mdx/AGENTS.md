# components/mdx/ — Custom MDX Rendering Components

Custom renderers and interactive widgets used inside MDX blog posts and notes. All files handle either visual rendering, Convex-powered engagement, or link tooltips.

## Files

| Component | Purpose | Client? |
|-----------|---------|---------|
| `blog-layout.tsx` | Post shell: header, ToC, adjacent nav, metadata | Server |
| `callout.tsx` | Styled callout blocks (info, warning, danger, tip) | Server |
| `code.tsx` | Syntax-highlighted code blocks | Server |
| `pre.tsx` | Code block wrapper with copy button | Client |
| `heading.tsx` | h1–h6 with anchor links | Server |
| `inline-code.tsx` | Inline `<code>` styling | Server |
| `table-of-contents.tsx` | Floating/sidebar ToC from heading anchors | Client |
| `scroll-to-hash.tsx` | Smooth scroll on hash navigation | Client |
| `view-tracker.tsx` | Records post view to Convex on mount | Client |
| `engagement.tsx` | Full reaction UI (emoji picker, counts) | Client |
| `engagement-stats.tsx` | Display-only engagement numbers | Client |
| `inline-engagement.tsx` | Compact engagement for inline use | Client |
| `youtube.tsx` | YouTube embed with lazy loading | Client |
| `link-tooltip.tsx` | Hover tooltips on MDX links (internal + external, OG data) | Client |

## Usage

Custom MDX components are mapped in the root `mdx-components.tsx`. Rendering order: MDX → `mdx-components.tsx` → components here.

```typescript
// mdx-components.tsx (root)
import { Code } from "@/components/mdx/code";
export function useMDXComponents(components: MDXComponents) {
  return { code: Code, h1: Heading, ... };
}
```

## Engagement Architecture

1. `view-tracker.tsx` → `convex/engagement.ts::recordView` (fires once per session per slug)
2. `engagement.tsx` → `convex/engagement.ts::toggleReaction` + `getUserReactions` (real-time subscriptions)
3. Both use `useConvexAuth()` from `components/convex-client-provider.tsx`

## Link Tooltip Architecture

1. `link-tooltip.tsx` maps `<a>` tags in MDX via `mdx-components.tsx`
2. Internal links → instant lookup from `lib/data/posts-index.json` (static import)
3. External links → `useQuery(ogCache.getByUrl)` + lazy `useAction(ogCacheActions.fetchAndCacheOG)` on hover
4. Author annotations via Markdown title attribute: `[text](url "type | note")` where type ∈ {reference, mention, joke, aside, further-reading, warning}
5. Config: `config/link-types.ts` defines badge colors/labels for each type
6. Wrapped in `LinkTooltipErrorBoundary` — Convex failures fall back to plain `<a>` tags

## Anti-Patterns

- **Never** add data fetching (`fetch`, `getAllPosts`) inside MDX components — pass data via page props
- **Never** use `'use server'` in MDX components — they are rendered client-side when interactive
- **Never** import Convex mutations in server components — Convex hooks require client context
- Interactive components **must** have `'use client'` at the top
