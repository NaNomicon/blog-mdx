/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Enable standalone output for minimal Docker images
  output: "standalone",

  // Build optimizations for speed
  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@radix-ui/react-icons",
    ],
    // Enable SWC minification for faster builds
    swcMinify: true,
    // Faster builds with reduced type checking
    typedRoutes: false,
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Image optimization
  images: {
    // Optimize image loading
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    // Allow external image domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },

  // Simplified webpack optimizations for faster builds
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev) {
      // Enable persistent caching with simpler config
      config.cache = {
        type: "filesystem",
      };

      // Simplified optimization for faster builds
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
          },
        },
      };
    }

    // Optimize module resolution
    config.resolve.symlinks = false;

    return config;
  },

  // Enable static optimization
  trailingSlash: false,

  // Optimize fonts
  optimizeFonts: true,
};

// Bundle analyzer setup - proper ES module handling
async function createNextConfig() {
  let withBundleAnalyzer = (config) => config;

  if (process.env.ANALYZE === "true") {
    const { default: bundleAnalyzer } = await import("@next/bundle-analyzer");
    withBundleAnalyzer = bundleAnalyzer({ enabled: true });
  }

  return withBundleAnalyzer(nextConfig);
}

// Export the config
export default createNextConfig();
