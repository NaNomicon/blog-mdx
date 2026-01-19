import { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo.config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = seoConfig.siteUrl.endsWith("/")
    ? seoConfig.siteUrl.slice(0, -1)
    : seoConfig.siteUrl;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/static/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
