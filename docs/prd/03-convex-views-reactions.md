# PRD: Convex Views & Reactions System

## 1. Overview
This project integrates Convex as the primary real-time database to enhance the interactive capabilities of the blog. The immediate focus is to implement a robust view-tracking system and a flexible reaction system for both long-form blog posts and short-form notes. By leveraging Convex's anonymous authentication, we can track unique interactions without requiring users to create a formal account, thereby increasing engagement while maintaining low friction.

## 2. User Stories
- **As a reader**, I want to see how many people have read a post so that I can gauge its popularity.
- **As a reader**, I want to react to a post (e.g., ❤️, 👍, 🚀) anonymously so that I can express my appreciation without signing up.
- **As a writer**, I want to track engagement metrics (views and reactions) for my content in real-time.
- **As a mobile user**, I want to see engagement stats at the top of the post for quick context.
- **As a desktop user**, I want to see reactions on the side of the post so they don't interrupt the reading flow but remain accessible.

## 3. Functional Requirements

### 3.1 View Tracking
- **Automatic Increment**: Increment view count when a post or note is loaded.
- **Uniqueness**: Use Convex's anonymous authentication (or session-based logic) to prevent inflated view counts from simple refreshes.
- **Real-time Updates**: View counts should update in real-time across all active clients.

### 3.2 Reaction System
- **Arbitrary Reactions**: Support for any emoji with some predefined emojis and a emoji selection.
- **Anonymous Participation**: Users can react without logging in, tracked via Convex anonymous auth.
- **Toggle State**: Users should be able to add or remove their own reactions.
- **Aggregation**: Display total counts for each reaction type per post/note.

### 3.3 Scope & Constraints
- **Content Types**: Both `blogs` and `notes` are supported.
- **Comments**: Out of scope for this version (deferred to a later PRD).
- **Authentication**: Initial implementation uses Anonymous Auth; transition to full Auth (GitHub/Google) should be seamless later.

## 4. UI/UX Requirements

### 4.1 Layout & Placement
- **Mobile**:
  - **Sticky Engagement Button**: Engagement stats (views + reaction summary) should always be accessible via a sticky floating button/icon on mobile, similar to how the Table of Contents collapsed icon behaves. 
- **Desktop**:
  - **Reaction Bar**: A vertical floating bar on the left side of the post content.
- **List page**: Also show the views count and reactions on the blog list page.
- **Notes Feed**: Small engagement badges on note cards in the masonry list.

### 4.2 Interactions
- **Optimistic Updates**: Reactions should feel instantaneous using Convex optimistic updates.
- **Animations**: Subtle scale-up/bounce animation when a reaction is clicked.
- **Tooltips**: Show "React with [Emoji]" or total count details on hover (desktop).

### 4.3 Accessibility
- Accessible button labels for reaction triggers.
- ARIA live regions for real-time count updates to inform screen reader users of changes.

## 5. Technical Considerations

### 5.1 Data Model (Convex Schema)
- `views` table:
  - `slug`: string (index)
  - `count`: number
  - `lastUpdated`: number
- `reactions` table:
  - `slug`: string (index)
  - `type`: string (emoji/id)
  - `count`: number
- `user_reactions` table (to track who reacted to what):
  - `slug`: string
  - `reactionType`: string
  - `userId`: string (anonymous or authenticated ID)

### 5.2 Backend Logic
- **Anonymous Auth**: Implement `@convex-dev/auth` with anonymous provider.
- **Mutations**:
  - `recordView(slug)`: Increments view count.
  - `toggleReaction(slug, type)`: Adds/removes a reaction for the current user.
- **Queries**:
  - `getEngagement(slug)`: Returns views and aggregated reactions.
  - `getUserReactions(slug)`: Returns reactions the current user has already picked.

### 5.3 Libraries/Tools
- **Convex**: Real-time database and serverless functions.
- **@convex-dev/auth**: For anonymous and future social authentication.
- **Framer Motion**: For reaction animations.

### 5.4 Performance
- Leverage Convex's subscription model for real-time efficiency.
- Use `useQuery` with `skip: true` or similar patterns to avoid unnecessary fetches on non-blog pages.

## 6. Success Metrics
- **Engagement Rate**: 20% of readers interacting with at least one reaction.
- **Real-time Latency**: Updates reflected across clients in < 200ms.
- **Data Integrity**: Zero duplication of anonymous IDs within a single session/browser context.
