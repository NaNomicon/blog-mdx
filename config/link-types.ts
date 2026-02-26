/**
 * Configuration for MDX link relationship types.
 *
 * Authoring format: [text](url "type | note")
 * Example: [Tailwind CSS](https://tailwindcss.com "reference | CSS framework")
 */

export type LinkType =
  | "reference"
  | "mention"
  | "joke"
  | "aside"
  | "further-reading"
  | "warning";

export const LINK_TYPES = {
  reference: {
    label: "Reference",
    tailwindBg: "bg-blue-100 dark:bg-blue-900/30",
    tailwindText: "text-blue-700 dark:text-blue-300",
    icon: "BookOpen",
  },
  mention: {
    label: "Mention",
    tailwindBg: "bg-purple-100 dark:bg-purple-900/30",
    tailwindText: "text-purple-700 dark:text-purple-300",
    icon: "AtSign",
  },
  joke: {
    label: "Joke",
    tailwindBg: "bg-amber-100 dark:bg-amber-900/30",
    tailwindText: "text-amber-700 dark:text-amber-300",
    icon: "Smile",
  },
  aside: {
    label: "Aside",
    tailwindBg: "bg-zinc-100 dark:bg-zinc-800/50",
    tailwindText: "text-zinc-600 dark:text-zinc-400",
    icon: "MessageSquare",
  },
  "further-reading": {
    label: "Further Reading",
    tailwindBg: "bg-emerald-100 dark:bg-emerald-900/30",
    tailwindText: "text-emerald-700 dark:text-emerald-300",
    icon: "Library",
  },
  warning: {
    label: "Warning",
    tailwindBg: "bg-red-100 dark:bg-red-900/30",
    tailwindText: "text-red-700 dark:text-red-300",
    icon: "TriangleAlert",
  },
} as const;

/**
 * Type guard to check if a string is a valid LinkType.
 */
export function isLinkType(value: string): value is LinkType {
  return Object.keys(LINK_TYPES).includes(value);
}
