// SEO Configuration
// Update these values with your actual website information

export const seoConfig = {
    // Basic site information
    siteName: "NaN's Blog",
    siteUrl: "https://yourdomain.com", // Replace with your actual domain
    author: "NaN",

    // Social media handles
    twitterHandle: "@yourhandle", // Replace with your Twitter handle

    // Default meta information
    defaultTitle: "NaN",
    defaultDescription: "NaN's website - A blog about web development, programming, and technology insights",

    // Language and locale
    language: "en",
    locale: "en_US",

    // Default Open Graph image (place in /public folder)
    defaultOGImage: "/og-default.png",

    // Additional SEO settings
    robots: {
        index: true,
        follow: true,
    },

    // Google Analytics ID (optional)
    googleAnalyticsId: "", // e.g., "G-XXXXXXXXXX"

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
    googleSiteVerification,
    bingSiteVerification,
} = seoConfig; 