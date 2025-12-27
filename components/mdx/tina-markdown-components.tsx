import React from "react";
import { TinaMarkdownContent, Components, TinaMarkdown } from "tinacms/dist/rich-text";
import YouTube from "@/components/mdx/youtube";
import Code from "@/components/mdx/code";
import InlineCode from "@/components/mdx/inline-code";
import Pre from "@/components/mdx/pre";
import { Callout } from "@/components/mdx/callout";
import { H1, H2, H3, H4, H5, H6 } from "@/components/mdx/heading";

export const tinaComponents: Components<{
  Callout: {
    type: 'info' | 'warning' | 'success' | 'error';
    title?: string;
    children: any;
  };
  YouTube: {
    id: string;
  };
}> = {
  Callout: (props) => {
    return (
      <Callout type={props?.type} title={props?.title}>
        <TinaMarkdown content={props?.children} components={tinaComponents} />
      </Callout>
    );
  },
  YouTube: (props) => {
    return <YouTube id={props?.id || ""} />;
  },
  h1: (props) => <H1 {...props} />,
  h2: (props) => <H2 {...props} />,
  h3: (props) => <H3 {...props} />,
  h4: (props) => <H4 {...props} />,
  h5: (props) => <H5 {...props} />,
  h6: (props) => <H6 {...props} />,
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
  code_block: (props) => {
    // Tina's rich-text code_block
    return <Pre {...props} />;
  },
};

