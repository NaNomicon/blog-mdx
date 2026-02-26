import React from "react";
import dynamic from "next/dynamic";
import type { Metadata, ResolvingMetadata } from "next";
import { format } from "date-fns";
import {
  generateSEOMetadata,
  extractSEOFromBlogMetadata,
  defaultSEOConfig,
} from "@/lib/seo";
import {
  BlogPostStructuredData,
  BreadcrumbStructuredData,
} from "@/components/seo/structured-data";
import { BlogLayout } from "@/components/mdx/blog-layout";
import { InlineEngagement } from "@/components/mdx/inline-engagement";
import { ViewTracker } from "@/components/mdx/view-tracker";
import { FallbackBanner } from "@/components/i18n/fallback-banner";
import {
  getPostBySlug,
  getAllPosts,
  isPreviewMode,
  type BlogPostMetadata,
} from "@/lib/content";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { locale, slug } = await params;
  const result = await getPostBySlug<BlogPostMetadata>(slug, "blogs", locale);
  if (!result) return {};
  const { post } = result;

  const seoConfig = extractSEOFromBlogMetadata(post.metadata, slug);
  return generateSEOMetadata({ ...seoConfig, locale });
}

export async function generateStaticParams() {
  const posts = await getAllPosts<BlogPostMetadata>("blogs");
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 🚀 ISR Magic - Revalidate every hour!
export const revalidate = 3600; // 1 hour in seconds

export default async function Page({ params }: Props) {
  const { locale, slug } = await params;

  const result = await getPostBySlug<BlogPostMetadata>(slug, "blogs", locale);

  if (!result) {
    notFound();
  }

  const { post, isFallback } = result;

  // Use the resolved locale for the dynamic import (fallback to 'en' if content not available in requested locale)
  const contentLocale = isFallback ? "en" : locale;

  // Dynamically import the MDX file based on the actual type (could be 'blogs' or 'drafts')
  const MDXContent = dynamic(
    () => import(`@/content/${contentLocale}/${post.type}/${slug}.mdx`)
  );

  const formattedDate = format(
    new Date(post.metadata.publishDate),
    "MMMM dd, yyyy"
  );

  return (
    <>
      <BlogPostStructuredData
        title={post.metadata.title}
        description={post.metadata.description}
        author={defaultSEOConfig.author!}
        publishDate={post.metadata.publishDate}
        category={post.metadata.category}
        coverImage={post.metadata.cover_image}
        slug={slug}
        siteUrl={defaultSEOConfig.siteUrl}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: defaultSEOConfig.siteUrl! },
          { name: "Blog", url: `${defaultSEOConfig.siteUrl}/blog` },
          {
            name: post.metadata.title,
            url: `${defaultSEOConfig.siteUrl}/blog/${slug}`,
          },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <ViewTracker slug={slug} mode="immediate" />
        {isFallback && <FallbackBanner />}
        <div className="w-full space-y-8">
          <article className="space-y-8">
            <div>
              <p className="font-semibold text-lg">
                <span className="text-red-600 pr-1">
                  {post.metadata.publishDate}
                </span>{" "}
                {post.metadata.category}
              </p>
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-black capitalize leading-tight">
                {post.metadata.title}
              </h1>
            </div>

            <InlineEngagement slug={slug} className="border-t-0 pb-0" />

            <BlogLayout metadata={post.metadata}>
              <MDXContent />
            </BlogLayout>

            <InlineEngagement slug={slug} className="mt-16" />
          </article>
        </div>
      </div>
    </>
  );
}
