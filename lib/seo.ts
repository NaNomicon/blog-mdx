import type { Metadata } from "next";
import { seoConfig } from "@/config/seo.config";

export interface SEOConfig {
    title?: string;
    description?: string;
    author?: string;
    publishDate?: string;
    category?: string;
    coverImage?: string;
    slug?: string;
    language?: string;
    siteName?: string;
    siteUrl?: string;
    twitterHandle?: string;
}

export function generateSEOMetadata(config: SEOConfig): Metadata {
    const {
        title = seoConfig.defaultTitle,
        description = seoConfig.defaultDescription,
        author = seoConfig.author,
        publishDate,
        category,
        coverImage,
        slug,
        language = seoConfig.language,
        siteName = seoConfig.siteName,
        siteUrl = seoConfig.siteUrl,
        twitterHandle = seoConfig.twitterHandle,
    } = config;

    const fullTitle = title === "NaN" ? title : `${title} | ${siteName}`;
    const canonicalUrl = slug ? `${siteUrl}/blog/${slug}` : siteUrl;
    const imageUrl = coverImage ? `${siteUrl}${coverImage}` : `${siteUrl}${seoConfig.defaultOGImage}`;

    const metadata: Metadata = {
        // Basic meta tags
        title: fullTitle,
        description,
        authors: [{ name: author }],

        // Language and charset (handled by Next.js automatically)

        // Open Graph meta tags for social sharing
        openGraph: {
            title: fullTitle,
            description,
            url: canonicalUrl,
            siteName,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: language,
            type: slug ? "article" : "website",
            ...(publishDate && {
                publishedTime: publishDate,
            }),
            ...(category && {
                section: category,
            }),
        },

        // Twitter Card meta tags
        twitter: {
            card: "summary_large_image",
            title: fullTitle,
            description,
            images: [imageUrl],
            creator: twitterHandle,
            site: twitterHandle,
        },

        // Additional SEO meta tags
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },

        // Canonical URL
        alternates: {
            canonical: canonicalUrl,
        },

        // Additional meta tags for better SEO
        other: {
            // Language specification
            "language": language,

            // Content rating
            "rating": "general",

            // Copyright
            "copyright": `Copyright ${new Date().getFullYear()} ${author}`,

            // Revised date for blog posts
            ...(publishDate && {
                "revised": new Date(publishDate).toISOString(),
            }),

            // Category for blog posts
            ...(category && {
                "article:section": category,
            }),

            // Disable automatic translation
            "google": "notranslate",

            // Mobile optimization
            "format-detection": "telephone=no",
            "HandheldFriendly": "true",
        },
    };

    // Add structured data for blog posts
    if (slug && publishDate) {
        const additionalMeta: Record<string, string> = {
            "article:published_time": publishDate,
            "article:author": author,
        };

        if (category) {
            additionalMeta["article:section"] = category;
        }

        metadata.other = {
            ...metadata.other,
            ...additionalMeta,
        };
    }

    return metadata;
}

// Default SEO configuration for the site
export const defaultSEOConfig: SEOConfig = {
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    author: seoConfig.author,
    language: seoConfig.language,
    siteName: seoConfig.siteName,
    siteUrl: seoConfig.siteUrl,
    twitterHandle: seoConfig.twitterHandle,
};

// Utility function to extract SEO data from blog post metadata
export function extractSEOFromBlogMetadata(metadata: any, slug: string): SEOConfig {
    return {
        ...defaultSEOConfig,
        title: metadata.title,
        description: metadata.description,
        publishDate: metadata.publishDate,
        category: metadata.category,
        coverImage: metadata.cover_image,
        slug,
    };
} 