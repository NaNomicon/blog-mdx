# PRD: MDX Blog System

## 1. Overview
The MDX Blog System is a lightweight, performant, and developer-friendly blogging platform. It allows users to write content in MDX, enabling the use of React components within Markdown. The system is designed for high SEO visibility, fast loading times, and a seamless developer experience for personal blogging.

## 2. User Stories
- **As a writer**, I want to write blog posts in MDX so that I can use interactive components (like YouTube embeds, custom callouts, and code snippets) in my content.
- **As a reader**, I want a clean, responsive interface with a Table of Contents so that I can easily navigate through long articles.
- **As a developer**, I want to easily scaffold new blog posts with metadata so that I can focus on writing content rather than configuration.
- **As an SEO specialist**, I want every post to have proper meta tags and structured data so that the content ranks well on search engines.

## 3. Functional Requirements

### 3.1 Content Management
- Support for MDX files in `content/blogs/`.
- Automatic slug generation based on filename.
- Draft support via `content/drafts/`.
- Static site generation (SSG) for all blog posts.
- Incremental Static Regeneration (ISR) to update content without a full rebuild (currently set to 1 hour).

### 3.2 Metadata & Taxonomy
- Mandatory metadata for each post: `title`, `publishDate`, `description`, `category`, `cover_image`.
- Optional metadata: `tldr`.
- Category-based filtering and display.

### 3.3 Interactive Features
- **Table of Contents (TOC)**: Automatically generated from headings (H1-H6).
- **Custom Components**: Support for `YouTube`, `Callout`, `Code` (with syntax highlighting), and `Heading` (with anchor links).
- **Theme Toggle**: Light and dark mode support.

### 3.4 Notifications & Integration
- **Telegram Bot**: Notify users or admins of new posts or interactions via a Telegram bot integration.
- **Analytics**: Integration with Umami and Vercel Analytics for tracking page views and performance.

## 4. UI/UX Requirements
- **Layout**: Clean typography using `prose` (Tailwind Typography). Responsive design optimized for mobile, tablet, and desktop.
- **Interactions**: 
  - Floating TOC on desktop.
  - Collapsible TOC on mobile.
  - Smooth scrolling to anchors.
  - Syntax highlighting for code blocks.
- **Accessibility**: Semantic HTML, ARIA labels for navigation elements, and high-contrast text for readability.
- **Internationalization**: Currently focused on English, but structure supports future i18n implementation.

## 5. Technical Considerations
- **Data Model**: No database; MDX files act as the source of truth. Metadata is extracted from MDX exports.
- **Backend/Logic**: 
  - `generateStaticParams` for dynamic routing.
  - Dynamic imports for MDX content to reduce bundle size.
  - Custom scripts for blog generation and versioning.
- **Libraries/Tools**: 
  - `next-mdx`: For MDX integration.
  - `tailwind-typography`: For content styling.
  - `grammY`: For Telegram bot logic.
  - `lucide-react`: For iconography.
- **Performance**: 
  - Image optimization via `next/image`.
  - Minimal client-side JavaScript by leveraging Server Components.
  - Global CSS for rapid styling.

## 6. Success Metrics
- **Performance**: Core Web Vitals (LCP < 2.5s, CLS < 0.1).
- **SEO**: 100/100 Lighthouse SEO score.
- **Engagement**: Average time on page > 2 minutes.
- **Efficiency**: Time to create and publish a new blog post < 5 minutes.
