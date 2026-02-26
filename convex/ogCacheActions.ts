import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Decode common HTML entities in a string.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}

/**
 * Extract OG title from HTML. Handles both attribute orderings:
 *   <meta property="og:title" content="...">
 *   <meta content="..." property="og:title">
 * Falls back to <title> then hostname.
 */
function extractTitle(html: string, url: string): string {
  // Try og:title — property before content
  const ogTitlePropFirst =
    /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["']/i.exec(
      html
    );
  if (ogTitlePropFirst) return decodeHtmlEntities(ogTitlePropFirst[1]);

  // Try og:title — content before property
  const ogTitleContentFirst =
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:title["']/i.exec(
      html
    );
  if (ogTitleContentFirst) return decodeHtmlEntities(ogTitleContentFirst[1]);

  // Fallback: <title> tag
  const titleTag = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  if (titleTag) return decodeHtmlEntities(titleTag[1].trim());

  // Last resort: hostname
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * Extract OG description from HTML. Handles both attribute orderings.
 * Falls back to meta name="description" then empty string.
 */
function extractDescription(html: string): string {
  // Try og:description — property before content
  const ogDescPropFirst =
    /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(
      html
    );
  if (ogDescPropFirst) return decodeHtmlEntities(ogDescPropFirst[1]);

  // Try og:description — content before property
  const ogDescContentFirst =
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:description["']/i.exec(
      html
    );
  if (ogDescContentFirst) return decodeHtmlEntities(ogDescContentFirst[1]);

  // Fallback: meta name="description" — name before content
  const metaDescNameFirst =
    /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i.exec(
      html
    );
  if (metaDescNameFirst) return decodeHtmlEntities(metaDescNameFirst[1]);

  // Fallback: meta name="description" — content before name
  const metaDescContentFirst =
    /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']description["']/i.exec(
      html
    );
  if (metaDescContentFirst) return decodeHtmlEntities(metaDescContentFirst[1]);

  return "";
}

/**
 * Fetches an external URL, parses OG metadata from the HTML, and caches
 * the result in the `og_cache` table.
 *
 * - Never throws; any failure falls back to hostname / empty description.
 * - 5-second network timeout via AbortSignal.timeout().
 */
export const fetchAndCacheOG = action({
  args: { url: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      const response = await fetch(args.url, {
        signal: AbortSignal.timeout(5000),
      });

      const html = await response.text();
      const title = extractTitle(html, args.url);
      const description = extractDescription(html);

      await ctx.runMutation(api.ogCache.upsert, {
        url: args.url,
        title,
        description,
      });
    } catch (err) {
      console.warn("fetchAndCacheOG failed for", args.url, err);
      // Graceful degradation: store hostname as title so link tooltip still works
      try {
        await ctx.runMutation(api.ogCache.upsert, {
          url: args.url,
          title: new URL(args.url).hostname,
          description: "",
        });
      } catch {
        // If even the fallback upsert fails, swallow silently
      }
    }
    return null;
  },
});
