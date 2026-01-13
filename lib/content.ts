import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

// --- Schemas ---

export const BlogPostMetadataSchema = z.object({
  title: z.string(),
  publishDate: z.string(), // YYYY-MM-DD
  description: z.string(),
  category: z.string(),
  cover_image: z.string(),
  tldr: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type BlogPostMetadata = z.infer<typeof BlogPostMetadataSchema>;

export const NoteMetadataSchema = z.object({
  title: z.string(),
  publishDate: z.string(),
  type: z.enum(["thought", "link", "book", "idea"]),
  description: z.string().optional(),
  source_url: z.string().url().optional(),
  book_title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
});

export type NoteMetadata = z.infer<typeof NoteMetadataSchema>;

export type ContentType = "blogs" | "notes" | "drafts";

export interface Post<T> {
  slug: string;
  metadata: T;
  type: ContentType;
}

// --- Content Library ---

const CONTENT_PATH = path.join(process.cwd(), "content");

/**
 * Get all posts of a specific type
 */
export async function getAllPosts<T extends BlogPostMetadata | NoteMetadata>(
  type: ContentType,
  includeDrafts: boolean = false
): Promise<Post<T>[]> {
  const dir = path.join(CONTENT_PATH, type);
  
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter(
    (filename) => filename.endsWith(".mdx") && !filename.startsWith(".")
  );

  const posts = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(".mdx", "");
      try {
        // Use dynamic import for metadata
        // Note: In Next.js App Router, we need to be careful with dynamic imports in Server Components
        // But for metadata extraction, this is generally fine if configured correctly.
        const { metadata } = await import(`@/content/${type}/${filename}`);
        
        // Validate metadata
        const schema = type === "notes" ? NoteMetadataSchema : BlogPostMetadataSchema;
        const validatedMetadata = schema.parse(metadata);

        return {
          slug,
          metadata: validatedMetadata as T,
          type,
        };
      } catch (error) {
        console.error(`Error loading metadata for ${type}/${filename}:`, error);
        return null;
      }
    })
  );

  const validPosts = posts.filter((post): post is Post<T> => post !== null);

  // If including drafts and we are not already looking at drafts
  if (includeDrafts && type !== "drafts") {
    const drafts = await getAllPosts<T>("drafts");
    // Mark them as drafts or handle them as needed
    validPosts.push(...drafts);
  }

  // Sort by publishDate descending
  return validPosts.sort(
    (a, b) =>
      new Date(b.metadata.publishDate).getTime() -
      new Date(a.metadata.publishDate).getTime()
  );
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug<T extends BlogPostMetadata | NoteMetadata>(
  type: ContentType,
  slug: string,
  checkDrafts: boolean = true
): Promise<Post<T> | null> {
  const possiblePaths = [
    path.join(CONTENT_PATH, type, `${slug}.mdx`),
  ];

  if (checkDrafts && type !== "drafts") {
    possiblePaths.push(path.join(CONTENT_PATH, "drafts", `${slug}.mdx`));
  }

  for (const mdxPath of possiblePaths) {
    if (fs.existsSync(mdxPath)) {
      const actualType = mdxPath.includes("/drafts/") ? "drafts" : type;
      try {
        const { metadata } = await import(`@/content/${actualType}/${slug}.mdx`);
        const schema = actualType === "notes" ? NoteMetadataSchema : BlogPostMetadataSchema;
        const validatedMetadata = schema.parse(metadata);

        return {
          slug,
          metadata: validatedMetadata as T,
          type: actualType as ContentType,
        };
      } catch (error) {
        console.error(`Error loading post ${actualType}/${slug}:`, error);
        return null;
      }
    }
  }

  return null;
}

/**
 * Helper to check if we are in preview mode (development or explicit flag)
 */
export function isPreviewMode(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
}
