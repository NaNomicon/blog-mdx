import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { cache } from "react";
import { unstable_cache } from "next/cache";

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
  collection: z.string(),
  type: z.enum(["thought", "link", "book", "idea"]).optional(),
  description: z.string().optional(),
  source_url: z.string().url().optional(),
  book_title: z.string().optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  spoiler: z.boolean().optional(),
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
export const getAllPosts = cache(async function getAllPosts<T extends BlogPostMetadata | NoteMetadata>(
  type: ContentType,
  includeDrafts: boolean = false,
  _intendedType?: "blogs" | "notes"
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
        const mdxModule = await import(`@/content/${type}/${filename}`);
        const metadata = mdxModule.metadata;
        
        if (!metadata) return null;

        // Validate metadata based on type or intended type for drafts
        const validationType = type === "drafts" ? (_intendedType || "blogs") : type;
        
        // Strict filtering: if we want notes, it MUST have a collection
        if (validationType === "notes" && !metadata.collection) {
          return null;
        }
        
        // If we want blogs, it MUST NOT have a collection (to keep them separate)
        if (validationType === "blogs" && metadata.collection) {
          return null;
        }

        const schema = validationType === "notes" ? NoteMetadataSchema : BlogPostMetadataSchema;
        const validatedMetadata = schema.parse(metadata);

        return {
          slug,
          metadata: validatedMetadata as T,
          type,
        };
      } catch (error) {
        // Silently skip if metadata doesn't match the schema (e.g. blog draft when looking for notes)
        // console.error(`Error loading metadata for ${type}/${filename}:`, error);
        return null;
      }
    })
  );

  const validPosts = posts.filter((post): post is Post<T> => post !== null);

  // If including drafts and we are not already looking at drafts
  if (includeDrafts && type !== "drafts") {
    const drafts = await getAllPosts<T>("drafts", false, type as "blogs" | "notes");
    validPosts.push(...drafts);
  }

  // Sort by publishDate descending
  return validPosts.sort(
    (a, b) =>
      new Date(b.metadata.publishDate).getTime() -
      new Date(a.metadata.publishDate).getTime()
  );
});

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
      const isDraft = mdxPath.includes("/drafts/");
      const actualType = isDraft ? "drafts" : type;
      try {
        const { metadata } = await import(`@/content/${actualType}/${slug}.mdx`);
        
        // Use the original requested type to determine schema, even if it's a draft
        const validationType = type === "drafts" ? "blogs" : type;
        const schema = validationType === "notes" ? NoteMetadataSchema : BlogPostMetadataSchema;
        const validatedMetadata = schema.parse(metadata);

        return {
          slug,
          metadata: validatedMetadata as T,
          type: actualType as ContentType,
        };
      } catch (error) {
        // Only log error if it's not a schema mismatch for a draft
        if (!isDraft) {
          console.error(`Error loading post ${actualType}/${slug}:`, error);
        }
        continue;
      }
    }
  }

  return null;
}

export async function getAdjacentPosts<T extends BlogPostMetadata | NoteMetadata>(
  type: ContentType,
  slug: string,
  includeDrafts: boolean = false
): Promise<{ prev: Post<T> | null; next: Post<T> | null }> {
  const posts = await getAllPosts<T>(type, includeDrafts);
  const index = posts.findIndex((post) => post.slug === slug);

  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: index > 0 ? posts[index - 1] : null,
    next: index < posts.length - 1 ? posts[index + 1] : null,
  };
}

/**
 * Helper to check if we are in preview mode (development or explicit flag)
 */
export function isPreviewMode(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_SHOW_DRAFTS === "true";
}
