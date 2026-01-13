// SEO Configuration
// Update these values with your actual website information

import { env } from "@/lib/env";

export const seoConfig = {
    // Basic site information
    siteName: "NaN's Blog",
    siteUrl: "https://nanomicon.com", // Replace with your actual domain
    author: "NaNomicon",

    // Social media handles
    twitterHandle: "@NaNomicon_", // Updated with your Twitter handle
    dailyDevProfile: "https://app.daily.dev/nanomicon", // Added daily.dev profile
    blueskyProfile: "https://bsky.app/profile/nanomicon.bsky.social", // Added Bluesky profile

    // Default meta information
    defaultTitle: "NaN",
    defaultDescription: "NaN's website - A blog about web development, programming, and technology insights",

    // Language and locale
    language: "en",
    locale: "en_US",

    // Default Open Graph image (place in /public folder)
    defaultOGImage: "/logo.png",

    // Logo for branding
    logo: "/logo.png",

    // Additional SEO settings
    robots: {
        index: true,
        follow: true,
    },

    // Google Analytics ID (optional)
    googleAnalyticsId: "", // e.g., "G-XXXXXXXXXX"

    // Cloudflare Analytics token (optional)
    cloudflareAnalyticsToken: env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN || "", // e.g., "your-token-here"

    // Google Search Console verification (optional)
    googleSiteVerification: "", // e.g., "your-verification-code"

    // Bing Webmaster Tools verification (optional)
    bingSiteVerification: "", // e.g., "your-verification-code"
};

// Export individual values for easy access
export const {
    siteName,
    siteUrl,
    author,
    twitterHandle,
    dailyDevProfile,
    blueskyProfile,
    defaultTitle,
    defaultDescription,
    language,
    locale,
    defaultOGImage,
    robots,
    googleAnalyticsId,
    cloudflareAnalyticsToken,
    googleSiteVerification,
    bingSiteVerification,
} = seoConfig; 