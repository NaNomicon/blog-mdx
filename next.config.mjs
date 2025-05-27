import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import rehypeHighlight from "rehype-highlight";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Enable standalone output for minimal Docker images
  output: "standalone",

  // Build optimizations
  experimental: {
    // Optimize package imports for better tree shaking
    optimizePackageImports: [
      "lucide-react",
      "react-icons",
      "@radix-ui/react-icons",
    ],
  },

  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Optimize for production builds
    if (!dev) {
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

    return config;
  },

  // Optionally, add any other Next.js config below
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm, remarkFrontmatter],
    rehypePlugins: [rehypeHighlight],
    format: "mdx",
  },
});

// Bundle analyzer setup - proper ES module handling
async function createNextConfig() {
  let withBundleAnalyzer = (config) => config;

  if (process.env.ANALYZE === "true") {
    const { default: bundleAnalyzer } = await import("@next/bundle-analyzer");
    withBundleAnalyzer = bundleAnalyzer({ enabled: true });
  }

  return withBundleAnalyzer(withMDX(nextConfig));
}

// Export the config
export default createNextConfig();
