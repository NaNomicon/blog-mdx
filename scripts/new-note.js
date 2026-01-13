#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateNoteTemplate(metadata) {
  const tagsString = metadata.tags.length > 0 
    ? `tags: [${metadata.tags.map(t => `"${t}"`).join(", ")}],`
    : `tags: [],`;

  return `export const metadata = {
  title: "${metadata.title}",
  publishDate: "${metadata.publishDate}",
  collection: "${metadata.collection}",
  type: "${metadata.type}",
  ${metadata.book_title ? `book_title: "${metadata.book_title}",` : ""}
  ${tagsString}
  description: "${metadata.description}",
};

# ${metadata.title}

Write your note content here...
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
  console.log("📝 Note Generator\n");

  try {
    const title = await promptUser("Enter note title: ");
    if (!title) {
      console.log("❌ Title is required!");
      process.exit(1);
    }

    const collection = await promptUser("Enter collection (e.g. Show your work, Journal, Meta): ");
    if (!collection) {
      console.log("❌ Collection is required!");
      process.exit(1);
    }

    const type = (await promptUser("Enter type (thought, link, book, idea - default: thought): ")) || "thought";
    
    let book_title = "";
    if (type === "book") {
      book_title = (await promptUser("Enter book title: ")) || collection;
    }

    const description = (await promptUser("Enter brief description: ")) || "";
    const tagsInput = await promptUser("Enter tags (comma separated): ");
    const tags = tagsInput ? tagsInput.split(",").map(t => t.trim()) : [];

    const now = new Date();
    const datePrefix = formatDate(now);
    const slug = slugify(title);
    const fileName = `${datePrefix}-${slug}.mdx`;
    const filePath = path.join(process.cwd(), "content", "notes", fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`❌ File ${fileName} already exists!`);
      process.exit(1);
    }

    const metadata = {
      title,
      publishDate: formatFullDate(now),
      collection,
      type,
      book_title,
      tags,
      description,
    };

    const noteContent = generateNoteTemplate(metadata);

    // Ensure the notes directory exists
    const notesDir = path.join(process.cwd(), "content", "notes");
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(filePath, noteContent);

    console.log("\n✅ Note created successfully!");
    console.log(`📁 File: ${fileName}`);
    console.log(`📍 Path: ${filePath}`);
    console.log("\n📝 You can now edit the file and add your content!");
  } catch (error) {
    console.error("❌ Error creating note:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
