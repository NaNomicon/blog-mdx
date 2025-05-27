#!/usr/bin/env node

/**
 * Startup Information Script
 *
 * This script displays version and startup information when the application starts.
 */

const fs = require("fs");
const path = require("path");

function getPackageInfo() {
  const packagePath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packagePath)) {
    console.error("❌ package.json not found");
    return null;
  }

  const packageContent = fs.readFileSync(packagePath, "utf8");
  return JSON.parse(packageContent);
}

function logStartupInfo() {
  const packageInfo = getPackageInfo();

  if (!packageInfo) {
    return;
  }

  const { name, version } = packageInfo;
  const timestamp = new Date().toISOString();

  console.log("\n" + "=".repeat(60));
  console.log(`🚀 ${name} v${version}`);
  console.log(`📅 Started at: ${timestamp}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📦 Node.js: ${process.version}`);
  console.log("=".repeat(60) + "\n");
}

// Run if called directly
if (require.main === module) {
  logStartupInfo();
}

module.exports = { logStartupInfo, getPackageInfo };
