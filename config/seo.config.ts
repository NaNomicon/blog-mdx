// SEO Configuration
// Update these values with your actual website information

export const seoConfig = {
    // Basic site information
    siteName: "NaN's Blog",
    siteUrl: "https://nandev.net", // Replace with your actual domain
    author: "NaNomicon",

    // Social media handles
    twitterHandle: "", // Replace with your Twitter handle

    // Default meta information
    defaultTitle: "NaN",
    defaultDescription: "NaN's website - A blog about web development, programming, and technology insights",

    // Language and locale
    language: "en",
    locale: "en_US",

    // Default Open Graph image (place in /public folder)
    defaultOGImage: "/250527-the-hidden-buttons-that-must-never-die/cover.png",

    // Additional SEO settings
    robots: {
        index: true,
        follow: true,
    },

    // Google Analytics ID (optional)
    googleAnalyticsId: "", // e.g., "G-XXXXXXXXXX"

    // Cloudflare Analytics token (optional)
    cloudflareAnalyticsToken: process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN || "", // e.g., "your-token-here"

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