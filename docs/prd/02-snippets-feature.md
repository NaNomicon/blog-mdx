# PRD: Snippets & Notes System

## 1. Overview
The Snippets & Notes System is an extension of the existing blog platform designed for short-form content, quick thoughts, book summaries, and web discoveries. Unlike long-form blog posts, snippets are optimized for scannability, quick consumption, and dense grouping (e.g., by date or topic). This feature aims to capture the "digital garden" aspect of personal blogging, allowing for more frequent, smaller updates.

## 2. User Stories
- **As a writer**, I want to quickly jot down thoughts or quotes without the pressure of writing a full-length article.
- **As a reader**, I want to browse through a stream of short updates and filter them by specific interests (e.g., AI, book notes).
- **As a researcher**, I want to see all notes related to a specific book or topic grouped together so I can see the progression of thoughts.
- **As a visitor**, I want to see a "Daily Digest" of what the author was thinking or reading on a specific day.

## 3. Functional Requirements

### 3.1 Content Management
- Support for MDX files in a new `content/notes/` directory.
- Follow the existing naming convention: `YYMMDD-slug.mdx`.
- Snippets can be categorized as: `thought`, `link`, `book`, `idea`, etc.

### 3.2 Metadata & Taxonomy
- **Mandatory Metadata**:
  - `title`: Short title or first line of the snippet.
  - `publishDate`: YYYY-MM-DD.
  - `type`: One of [`thought`, `link`, `book`, `idea`].
- **Optional Metadata**:
  - `source_url`: URL for link-based snippets.
  - `book_title`: Title of the book for book-related notes.
  - `tags`: Array of strings for fine-grained grouping.
  - `category`: Broader grouping (e.g., "Web Dev", "Philosophy").

### 3.3 Viewing & Grouping
- **Main Notes Page**: A chronological feed of all snippets.
- **Filtering**: Ability to filter by `type`, `category`, and `tags`.
- **Daily Digest**: A specialized view that groups all snippets from the same `publishDate` under a single date heading.
- **Tag/Book Archives**: Dedicated pages for tags (e.g., `/notes/tag/ai`) or books (e.g., `/notes/book/dune`).
- **Related Notes Widget**: Display relevant snippets on long-form blog posts based on shared tags.

## 4. UI/UX Requirements
- **Layout**: 
  - **Snippet Card**: Minimalist design with no large headers. Focus on content.
  - **Grid/List Toggle**: Allow users to switch between a dense list view and a more visual card grid.
  - **Icons**: Distinct icons for each snippet type (e.g., 📝 for thought, 🔗 for link, 📚 for book).
- **Interactions**:
  - Infinite scroll or "Load More" for the main feed.
- **Responsiveness**: Mobile-first design, cards stack vertically on small screens.
- **Accessibility**: High contrast for text snippets, ARIA labels for type icons.

## 5. Technical Considerations
- **Data Model**: MDX files in `content/notes/`. Extend the current `PostMetadata` interface to include snippet-specific fields.
- **Backend/Logic**:
  - Helper functions to group posts by date (Daily Digest logic).
  - Search indexing to include snippets in the global site search.
- **Libraries/Tools**: 
  - Reuse existing Shadcn UI components (`Card`, `Badge`, `Button`).
  - `lucide-react` for snippet type icons.
- **Performance**: 
  - Use Server Components for initial feed rendering.
  - Client-side filtering for immediate feedback.

## 6. Success Metrics
- **Content Volume**: Increase in total published items (snippets + blogs) by 50%.
- **Engagement**: Increase in page views for the "Notes" section compared to standard blog posts.
- **Navigation**: Users visiting more than 3 snippets per session.
- **Scannability**: Average time spent on the main notes page > 1 minute (indicating active reading/browsing).
