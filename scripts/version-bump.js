#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * This script helps bump the version number in package.json
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getPackageInfo() {
  const packagePath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packagePath)) {
    console.error("❌ package.json not found");
    process.exit(1);
  }

  const packageContent = fs.readFileSync(packagePath, "utf8");
  return JSON.parse(packageContent);
}

function updatePackageVersion(newVersion) {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageInfo = getPackageInfo();

  packageInfo.version = newVersion;

  fs.writeFileSync(packagePath, JSON.stringify(packageInfo, null, 2) + "\n");
}

function bumpVersion(type = "patch") {
  const packageInfo = getPackageInfo();
  const currentVersion = packageInfo.version;

  console.log(`📦 Current version: v${currentVersion}`);

  try {
    // Use npm version to bump the version
    const newVersion = execSync(`npm version ${type} --no-git-tag-version`, {
      encoding: "utf8",
    }).trim();

    console.log(`🚀 New version: ${newVersion}`);
    console.log(`✅ Version bumped successfully!`);

    // Show startup info with new version
    console.log("\n📋 Updated startup info:");
    require("./startup-info.js").logStartupInfo();
  } catch (error) {
    console.error("❌ Error bumping version:", error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const versionType = args[0] || "patch";

if (!["major", "minor", "patch"].includes(versionType)) {
  console.error("❌ Invalid version type. Use: major, minor, or patch");
  process.exit(1);
}

// Run if called directly
if (require.main === module) {
  console.log("🔧 Version Bump Tool\n");
  bumpVersion(versionType);
}

module.exports = { bumpVersion, getPackageInfo, updatePackageVersion };
