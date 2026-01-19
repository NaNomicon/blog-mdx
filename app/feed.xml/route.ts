import { getAllPosts, type BlogPostMetadata } from "@/lib/content";
import { seoConfig } from "@/config/seo.config";

export async function GET() {
  const baseUrl = seoConfig.siteUrl.endsWith("/")
    ? seoConfig.siteUrl.slice(0, -1)
    : seoConfig.siteUrl;

  const blogs = await getAllPosts<BlogPostMetadata>("blogs", false);

  const itemsXml = blogs
    .map((post) => {
      const url = `${baseUrl}/blog/${post.slug}`;
      return `
    <item>
      <title><![CDATA[${post.metadata.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.metadata.publishDate).toUTCString()}</pubDate>
      <description><![CDATA[${post.metadata.description}]]></description>
      <category><![CDATA[${post.metadata.category}]]></category>
    </item>`;
    })
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${seoConfig.siteName}</title>
    <link>${baseUrl}</link>
    <description>${seoConfig.defaultDescription}</description>
    <language>${seoConfig.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
