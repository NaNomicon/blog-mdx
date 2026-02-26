/**
 * refresh-posts-index.mjs
 * 
 * This script scans all MDX files in content/blogs/ and content/notes/,
 * extracts their metadata, and generates a static index at lib/data/posts-index.json.
 * 
 * Used by LinkTooltip to provide instant previews for internal links.
 */

import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIRS = [
  { path: 'content/blogs', type: 'blog', hrefPrefix: '/blog' },
  { path: 'content/notes', type: 'note', hrefPrefix: '/notes' }
];

const OUTPUT_FILE = path.join(process.cwd(), 'lib/data/posts-index.json');

function extractMetadata(content) {
  // Matches "export const metadata = { ... };"
  // We use a simplified regex to find the metadata block and then try to extract title and description
  const metadataMatch = content.match(/export const metadata = \{([\s\S]+?)\};/);
  if (!metadataMatch) return null;

  const metadataStr = metadataMatch[1];
  
  // Basic regex to extract fields from the metadata object string
  // Handles both double and single quotes
  const titleMatch = metadataStr.match(/title:\s*["'](.+?)["']/);
  const descMatch = metadataStr.match(/description:\s*["'](.+?)["']/);

  return {
    title: titleMatch ? titleMatch[1] : null,
    description: descMatch ? descMatch[1] : ''
  };
}

function deriveSlug(filename) {
  // YYMMDD-slug.mdx -> slug
  // Match prefix like 260113-
  return filename.replace(/^\d{6}-/, '').replace('.mdx', '');
}

async function main() {
  const index = {};
  let totalFiles = 0;
  let indexedFiles = 0;

  for (const config of CONTENT_DIRS) {
    const dirPath = path.join(process.cwd(), config.path);
    
    if (!fs.existsSync(dirPath)) {
      console.warn(`Warning: Directory not found: ${config.path}`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.mdx'));
    totalFiles += files.length;

    for (const filename of files) {
      const filePath = path.join(dirPath, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const metadata = extractMetadata(content);
        if (!metadata || !metadata.title) {
          console.error(`Warning: Could not parse metadata for ${filePath}`);
          continue;
        }

        const slug = deriveSlug(filename);
        const href = `${config.hrefPrefix}/${slug}`;

        index[href] = {
          title: metadata.title,
          description: metadata.description,
          href: href,
          type: config.type
        };
        indexedFiles++;
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
      }
    }
  }

  // Ensure output directory exists
  const outDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
  console.log(`Successfully generated index at ${OUTPUT_FILE}`);
  console.log(`Processed ${indexedFiles} of ${totalFiles} files.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
