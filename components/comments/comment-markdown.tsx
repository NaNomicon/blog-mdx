"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";

// NOTE: rehype-highlight is deliberately NOT used here. Importing it pulls in
// lowlight -> highlight.js@11, which clashes with the site's hoisted
// highlight.js@10.7.2 (used by tailwind-highlightjs) and breaks the clean
// Vercel build ("Module not found: highlight.js/lib/languages/*"). Comments
// don't need full syntax highlighting; the styled <code> renderer is enough.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Bare property name = any value allowed. ["className"] (array) would
    // strip ALL className instead.
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
  },
};

interface CommentMarkdownProps {
  content: string;
  className?: string;
}

export function CommentMarkdown({ content, className }: CommentMarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        components={{
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-md bg-muted/60 p-3 text-sm">{children}</pre>
          ),
          code: ({ className, children, ...props }) => {
            if (/language-/.test(className ?? "")) {
              return (
                <code className={cn("font-mono text-sm", className)} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-muted/60 px-1 py-0.5 font-mono text-[0.875em]" {...props}>
                {children}
              </code>
            );
          },
          a: ({ href, children }) => {
            const safeHref = href?.trim().toLowerCase().startsWith("javascript:")
              ? undefined
              : href;
            return (
              <a href={safeHref} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
