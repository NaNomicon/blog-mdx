import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { format } from "date-fns";
import { client } from "@/tina/__generated__/client";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { tinaComponents } from "@/components/mdx/tina-markdown-components";
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

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = params;
  try {
    const postResponse = await client.queries.post({
      relativePath: `${slug}.mdx`,
    });
    const post = postResponse.data.post;
    const seoConfig = extractSEOFromBlogMetadata(post, slug);
    return generateSEOMetadata(seoConfig);
  } catch (error) {
    return generateSEOMetadata(defaultSEOConfig);
  }
}

export async function generateStaticParams() {
  const postsListData = await client.queries.postConnection();
  return (
    postsListData.data.postConnection.edges?.map((post) => ({
      slug: post?.node?._sys.filename,
    })) || []
  );
}

// 🚀 ISR Magic - Revalidate every hour!
export const revalidate = 3600; // 1 hour in seconds

export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const postResponse = await client.queries.post({
    relativePath: `${slug}.mdx`,
  });
  const post = postResponse.data.post;

  const formattedDate = format(new Date(post.publishDate), "MMMM dd, yyyy");

  return (
    <>
      <BlogPostStructuredData
        title={post.title}
        description={post.description || ""}
        author={defaultSEOConfig.author!}
        publishDate={post.publishDate}
        category={post.category || ""}
        coverImage={post.cover_image || ""}
        slug={slug}
        siteUrl={defaultSEOConfig.siteUrl}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: defaultSEOConfig.siteUrl! },
          { name: "Blog", url: `${defaultSEOConfig.siteUrl}/blog` },
          {
            name: post.title,
            url: `${defaultSEOConfig.siteUrl}/blog/${slug}`,
          },
        ]}
      />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="w-full space-y-8">
          <article className="space-y-8">
            <div>
              <p className="font-semibold text-lg">
                <span className="text-red-600 pr-1">{post.publishDate}</span>{" "}
                {post.category}
              </p>
            </div>
            <div>
              <h1 className="text-5xl sm:text-6xl font-black capitalize leading-tight">
                {post.title}
              </h1>
            </div>
            <BlogLayout metadata={post}>
              <TinaMarkdown content={post.body} components={tinaComponents} />
            </BlogLayout>
          </article>
        </div>
      </div>
    </>
  );
}
