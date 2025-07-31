import React from "react";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

// Dynamically import the MDX file
const MDXContent = dynamic(() => import("@/content/pages/privacy-policy.mdx"));

export async function generateMetadata(): Promise<Metadata> {
  return generateSEOMetadata({
    title: "Privacy",
    description:
      "Privacy Policy for NaN's blog - Learn how we collect, use, and protect your information.",
  });
}

export default function PrivacyPolicy() {
  return (
    <>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight">
              Privacy Policy
              <span className="text-muted-foreground">.</span>
            </h1>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto" />
          </div>

          {/* MDX Content */}
          <article className="prose prose-lg max-w-none">
            <MDXContent />
          </article>
        </div>
      </div>
    </>
  );
}
