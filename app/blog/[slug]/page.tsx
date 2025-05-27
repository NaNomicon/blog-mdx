import fs from "node:fs";
import path from "node:path";
import React from "react";
import dynamic from "next/dynamic";
import type {Metadata, ResolvingMetadata} from "next";
import {format} from "date-fns";
import { generateSEOMetadata, extractSEOFromBlogMetadata, defaultSEOConfig } from "@/lib/seo";
import { BlogPostStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";
import { BlogLayout } from "@/components/mdx/blog-layout";

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await getPost(params);
  const seoConfig = extractSEOFromBlogMetadata(post.metadata, params.slug);
  return generateSEOMetadata(seoConfig);
}

async function getPost({ slug }: { slug: string }) {
  try {
    const mdxPath = path.join("content", "blogs", `${slug}.mdx`);
    if (!fs.existsSync(mdxPath)) {
      throw new Error(`MDX file for slug ${slug} does not exist`);
    }

    const { metadata } = await import(`@/content/blogs/${slug}.mdx`);

    return {
      slug,
      metadata,
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error(`Unable to fetch the post for slug: ${slug}`);
  }
}

export async function generateStaticParams() {
  const files = fs.readdirSync(path.join("content", "blogs"));
  const params = files.map((filename) => ({
    slug: filename.replace(".mdx", ""),
  }));

  return params;
}

// 🚀 ISR Magic - Revalidate every hour!
export const revalidate = 3600; // 1 hour in seconds

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const post = await getPost(params);
  // Dynamically import the MDX file based on the slug
  const MDXContent = dynamic(() => import(`@/content/blogs/${slug}.mdx`));

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
    <div className="max-w-3xl z-10 w-full items-center justify-between">
      <div className="w-full flex justify-center items-center flex-col gap-6">
        <article>
          <div className="pb-8">
            <p className="font-semibold text-lg">
              <span className="text-red-600 pr-1">
                {post.metadata.publishDate}
              </span>{" "}
              {post.metadata.category}
            </p>
          </div>
          <div className="pb-10">
            <h1 className="text-5xl sm:text-6xl font-black capitalize leading-12">
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
