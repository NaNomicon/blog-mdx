#!/usr/bin/env node

/**
 * Cloudflare Analytics Verification Script
 *
 * This script helps verify that Cloudflare Analytics is properly configured
 * in your Next.js application.
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Cloudflare Analytics Configuration Checker\n");

// Check if .env.local exists and has the token
function checkEnvironmentFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found");
    console.log("   Create it with: cp .env.example .env.local");
    console.log(
      "   Then edit .env.local and add your actual Cloudflare Analytics token\n"
    );
    return false;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const hasToken =
    envContent.includes("NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=") &&
    !envContent.includes("NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=\n") &&
    !envContent.includes(
      "NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_token_here"
    );

  if (hasToken) {
    console.log("✅ Environment file configured with token");
  } else {
    console.log("❌ Token not found in .env.local");
    console.log(
      "   Add: NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN=your_actual_token"
    );
  }

  return hasToken;
}

// Check if analytics component exists
function checkAnalyticsComponent() {
  const componentPath = path.join(
    process.cwd(),
    "components/analytics/cloudflare-analytics.tsx"
  );

  if (fs.existsSync(componentPath)) {
    console.log("✅ Cloudflare Analytics component found");
    return true;
  } else {
    console.log("❌ Analytics component missing");
    return false;
  }
}

// Check if layout includes analytics
function checkLayoutIntegration() {
  const layoutPath = path.join(process.cwd(), "app/layout.tsx");

  if (!fs.existsSync(layoutPath)) {
    console.log("❌ Layout file not found");
    return false;
  }

  const layoutContent = fs.readFileSync(layoutPath, "utf8");
  const hasImport = layoutContent.includes("CloudflareAnalyticsScript");
  const hasComponent = layoutContent.includes("<CloudflareAnalyticsScript");

  if (hasImport && hasComponent) {
    console.log("✅ Analytics integrated in layout");
    return true;
  } else {
    console.log("❌ Analytics not properly integrated in layout");
    if (!hasImport) console.log("   Missing import statement");
    if (!hasComponent) console.log("   Missing component usage");
    return false;
  }
}

// Check SEO config
function checkSEOConfig() {
  const configPath = path.join(process.cwd(), "config/seo.config.ts");

  if (!fs.existsSync(configPath)) {
    console.log("❌ SEO config file not found");
    return false;
  }

  const configContent = fs.readFileSync(configPath, "utf8");
  const hasToken = configContent.includes("cloudflareAnalyticsToken");

  if (hasToken) {
    console.log("✅ SEO config includes Cloudflare Analytics token");
    return true;
  } else {
    console.log("❌ SEO config missing Cloudflare Analytics configuration");
    return false;
  }
}

// Main verification
function main() {
  const checks = [
    checkEnvironmentFile,
    checkAnalyticsComponent,
    checkLayoutIntegration,
    checkSEOConfig,
  ];

  const results = checks.map((check) => check());
  const allPassed = results.every((result) => result);

  console.log("\n" + "=".repeat(50));

  if (allPassed) {
    console.log("🎉 All checks passed! Cloudflare Analytics is ready.");
    console.log("\nNext steps:");
    console.log("1. Build your app: pnpm build");
    console.log("2. Start your app: pnpm start");
    console.log("3. Visit your site and check browser console");
    console.log('4. Look for "Cloudflare Analytics loaded successfully"');
  } else {
    console.log("❌ Some checks failed. Please fix the issues above.");
    console.log(
      "\nRefer to docs/CLOUDFLARE_ANALYTICS_SETUP.md for detailed instructions."
    );
  }

  console.log("\n📊 View analytics at: https://dash.cloudflare.com");
}

main();
