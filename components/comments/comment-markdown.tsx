"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { cn } from "@/lib/utils";

// rehypeHighlight MUST run before rehypeSanitize, and the custom schema MUST
// allow className on code/span. The default GitHub schema strips class
// attributes, which would destroy all hljs-* classes and break highlighting.
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // Bare property name = any value allowed. ["className"] (array) would
    // strip ALL className instead.
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    span: [...(defaultSchema.attributes?.span ?? []), "className"],
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
        rehypePlugins={[rehypeHighlight, [rehypeSanitize, sanitizeSchema]]}
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
            const safeHref = href?.toLowerCase().startsWith("javascript:")
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
