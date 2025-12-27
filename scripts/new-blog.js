#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const yaml = require("js-yaml");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function formatDate(date) {
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatFullDate(date) {
  return date.toISOString().split("T")[0];
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateBlogTemplate(metadata) {
  const frontmatter = yaml.dump(metadata);
  return `---
${frontmatter}---

## Introduction

Write your introduction here.

## Main Content

### Section 1

Add your main content here.
`;
}

async function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("🚀 Blog Post Generator (TinaCMS Compatible)\n");

  try {
    const title = await promptUser("Enter blog title: ");
    if (!title) {
      console.log("❌ Title is required!");
      process.exit(1);
    }

    const description =
      (await promptUser("Enter blog description: ")) || "A new blog post";
    const category =
      (await promptUser("Enter category (default: General): ")) || "General";
    const coverImage =
      (await promptUser("Enter cover image path (optional): ")) || "";

    const now = new Date();
    const datePrefix = formatDate(now);
    const slug = slugify(title);
    const fileName = `${datePrefix}-${slug}.mdx`;
    const filePath = path.join(process.cwd(), "content", "posts", fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} already exists!`);
      process.exit(1);
    }

    const metadata = {
      title,
      publishDate: formatFullDate(now),
      description,
      category,
      cover_image: coverImage,
      tags: [],
    };

    const blogContent = generateBlogTemplate(metadata);

    // Ensure the directory exists
    const postsDir = path.join(process.cwd(), "content", "posts");
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, blogContent);

    console.log("\n✅ Blog post created successfully!");
    console.log(`📁 File: ${fileName}`);
    console.log(`📍 Path: ${filePath}`);
    console.log("\n📝 You can now edit the file or use the TinaCMS admin!");
  } catch (error) {
    console.error("❌ Error creating blog post:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
