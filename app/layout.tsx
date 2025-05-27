import type {Metadata, Viewport} from "next";
import {Inter} from "next/font/google";
import "./globals.css";

import SiteHeader from "@/components/nav/site-header";
import Footer from "@/components/nav/footer";

import {ThemeProvider} from "@/components/theme-provider";
import { generateSEOMetadata, defaultSEOConfig } from "@/lib/seo";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { CloudflareAnalyticsScript } from "@/components/analytics/cloudflare-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <head>
        <WebsiteStructuredData
          siteName={defaultSEOConfig.siteName!}
          description={defaultSEOConfig.description!}
          siteUrl={defaultSEOConfig.siteUrl!}
          author={defaultSEOConfig.author!}
        />
        <CloudflareAnalyticsScript token={defaultSEOConfig.cloudflareAnalyticsToken} />
      </head>
    <body className={`${inter.className} h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SiteHeader />
          <main className="flex flex-col items-center justify-between px-6 py-12   sm:px-10 sm:py-24 min-h-[calc(100vh-12rem)]">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
