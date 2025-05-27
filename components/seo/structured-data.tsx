import React from 'react';

interface BlogPostStructuredDataProps {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  category?: string;
  coverImage?: string;
  slug: string;
  siteUrl?: string;
}

interface WebsiteStructuredDataProps {
  siteName: string;
  description: string;
  siteUrl: string;
  author: string;
}

export function BlogPostStructuredData({
  title,
  description,
  author,
  publishDate,
  category,
  coverImage,
  slug,
  siteUrl = "https://yourdomain.com"
}: BlogPostStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author
    },
    "datePublished": publishDate,
    "dateModified": publishDate,
    "url": `${siteUrl}/blog/${slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/blog/${slug}`
    },
    "publisher": {
      "@type": "Person",
      "name": author
    },
    ...(coverImage && {
      "image": {
        "@type": "ImageObject",
        "url": `${siteUrl}${coverImage}`,
        "width": 1200,
        "height": 630
      }
    }),
    ...(category && {
      "articleSection": category,
      "about": category
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebsiteStructuredData({
  siteName,
  description,
  siteUrl,
  author
}: WebsiteStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteName,
    "description": description,
    "url": siteUrl,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Person",
      "name": author
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${siteUrl}/blog?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items
}: {
  items: Array<{ name: string; url: string }>
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 