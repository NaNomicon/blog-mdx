/**
 * lint-content.mjs
 *
 * Anti-AI content linter for MDX blog posts and notes.
 * Enforces rules from content/AGENTS.md "Anti-AI Writing Guidelines".
 *
 * Error-level (blocks commit):
 *   - Banned vocabulary (delve, embrace, unlock, ...)
 *   - Emdashes (—)
 *   - Structural clichés ("Moreover", "Furthermore", "In conclusion", ...)
 *   - Clichéd phrases ("a testament to", "serves as a reminder", ...)
 *
 * Warning-level (suggests review):
 *   - Extended vocabulary (leverage, utilize, streamline, ...)
 *   - Double hyphens in prose (--), excluding markdown horizontal rules (---)
 *
 * Usage: node scripts/lint-content.mjs
 * Exit code: 0 if clean, 1 if errors found
 */

import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIRS = [
  'content/en/blogs',
  'content/en/notes',
  'content/vi/blogs',
  'content/vi/notes',
];

// --- Rule definitions ---

const BANNED_WORDS = [
  'delve', 'embrace', 'unlock', 'foster', 'tapestry',
  'journey', 'heartbeat', 'seamless', 'robust', 'cutting-edge',
];

const STRUCTURAL_CLICHES = [
  /\bmoreover\b/i,
  /\bfurthermore\b/i,
  /\bin conclusion\b/i,
  /\bin today'?s fast[- ]paced world\b/i,
];

const CLICHE_PHRASES = [
  /a testament to/i,
  /serves as a reminder/i,
  /is no exception/i,
  /at the intersection of/i,
  /brings to the table/i,
];

const EXTENDED_WORDS = [
  'leverage', 'utilize', 'streamline', 'elevate', 'empower',
  'underscore', 'illuminate', 'unpack', 'resonate', 'propel',
  'navigate', 'crucial', 'pivotal', 'paramount', 'comprehensive',
  'transformative', 'multifaceted', 'myriad', 'dynamic', 'bespoke',
  'tailored', 'realm', 'paradigm', 'catalyst', 'trajectory',
  'landscape', 'intersection', 'nuances',
];

// --- Linter ---

function findMdxFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.mdx'))
    .map(f => path.join(dir, f));
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const errors = [];
  const warnings = [];

  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Track code block state (``` fences)
    if (line.match(/^\s*```/)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    // Skip lines inside code blocks
    if (inCodeBlock) continue;

    // Strip inline code segments before checking (`` `--flag` ``)
    const proseLine = line.replace(/`[^`]*`/g, '');

    // 1. Emdashes
    if (proseLine.includes('\u2014')) {
      errors.push({
        line: lineNum,
        rule: 'no-emdash',
        message: 'Emdash (—) found. Use spaced hyphens ( - ) instead.',
        context: line.trim().slice(0, 80),
      });
    }

    // 2. Banned words (hard error)
    for (const word of BANNED_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(proseLine)) {
        errors.push({
          line: lineNum,
          rule: 'banned-word',
          message: `Banned word "${word}" - AI red flag. Use a concrete alternative.`,
          context: line.trim().slice(0, 80),
        });
      }
    }

    // 3. Structural clichés (hard error)
    for (const pattern of STRUCTURAL_CLICHES) {
      if (pattern.test(proseLine)) {
        errors.push({
          line: lineNum,
          rule: 'structural-cliche',
          message: `Structural cliché matched: "${pattern.source}". Cut it.`,
          context: line.trim().slice(0, 80),
        });
      }
    }

    // 4. Clichéd phrases (hard error)
    for (const pattern of CLICHE_PHRASES) {
      if (pattern.test(proseLine)) {
        errors.push({
          line: lineNum,
          rule: 'cliche-phrase',
          message: `Clichéd phrase matched: "${pattern.source}". Rewrite.`,
          context: line.trim().slice(0, 80),
        });
      }
    }

    // 5. Extended vocabulary (soft warning)
    for (const word of EXTENDED_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(proseLine)) {
        warnings.push({
          line: lineNum,
          rule: 'extended-vocab',
          message: `Extended vocabulary "${word}" - prefer concrete alternative.`,
          context: line.trim().slice(0, 80),
        });
      }
    }

    // 6. Double hyphens in prose (warning, exclude markdown HR "---" and code blocks)
    if (!line.match(/^\s*---\s*$/)) {
      const doubleDash = proseLine.match(/(?<!-)---?(?!-)/);
      if (doubleDash && doubleDash[0] === '--') {
        warnings.push({
          line: lineNum,
          rule: 'double-hyphen',
          message: 'Double hyphen (--) in prose. Use spaced hyphens ( - ) instead.',
          context: line.trim().slice(0, 80),
        });
      }
    }
  }

  return { errors, warnings };
}

// --- Main ---

let totalErrors = 0;
let totalWarnings = 0;
let filesChecked = 0;

for (const dir of CONTENT_DIRS) {
  const files = findMdxFiles(dir);
  for (const file of files) {
    const { errors, warnings } = checkFile(file);
    filesChecked++;

    if (errors.length > 0 || warnings.length > 0) {
      const rel = path.relative(process.cwd(), file);
      console.log(`\n${rel}`);

      for (const e of errors) {
        console.log(`  \x1b[31mERROR\x1b[0m  L${e.line}  ${e.rule}: ${e.message}`);
        console.log(`         ${e.context}`);
      }
      for (const w of warnings) {
        console.log(`  \x1b[33mWARN \x1b[0m  L${w.line}  ${w.rule}: ${w.message}`);
        console.log(`         ${w.context}`);
      }
    }

    totalErrors += errors.length;
    totalWarnings += warnings.length;
  }
}

console.log(`\n${filesChecked} files checked. ${totalErrors} errors, ${totalWarnings} warnings.`);

if (totalErrors > 0) {
  console.log('\x1b[31mContent lint failed.\x1b[0m Fix errors above.');
  process.exit(1);
} else if (totalWarnings > 0) {
  console.log('\x1b[33mContent lint passed with warnings.\x1b[0m Review recommended.');
  process.exit(0);
} else {
  console.log('\x1b[32mContent lint clean.\x1b[0m');
  process.exit(0);
}