import type {Metadata, Viewport} from "next";
import {Inter} from "next/font/google";
import "./globals.css";

import { generateSEOMetadata, defaultSEOConfig } from "@/lib/seo";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { CloudflareAnalyticsScript } from "@/components/analytics/cloudflare-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { initializeTelegramErrorNotifications } from "@/lib/telegram";

const inter = Inter({ subsets: ["latin"] });

// Initialize Telegram error notifications on server startup
if (typeof window === 'undefined') {
  initializeTelegramErrorNotifications();
}

export const metadata: Metadata = {
  ...generateSEOMetadata(defaultSEOConfig),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={inter.className} suppressHydrationWarning>
      <head>
        <WebsiteStructuredData
          siteName={defaultSEOConfig.siteName!}
          description={defaultSEOConfig.description!}
          siteUrl={defaultSEOConfig.siteUrl!}
          author={defaultSEOConfig.author!}
        />
        <CloudflareAnalyticsScript token={defaultSEOConfig.cloudflareAnalyticsToken} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
