import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate a URL-friendly slug from text
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    // Remove emojis and other unicode symbols (comprehensive ranges)
    .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]/gu, '')
    // Remove other special characters but keep alphanumeric, spaces, and hyphens
    .replace(/[^\w\s-]/g, '')
    // Replace multiple whitespace with single space
    .replace(/\s+/g, ' ')
    // Trim leading and trailing whitespace
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-{2,}/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Ensure we don't return empty string
    || 'untitled';
}
