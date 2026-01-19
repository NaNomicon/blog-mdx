#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { AutoComplete, Input, Toggle } = require("enquirer");

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
  ${metadata.spoiler ? `spoiler: true,` : ""}
};
`;
}

function getExistingMetadata() {
  const notesDir = path.join(process.cwd(), "content", "notes");
  if (!fs.existsSync(notesDir)) return { collections: [], types: [], tags: [] };

  const files = fs.readdirSync(notesDir).filter(f => f.endsWith(".mdx"));
  const collections = new Set();
  const types = new Set(["thought", "link", "book", "idea"]); // Default types
  const allTags = new Set();

  files.forEach(file => {
    const content = fs.readFileSync(path.join(notesDir, file), "utf8");
    
    const collectionMatch = content.match(/collection:\s*"([^"]+)"/);
    if (collectionMatch) collections.add(collectionMatch[1]);

    const typeMatch = content.match(/type:\s*"([^"]+)"/);
    if (typeMatch) types.add(typeMatch[1]);

    // Better tag extraction to handle multi-line and different quotes
    const tagsMatch = content.match(/tags:\s*\[([\s\S]*?)\]/);
    if (tagsMatch) {
      const tagsStr = tagsMatch[1];
      const tags = tagsStr
        .split(",")
        .map(t => t.trim().replace(/['"]/g, ""))
        .filter(Boolean);
      tags.forEach(t => allTags.add(t));
    }
  });

  return {
    collections: Array.from(collections).sort(),
    types: Array.from(types).sort(),
    tags: Array.from(allTags).sort()
  };
}

async function main() {
  console.log("📝 Note Generator\n");

  try {
    const { collections, types, tags: existingTags } = getExistingMetadata();

    const titlePrompt = new Input({
      message: "Enter note title:",
      validate: (value) => (value ? true : "Title is required!"),
    });
    const title = await titlePrompt.run();

    const collectionPrompt = new AutoComplete({
      name: "collection",
      message: "Select or type collection:",
      choices: collections,
      limit: 10,
      suggest(input, choices) {
        const filtered = choices.filter(choice => 
          choice.message.toLowerCase().includes(input.toLowerCase())
        );
        if (input && !filtered.find(c => c.message.toLowerCase() === input.toLowerCase())) {
          filtered.unshift({ name: input, message: `[New] ${input}` });
        }
        return filtered;
      },
      result(value) {
        return this.input || value;
      }
    });
    const collection = await collectionPrompt.run();

    const typePrompt = new AutoComplete({
      name: "type",
      message: "Select or type type (thought, link, book, idea):",
      choices: types,
      suggest(input, choices) {
        const filtered = choices.filter(choice => 
          choice.message.toLowerCase().includes(input.toLowerCase())
        );
        if (input && !filtered.find(c => c.message.toLowerCase() === input.toLowerCase())) {
          filtered.unshift({ name: input, message: `[New] ${input}` });
        }
        return filtered;
      },
      result(value) {
        return this.input || value;
      }
    });
    const type = (await typePrompt.run()) || "thought";

    let book_title = "";
    if (type === "book") {
      const bookTitlePrompt = new Input({
        message: "Enter book title (defaults to collection):",
        initial: collection
      });
      book_title = await bookTitlePrompt.run();
    }

    const descriptionPrompt = new Input({
      message: "Enter brief description:",
    });
    const description = await descriptionPrompt.run();

    const spoilerPrompt = new Toggle({
      message: "Is this a spoiler?",
      enabled: "Yes",
      disabled: "No",
      initial: type === "book" // Default to spoiler if it's a book summary
    });
    const spoiler = await spoilerPrompt.run();

    const tagsPrompt = new AutoComplete({
      name: "tags",
      message: "Select tags (Space to toggle, start typing to filter/add):",
      choices: existingTags,
      multiple: true,
      limit: 10,
      suggest(input, choices) {
        const filtered = choices.filter(choice => 
          choice.message.toLowerCase().includes(input.toLowerCase())
        );
        if (input && !filtered.find(c => c.message.toLowerCase() === input.toLowerCase())) {
          filtered.unshift({ name: input, message: `[New Tag] ${input}` });
        }
        return filtered;
      }
    });
    const tags = await tagsPrompt.run();

    const now = new Date();
    const datePrefix = formatDate(now);
    const slug = slugify(title);
    const fileName = `${datePrefix}-${slug}.mdx`;
    const filePath = path.join(process.cwd(), "content", "notes", fileName);

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
      spoiler,
    };

    const noteContent = generateNoteTemplate(metadata);

    const notesDir = path.join(process.cwd(), "content", "notes");
    if (!fs.existsSync(notesDir)) {
      fs.mkdirSync(notesDir, { recursive: true });
    }

    fs.writeFileSync(filePath, noteContent);

    console.log("\n✅ Note created successfully!");
    console.log(`📁 File: ${fileName}`);
    console.log(`📍 Path: ${filePath}`);
    console.log("\n📝 You can now edit the file and add your content!");
  } catch (error) {
    if (error === "") {
      console.log("\n👋 Cancelled.");
    } else {
      console.error("\n❌ Error creating note:", error.message || error);
    }
    process.exit(1);
  }
}

main();
