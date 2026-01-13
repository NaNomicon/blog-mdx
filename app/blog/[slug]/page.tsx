import React from "react";
import dynamic from "next/dynamic";
import type {Metadata, ResolvingMetadata} from "next";
import {format} from "date-fns";
import { generateSEOMetadata, extractSEOFromBlogMetadata, defaultSEOConfig } from "@/lib/seo";
import { BlogPostStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { BlogLayout } from "@/components/mdx/blog-layout";
import { getPostBySlug, getAllPosts, isPreviewMode, type BlogPostMetadata } from "@/lib/content";
import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPostBySlug<BlogPostMetadata>("blogs", params.slug, isPreviewMode());
  if (!post) return {};
  
  const seoConfig = extractSEOFromBlogMetadata(post.metadata, params.slug);
  return generateSEOMetadata(seoConfig);
}

export async function generateStaticParams() {
  const posts = await getAllPosts<BlogPostMetadata>("blogs");
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 🚀 ISR Magic - Revalidate every hour!
export const revalidate = 3600; // 1 hour in seconds

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const post = await getPostBySlug<BlogPostMetadata>("blogs", slug, isPreviewMode());
  
  if (!post) {
    notFound();
  }

  // Dynamically import the MDX file based on the actual type (could be 'blogs' or 'drafts')
  const MDXContent = dynamic(() => import(`@/content/${post.type}/${slug}.mdx`));

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
          { name: post.metadata.title, url: `${defaultSEOConfig.siteUrl}/blog/${slug}` }
        ]}
      />
    <div className="max-w-4xl mx-auto px-4 py-16">
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
          <BlogLayout metadata={post.metadata}>
            <MDXContent />
          </BlogLayout>
        </article>
      </div>
    </div>
    </>
  );
}
