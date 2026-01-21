# AGENTS.md

This guide provides essential information for agentic coding assistants working on this repository.

## Development Commands

### Core Commands
```bash
pnpm dev                    # Start dev server on port 3001
pnpm build                  # Build for production (deploys convex)
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm type-check             # Run TypeScript type checking
pnpm new-blog               # Create new blog post
pnpm new-note               # Create new note
pnpm version:patch          # Bump patch version (0.1.1 → 0.1.2)
pnpm version:minor           # Bump minor version (0.1.1 → 0.2.0)
pnpm version:major           # Bump major version (0.1.1 → 1.0.0)
```

### Testing
No custom test files. Manually test in development, run `pnpm lint` and `pnpm type-check` before committing. Use preview mode for drafts: `NEXT_PUBLIC_SHOW_DRAFTS=true pnpm dev`

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
```typescript
export interface ComponentProps {
  className?: string;
}
```

### File Naming
Components: PascalCase (`BlogLayout.tsx`)
Utilities/lib: kebab-case (`error-handler.ts`)
MDX: `YYMMDD-slug.mdx` (`260113-example.mdx`)
Hooks: kebab-case starting with `use-`

### Component Structure
```typescript
'use client';  // Only for interactive features
import { cn } from "@/lib/utils";
export function Component({ className }: ComponentProps) {
  return <div className={cn("base-classes", className)}>{/* content */}</div>;
}
```

### Styling
Tailwind CSS classes with `cn()` utility. Support dark mode with `dark:` variants.
```typescript
<div className={cn("bg-white dark:bg-black", className)}>
```

### Naming
Components: PascalCase, Functions: camelCase, Constants: SCREAMING_SNAKE_CASE/camelCase, Types: PascalCase

### Error Handling
Use Error Boundary (`components/error-boundary.tsx`) and `logError()` from `@/lib/error-handler`.
```typescript
try { /* code */ } catch (error) {
  logError(error, { severity: 'high', additionalData: { context: '...' } });
}
```

### MDX Content
All posts need metadata:
```typescript
export const metadata = {
  title: "Title", publishDate: "YYYY-MM-DD", description: "...",
  category: "...", cover_image: "/path.png", tldr: "...", tags: []
};
```

### SEO
Use `generateSEOMetadata()` from `@/lib/seo`. Include `BlogPostStructuredData` and `BreadcrumbStructuredData`. See `app/blog/[slug]/page.tsx`.

### Next.js App Router
Server components by default. Use `'use client'` for interactivity. Use `dynamic()`, `notFound()`. ISR: `export const revalidate = 3600`.

### Convex
`convex deploy` runs during build. Types in `convex/`, Provider in `components/convex-client-provider.tsx`.

### Telegram
Error notifications in `lib/telegram/`. See `lib/telegram/README.md`.

## Tech Stack
Next.js 14 (App Router), Tailwind CSS + Shadcn UI, MDX, Convex, Lucide/Simple Icons, Zod, pnpm

## Key Patterns
Path alias: `@/*` for root. Utilities: `cn()` for Tailwind merging, `generateSEOMetadata()` for SEO, `getPostBySlug()` for content.

## Project Structure
```
app/              # App Router pages
components/       # UI, MDX, nav components
  ui/            # Shadcn UI
  mdx/           # Custom MDX components
content/
  blogs/         # Production posts (YYMMDD-slug.mdx)
  drafts/        # Draft posts
  notes/         # Notes
lib/             # Utilities, helpers, Telegram
scripts/         # Development tools
convex/          # Backend functions
public/          # Static assets
```

## Linting & Type Checking
Always run before committing: `pnpm lint` (ESLint) and `pnpm type-check` (TypeScript strict)

## Important Notes
Never commit secrets (.env.local). Blog posts use ISR (1 hour). Dark mode required for UI. Mobile-first design. Semantic HTML. Client/server compatible.
