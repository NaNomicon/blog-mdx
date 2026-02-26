import { MetadataRoute } from "next";
import { getAllPosts, type BlogPostMetadata, type NoteMetadata } from "@/lib/content";
import { seoConfig } from "@/config/seo.config";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.siteUrl.endsWith("/")
    ? seoConfig.siteUrl.slice(0, -1)
    : seoConfig.siteUrl;

  function getAlternates(path: string) {
    const enUrl = `${baseUrl}${path}`;
    const viUrl = `${baseUrl}/vi${path}`;
    return {
      languages: {
        'en': enUrl,
        'vi': viUrl,
        'x-default': enUrl,
      },
    };
  }

  // 1. Static Routes
  const staticRoutes = [
    "",
    "/about",
    "/blog",
    "/notes",
    "/privacy-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
    alternates: getAlternates(route),
  }));

  // 2. Blog Posts
  const blogs = await getAllPosts<BlogPostMetadata>("blogs");
  const blogRoutes = blogs.map((post) => {
    const path = `/blog/${post.slug}`;
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(post.metadata.publishDate),
      changeFrequency: "monthly" as const,
      priority: 0.7,
      alternates: getAlternates(path),
    };
  });

  // 3. Notes
  const notes = await getAllPosts<NoteMetadata>("notes");
  const noteRoutes = notes.map((note) => {
    const path = `/notes/${note.slug}`;
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(note.metadata.publishDate),
      changeFrequency: "weekly" as const,
      priority: 0.6,
      alternates: getAlternates(path),
    };
  });

  // 4. Note Collections
  const collections = Array.from(new Set(notes.map((n) => n.metadata.collection)));
  const collectionRoutes = collections.map((collection) => {
    const path = `/notes/collection/${collection}`;
    return {
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.5,
      alternates: getAlternates(path),
    };
  });

  return [...staticRoutes, ...blogRoutes, ...noteRoutes, ...collectionRoutes];
}
