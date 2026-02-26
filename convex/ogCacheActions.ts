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
  const ogTitlePropFirstDouble =
    /<meta[^>]+property=["']og:title["'][^>]*content="([^"]+)"/i.exec(html);
  if (ogTitlePropFirstDouble) return decodeHtmlEntities(ogTitlePropFirstDouble[1]);

  const ogTitlePropFirstSingle =
    /<meta[^>]+property=["']og:title["'][^>]*content='([^']+)'/i.exec(html);
  if (ogTitlePropFirstSingle) return decodeHtmlEntities(ogTitlePropFirstSingle[1]);

  // Try og:title — content before property
  const ogTitleContentFirstDouble =
    /<meta[^>]+content="([^"]+)"[^>]*property=["']og:title["']/i.exec(html);
  if (ogTitleContentFirstDouble)
    return decodeHtmlEntities(ogTitleContentFirstDouble[1]);

  const ogTitleContentFirstSingle =
    /<meta[^>]+content='([^']+)'[^>]*property=["']og:title["']/i.exec(html);
  if (ogTitleContentFirstSingle)
    return decodeHtmlEntities(ogTitleContentFirstSingle[1]);
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
  const clean = (s: string) => s.replace(/^\s*:\s*/, "").trim();

  // Try og:description — property before content
  const ogDescPropFirstDouble =
    /<meta[^>]+property=["']og:description["'][^>]*content="([^"]+)"/i.exec(html);
  if (ogDescPropFirstDouble) return clean(decodeHtmlEntities(ogDescPropFirstDouble[1]));

  const ogDescPropFirstSingle =
    /<meta[^>]+property=["']og:description["'][^>]*content='([^']+)'/i.exec(html);
  if (ogDescPropFirstSingle) return clean(decodeHtmlEntities(ogDescPropFirstSingle[1]));

  // Try og:description — content before property
  const ogDescContentFirstDouble =
    /<meta[^>]+content="([^"]+)"[^>]*property=["']og:description["']/i.exec(html);
  if (ogDescContentFirstDouble)
    return clean(decodeHtmlEntities(ogDescContentFirstDouble[1]));

  const ogDescContentFirstSingle =
    /<meta[^>]+content='([^']+)'[^>]*property=["']og:description["']/i.exec(html);
  if (ogDescContentFirstSingle)
    return clean(decodeHtmlEntities(ogDescContentFirstSingle[1]));

  // Fallback: meta name="description" — name before content
  const metaDescNameFirstDouble =
    /<meta[^>]+name=["']description["'][^>]*content="([^"]+)"/i.exec(html);
  if (metaDescNameFirstDouble)
    return clean(decodeHtmlEntities(metaDescNameFirstDouble[1]));

  const metaDescNameFirstSingle =
    /<meta[^>]+name=["']description["'][^>]*content='([^']+)'/i.exec(html);
  if (metaDescNameFirstSingle)
    return clean(decodeHtmlEntities(metaDescNameFirstSingle[1]));

  // Fallback: meta name="description" — content before name
  const metaDescContentFirstDouble =
    /<meta[^>]+content="([^"]+)"[^>]*name=["']description["']/i.exec(html);
  if (metaDescContentFirstDouble)
    return clean(decodeHtmlEntities(metaDescContentFirstDouble[1]));

  const metaDescContentFirstSingle =
    /<meta[^>]+content='([^']+)'[^>]*name=["']description["']/i.exec(html);
  if (metaDescContentFirstSingle)
    return clean(decodeHtmlEntities(metaDescContentFirstSingle[1]));
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
