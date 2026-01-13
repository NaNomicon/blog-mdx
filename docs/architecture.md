# Architecture Documentation: personal-blog-mdx

## System Overview
This project is a static-first blog built with Next.js 14, leveraging the App Router and MDX. It follows a "Git-based CMS" pattern where content is stored as files in the repository.

## Directory Structure
- `app/`: Next.js App Router pages and layouts.
- `components/`: UI components, MDX-specific components, and layout wrappers.
- `content/`: MDX source files for blogs, notes, and static pages.
- `lib/`: Shared logic, utilities, and integrations (Telegram, SEO).
- `public/`: Static assets like images and manifest files.
- `scripts/`: CLI tools for managing the blog workflow.

## Key Workflows

### 1. Content Rendering Pipeline
1. **Dynamic Route**: `app/blog/[slug]/page.tsx` and `app/notes/[slug]/page.tsx` capture the slug.
2. **Metadata Extraction**: The MDX file is imported to extract its exported `metadata` object.
3. **SEO Generation**: `generateMetadata` uses the extracted metadata to set page titles, descriptions, and OpenGraph tags.
4. **Dynamic Import**: `MDXContent` is loaded via `next/dynamic` to keep the main bundle light.
5. **Layout Injection**: `BlogLayout` or `NoteLayout` wraps the content, providing specialized UI for long-form or short-form content.
6. **Component Mapping**: `mdx-components.tsx` maps standard Markdown elements (h1, p, etc.) and custom components (YouTube, Callout) to React components.

### 2. Snippets & Notes Grouping
1. **Source**: Files in `content/notes/`.
2. **Taxonomy**: Grouped by `type`, `tags`, or `book_title`.
3. **Daily Digest**: Logic to group snippets by `publishDate` for chronological browsing.
4. **Integration**: Related snippets are cross-referenced on blog posts using shared tags.

### 3. Post Creation Workflow
1. User runs `pnpm new-blog` or `pnpm new-note`.
2. `scripts/new-blog.js` or `scripts/new-note.js` prompts for post details.
3. A new MDX file is created in `content/blogs/` or `content/notes/` with a timestamped filename (YYMMDD-slug.mdx).
4. Assets are manually placed in `public/YYMMDD-slug/`.

### 3. Telegram Bot Integration
- Located in `lib/telegram/`.
- Uses `grammY` library.
- Initialized via `lib/telegram/init.ts`.
- Supports various notification types (new posts, server status, etc.).

### 4. Deployment & Versioning
- **Versioning**: `scripts/version-bump.js` handles semver updates and updates `package.json`.
- **Docker**: A multi-stage `Dockerfile` builds the Next.js app and serves it using the standalone output mode for efficiency.
- **CI/CD**: Designed to be deployed on Dokploy or similar VPS-based deployment platforms.

## Design Patterns
- **Server Components**: Used by default for all pages and layouts to minimize client-side JS.
- **Islands Architecture (Selective Hydration)**: Only complex interactive components (like TOC or Search) are marked as `'use client'`.
- **Composition**: `BlogLayout` uses composition to separate layout concerns from the content rendering logic.
- **Zod Validation**: Used for environment variable validation and potentially for metadata schema in the future.

## Performance Optimizations
- **Static Generation**: All blog posts are pre-rendered at build time.
- **ISR**: Revalidation every 3600 seconds ensures content updates without full rebuilds.
- **Image Optimization**: `next/image` is used for all cover and content images.
- **Dynamic Imports**: MDX files are loaded only when requested.
