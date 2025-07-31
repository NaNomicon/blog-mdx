import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import SiteHeader from "@/components/nav/site-header";
import Footer from "@/components/nav/footer";
import { ErrorBoundary } from "@/components/error-boundary";
import { TelegramClientInit } from "@/components/telegram-client-init";

import { ThemeProvider } from "@/components/theme-provider";
import { generateSEOMetadata, defaultSEOConfig } from "@/lib/seo";
import { WebsiteStructuredData } from "@/components/seo/structured-data";
import { CloudflareAnalyticsScript } from "@/components/analytics/cloudflare-analytics";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { initializeTelegramErrorNotifications } from "@/lib/telegram";
import Script from "next/script";

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
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo.png", sizes: "400x400", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/logo.png",
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
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
        <WebsiteStructuredData
          siteName={defaultSEOConfig.siteName!}
          description={defaultSEOConfig.description!}
          siteUrl={defaultSEOConfig.siteUrl!}
          author={defaultSEOConfig.author!}
        />
        <CloudflareAnalyticsScript
          token={defaultSEOConfig.cloudflareAnalyticsToken}
        />
        <Script
          defer
          src="https://umami.nanomicon.com/script.js"
          data-website-id="a7d10e27-6883-4bd4-8f16-ba202d552abd"
          data-domains="nanomicon.com,nandev.dev"
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
          <ErrorBoundary>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ErrorBoundary>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          id="umami-outbound-links"
          src="/scripts/umami-outbound.js"
          strategy="afterInteractive"
        />
        <Script
          id="umami-default-opt-out"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              localStorage.setItem("umami.disabled", "1");
            `,
          }}
        />
      </body>
    </html>
  );
}
