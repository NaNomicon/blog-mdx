import React from "react";
import type { Metadata } from "next";
import { client } from "@/tina/__generated__/client";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaComponents } from "@/components/mdx/tina-markdown-components";
import { generateSEOMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "Privacy",
    description:
      "Privacy Policy for NaN's blog - Learn how we collect, use, and protect your information.",
  });
}

export default async function PrivacyPolicy() {
  const pageResponse = await client.queries.page({
    relativePath: "privacy-policy.mdx",
  });
  const page = pageResponse.data.page;

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              {page.title}
              <span className="text-muted-foreground">.</span>
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
          </div>

          {/* Tina Content */}
          <article className="prose prose-lg max-w-none">
            <TinaMarkdown content={page.body} components={tinaComponents} />
          </article>
        </div>
      </div>
    </>
  );
}
