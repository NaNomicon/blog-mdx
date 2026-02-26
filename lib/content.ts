import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { cache } from "react";

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
  pinned: z.boolean().optional(),
});

export type NoteMetadata = z.infer<typeof NoteMetadataSchema>;

export type ContentType = "blogs" | "notes" | "drafts" | "pages";

export interface Post<T> {
  slug: string;
  metadata: T;
  type: ContentType;
  contentLength: number;
}

// --- Content Library ---

const CONTENT_BASE = path.join(process.cwd(), "content");

/**
 * Get all posts of a specific type, scanned from content/{locale}/{type}/
 * Preview-mode drafts are automatically included when NEXT_PUBLIC_SHOW_DRAFTS=true or NODE_ENV=development.
 *
 * @param type - Content type (blogs, notes, drafts)
 * @param locale - Locale directory to scan (default: 'en')
 * @param _intendedType - Internal: used for draft validation when type === 'drafts'
 */
export const getAllPosts = cache(async function getAllPosts<T extends BlogPostMetadata | NoteMetadata>(
  type: ContentType,
  locale: string = "en",
  _intendedType?: "blogs" | "notes",
): Promise<Post<T>[]> {
  const dir = path.join(CONTENT_BASE, locale, type);

  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir).filter(
    (filename) => filename.endsWith(".mdx") && !filename.startsWith(".")
  );

  const posts = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(".mdx", "");
      const mdxPath = path.join(dir, filename);
      try {
        const stats = fs.statSync(mdxPath);
        // Use dynamic import for metadata
        const mdxModule = await import(`@/content/${locale}/${type}/${filename}`);
        const metadata = mdxModule.metadata;

        if (!metadata) return null;

        // Validate metadata based on type or intended type for drafts
        const validationType = type === "drafts" ? (_intendedType || "blogs") : type;

        // Pages don't participate in note/blog validation
        if (validationType === "pages") return null;

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
          contentLength: stats.size,
        };
      } catch (error) {
        // Silently skip if metadata doesn't match the schema
        return null;
      }
    })
  );

  const validPosts = posts.filter((post): post is Post<T> => post !== null);

  // If in preview mode (and not already scanning drafts/pages), include drafts too
  if (isPreviewMode() && type !== "drafts" && type !== "pages") {
    const drafts = await getAllPosts<T>("drafts", locale, type as "blogs" | "notes");
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
 * Get a single post by slug with English fallback for non-en locales.
 * Fallback chain: content/{locale}/{type}/{slug}.mdx → content/en/{type}/{slug}.mdx
 *
 * @param slug - Post slug (without .mdx extension)
 * @param type - Content type
 * @param locale - Locale to load from (default: 'en')
 * @returns { post, isFallback } or null if not found
 */
export async function getPostBySlug<T extends BlogPostMetadata | NoteMetadata>(
  slug: string,
  type: ContentType,
  locale: string = "en",
): Promise<{ post: Post<T>; isFallback: boolean } | null> {
  interface PathEntry {
    mdxPath: string;
    resolvedLocale: string;
    actualType: ContentType;
    isFallback: boolean;
  }

  const pathsToTry: PathEntry[] = [];

  // 1. Primary: content/{locale}/{type}/{slug}.mdx
  pathsToTry.push({
    mdxPath: path.join(CONTENT_BASE, locale, type, `${slug}.mdx`),
    resolvedLocale: locale,
    actualType: type,
    isFallback: false,
  });

  // 2. English fallback (only when locale !== 'en')
  if (locale !== "en") {
    pathsToTry.push({
      mdxPath: path.join(CONTENT_BASE, "en", type, `${slug}.mdx`),
      resolvedLocale: "en",
      actualType: type,
      isFallback: true,
    });
  }

  // 3. Drafts (preview mode only)
  if (isPreviewMode() && type !== "drafts") {
    pathsToTry.push({
      mdxPath: path.join(CONTENT_BASE, locale, "drafts", `${slug}.mdx`),
      resolvedLocale: locale,
      actualType: "drafts",
      isFallback: false,
    });
    if (locale !== "en") {
      pathsToTry.push({
        mdxPath: path.join(CONTENT_BASE, "en", "drafts", `${slug}.mdx`),
        resolvedLocale: "en",
        actualType: "drafts",
        isFallback: true,
      });
    }
  }

  for (const { mdxPath, resolvedLocale, actualType, isFallback } of pathsToTry) {
    if (fs.existsSync(mdxPath)) {
      try {
        const stats = fs.statSync(mdxPath);
        const { metadata } = await import(`@/content/${resolvedLocale}/${actualType}/${slug}.mdx`);

        // Determine validation type: drafts inherit the original requested type
        const validationType = actualType === "drafts" ? (type === "drafts" ? "blogs" : type) : type;

        if (validationType === "pages") {
          // Pages: no schema validation, return raw metadata
          return {
            post: {
              slug,
              metadata: (metadata ?? {}) as T,
              type: actualType,
              contentLength: stats.size,
            },
            isFallback,
          };
        }

        const schema = validationType === "notes" ? NoteMetadataSchema : BlogPostMetadataSchema;
        const validatedMetadata = schema.parse(metadata);

        return {
          post: {
            slug,
            metadata: validatedMetadata as T,
            type: actualType,
            contentLength: stats.size,
          },
          isFallback,
        };
      } catch (error) {
        if (!isFallback && actualType !== "drafts") {
          console.error(`Error loading post ${resolvedLocale}/${actualType}/${slug}:`, error);
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
  locale: string = "en",
): Promise<{ prev: Post<T> | null; next: Post<T> | null }> {
  const posts = await getAllPosts<T>(type, locale);
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
