# Blog MDX

A modern, fast, and SEO-optimized blog built with Next.js, MDX, and Tailwind CSS.

## Features

- 🚀 **Fast & Modern**: Built with Next.js 14 and optimized for performance
- 📝 **MDX Support**: Write blog posts in Markdown with React components
- 🎨 **Beautiful UI**: Styled with Tailwind CSS and shadcn/ui components
- 🔍 **SEO Optimized**: Comprehensive SEO meta tags and structured data
- 📊 **Analytics Ready**: Cloudflare Analytics integration for privacy-first tracking
- 🌙 **Dark Mode**: Built-in theme switching
- 📱 **Responsive**: Mobile-first design
- 🐳 **Docker Ready**: Containerized for easy deployment

## Quick Start

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd blog-mdx
   pnpm install
   ```

2. **Set up Analytics** (Optional)

   ```bash
   # Copy the example environment file
   cp .env.example .env.local

   # Edit .env.local and add your Cloudflare Analytics token
   # Replace the empty value with your actual token
   ```

3. **Run Development Server**

   ```bash
   pnpm dev
   ```

4. **Verify Setup**
   ```bash
   pnpm verify-analytics
   ```

## Analytics Setup

This blog includes privacy-first Cloudflare Analytics. See [docs/CLOUDFLARE_ANALYTICS_SETUP.md](docs/CLOUDFLARE_ANALYTICS_SETUP.md) for detailed setup instructions.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm verify-analytics` - Check analytics configuration
- `pnpm new-blog` - Create a new blog post

## Documentation

- [Cloudflare Analytics Setup](docs/CLOUDFLARE_ANALYTICS_SETUP.md)
- [SEO Configuration](docs/SEO_SETUP.md)
