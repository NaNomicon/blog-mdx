import { MetadataRoute } from "next";
import { getAllPosts, type BlogPostMetadata, type NoteMetadata } from "@/lib/content";
import { seoConfig } from "@/config/seo.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.siteUrl.endsWith("/")
    ? seoConfig.siteUrl.slice(0, -1)
    : seoConfig.siteUrl;

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
  }));

  // 2. Blog Posts
  const blogs = await getAllPosts<BlogPostMetadata>("blogs");
  const blogRoutes = blogs.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.metadata.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // 3. Notes
  const notes = await getAllPosts<NoteMetadata>("notes");
  const noteRoutes = notes.map((note) => ({
    url: `${baseUrl}/notes/${note.slug}`,
    lastModified: new Date(note.metadata.publishDate),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 4. Note Collections
  const collections = Array.from(new Set(notes.map((n) => n.metadata.collection)));
  const collectionRoutes = collections.map((collection) => ({
    url: `${baseUrl}/notes/collection/${collection}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...noteRoutes, ...collectionRoutes];
}
