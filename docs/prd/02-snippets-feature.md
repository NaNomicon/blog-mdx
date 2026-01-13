# PRD: Snippets & Notes System

## 1. Overview
The Snippets & Notes System is an extension of the existing blog platform designed for short-form content, quick thoughts, book summaries, and web discoveries. Unlike long-form blog posts, snippets are optimized for scannability, quick consumption, and dense grouping. This feature aims to capture the "digital garden" aspect of personal blogging, allowing for more frequent, smaller updates via a highly interactive and fluid UI.

## 2. User Stories
- **As a writer**, I want to quickly jot down thoughts or quotes without the pressure of writing a full-length article.
- **As a reader**, I want to browse through a stream of short updates in a visually engaging way and filter them by specific interests.
- **As a researcher**, I want to see all notes related to a specific book or topic grouped together.
- **As a visitor**, I want to read notes sequentially without leaving the main list page to maintain context.

## 3. Functional Requirements

### 3.1 Content Management
- Support for MDX files in a new `content/notes/` directory.
- Follow the existing naming convention: `YYMMDD-slug.mdx`.
- Snippets can be grouped into cohesive collections for better organization.

### 3.2 Metadata & Taxonomy
- **Mandatory Metadata**:
  - `title`: Short title or first line of the snippet.
  - `publishDate`: YYYY-MM-DD.
  - `collection`: The name of the collection this snippet belongs to (e.g., "Daily Log", "React Tips", "Book: Dune").
- **Optional Metadata**:
  - `source_url`: URL for link-based snippets.
  - `book_title`: Title of the book for book-related notes.
  - `tags`: Array of strings for fine-grained grouping.
  - `category`: Broader grouping (e.g., "Web Dev", "Philosophy").

### 3.3 Viewing & Grouping
- **Main Notes Page**: A chronological feed of all snippets using a Masonry/Grid-lane layout.
- **Filtering**: Ability to filter by `collection`, `category`, and `tags` via a sticky sidebar or top bar.
- **Collection Archives**: Dedicated pages for each collection (e.g., `/notes/collection/daily-log`) that show only snippets from that collection.
- **Daily Digest**: Group snippets from the same `publishDate` under a single date heading.
- **Sequential Navigation**: Ability to navigate to the "Previous" or "Next" note directly from the current note view.

## 4. UI/UX Requirements
- **Layout**: 
  - **Masonry/Grid-Lanes**: A responsive, multi-column masonry layout where cards of varying heights fit together efficiently. 
  - **Responsive**: 1 column on mobile, 2 on tablet, 3+ on desktop.
  - **Snippet Card**: Minimalist design focusing on content. Collection-specific badges or subtle color coding to distinguish between different collections.
- **Interactions**:
  - **Dialog-First Navigation**: Clicking a note in the list opens it in a Modal/Dialog overlay.
  - **Query-Parameter Modals**: The URL updates to `/notes?note=[slug]` when the dialog opens. This ensures the list page always remains visible in the background and is more robust than intercepting routes.
  - **Deep Linking**: Refreshing or visiting `/notes?note=[slug]` directly opens the list with the dialog context pre-active. Full paths like `/notes/[slug]` are reserved for direct/SEO access with a "Back" button.
  - **In-Dialog Navigation**: "Previous" and "Next" buttons inside the dialog to cycle through the filtered list of notes.
  - **Infinite Scroll**: "Load More" or auto-scroll for the main feed.
- **Accessibility**:
  - ARIA Modal patterns for the dialog.
  - Keyboard navigation (Esc to close, Arrow keys for Prev/Next).
  - High contrast for dense text.

## 5. Technical Considerations
- **Data Model**: Extend `PostMetadata` in `lib/content.ts` to include snippet-specific fields like `collection`.
- **Backend/Logic**:
  - **Query-Parameter State**: Utilize Next.js 14 `searchParams` to handle the dialog-over-list pattern. This avoids the complexity and occasional inconsistencies of parallel/intercepting routes.
  - **Grouped Sorting**: Helper functions to fetch notes and group them by date or collection.
- **Libraries/Tools**: 
  - `react-masonry-css` or Tailwind `columns-` for the masonry layout.
  - `framer-motion` for smooth dialog transitions and card entries.
  - Shadcn UI `Dialog` component.
- **Performance**: 
  - Use Server Components for the initial list and note content.
  - Prefetching for Prev/Next notes to make navigation feel instantaneous.

## 6. Success Metrics
- **Content Volume**: Increase in total published items by 50%.
- **Engagement**: Users visiting more than 5 snippets per session due to easier navigation.
- **UX Fluidity**: Average time spent in "Dialog Mode" vs. bouncing back to the list.
- **Direct Access**: 99% success rate for deep-linked notes loading correctly.
