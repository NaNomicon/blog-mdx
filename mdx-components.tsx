import React from "react";
import type { MDXComponents } from "mdx/types";
import YouTube from "@/components/mdx/youtube";
import Code from "@/components/mdx/code";
import InlineCode from "@/components/mdx/inline-code";
import Pre from "@/components/mdx/pre"; // Adjust the import path as needed
import { Button } from "@/components/ui/button";
import { Callout } from "@/components/mdx/callout";
import { H1, H2, H3, H4, H5, H6 } from "@/components/mdx/heading";
import TableOfContents from "@/components/mdx/table-of-contents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    YouTube,
    Callout,
    TableOfContents,
    pre: Pre, // Use the custom Pre component
    code: (props) => {
      const { className, children } = props;
      if (className) {
        return <Code {...props} />;
      }
      return <InlineCode>{children}</InlineCode>;
    },
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    p: (props) => <p className="text-lg mb-4" {...props} />,
    li: (props) => <li className="pb-1" {...props} />,
    ul: (props) => <ul className="list-disc pl-6 pb-4" {...props} />,
    ol: (props) => <ol className="list-decimal pl-6 pb-4" {...props} />,
    hr: (props) => <hr className="my-4" {...props} />,
    blockquote: (props) => (
      <blockquote
        style={{ paddingBottom: 0 }}
        className="border-l-4 pl-4 my-4"
        {...props}
      />
    ),
    a: (props) => <a className="hover:underline font-semibold" {...props} />,
  };
}
