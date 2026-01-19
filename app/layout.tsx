import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SiteHeader from "@/components/nav/site-header";
import Footer from "@/components/nav/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { TelegramClientInit } from "@/components/telegram-client-init";

import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { generateSEOMetadata, defaultSEOConfig } from "@/lib/seo";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { initializeTelegramErrorNotifications } from "@/lib/telegram";
import Script from "next/script";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

// Initialize Telegram error notifications on server startup
if (typeof window === "undefined") {
  initializeTelegramErrorNotifications();
}

export const metadata: Metadata = {
  ...generateSEOMetadata(defaultSEOConfig),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "400x400", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/favicon.ico", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/favicon.ico",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon.ico"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon.ico"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <WebsiteStructuredData
          siteName={defaultSEOConfig.siteName!}
          description={defaultSEOConfig.description!}
          siteUrl={defaultSEOConfig.siteUrl!}
          author={defaultSEOConfig.author!}
        />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`RSS Feed for ${defaultSEOConfig.siteName}`}
          href="/feed.xml"
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-background font-sans antialiased`}
      >
        <TelegramClientInit />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <TooltipProvider>
              <ErrorBoundary>
                <div className="relative flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </ErrorBoundary>
            </TooltipProvider>
            <Toaster />
          </ConvexClientProvider>
        </ThemeProvider>
        {/* Analytics components */}
        <Analytics />
        <SpeedInsights />
        <Script
          defer
          src="https://umami.nanomicon.com/script.js"
          data-website-id="a7d10e27-6883-4bd4-8f16-ba202d552abd"
          data-before-send="umamiBeforeSendHandler"
        />
        <Script
          id="umami-outbound-links"
          src="/scripts/umami-outbound.js"
          strategy="afterInteractive"
        />
        <Script
          id="umami-before-send-handler"
          dangerouslySetInnerHTML={{
            __html: `
              function umamiBeforeSendHandler(type, payload) {
                if (!location.search.includes("ref")) return payload;
                payload.ref = location.search.split("ref=")[1];
                
                return payload;
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
