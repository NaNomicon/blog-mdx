import React from 'react';
import { seoConfig } from '@/config/seo.config';

interface BlogPostStructuredDataProps {
  title: string;
  description: string;
  author: string;
  publishDate: string;
  category?: string;
  coverImage?: string;
  slug: string;
  siteUrl?: string;
  pathPrefix?: string;
}

interface WebsiteStructuredDataProps {
  siteName: string;
  description: string;
  siteUrl: string;
  author: string;
}

// Enhanced Person schema with social media profiles
function getPersonSchema(author: string, siteUrl: string) {
  return {
    "@type": "Person",
    "name": author,
    "url": siteUrl,
    "sameAs": [
      "https://x.com/NaNomicon_",
      seoConfig.blueskyProfile,
      seoConfig.dailyDevProfile,
      "https://github.com/NaN72dev"
    ],
    "jobTitle": "Developer",
    "description": "Developer with a passion for learning and exploring new technologies",
    "knowsAbout": [
      "Web Development",
      "Programming",
      "Technology",
      "Software Engineering"
    ]
  };
}

export function BlogPostStructuredData({
  title,
  description,
  author,
  publishDate,
  category,
  coverImage,
  slug,
  siteUrl = "https://nanomicon.com",
  pathPrefix = "/blog"
}: BlogPostStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "author": getPersonSchema(author, siteUrl),
    "datePublished": publishDate,
    "dateModified": publishDate,
    "url": `${siteUrl}${pathPrefix}/${slug}`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}${pathPrefix}/${slug}`
    },
    "publisher": getPersonSchema(author, siteUrl),
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
    "author": getPersonSchema(author, siteUrl),
    "publisher": getPersonSchema(author, siteUrl),
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

// New component for Person/Profile structured data
export function PersonStructuredData({
  name,
  siteUrl,
  description
}: {
  name: string;
  siteUrl: string;
  description: string;
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": name,
    "url": siteUrl,
    "description": description,
    "sameAs": [
      "https://x.com/NaNomicon_",
      seoConfig.blueskyProfile,
      seoConfig.dailyDevProfile,
      "https://github.com/NaN72dev"
    ],
    "jobTitle": "Developer",
    "knowsAbout": [
      "Web Development",
      "Programming",
      "Technology",
      "Software Engineering"
    ],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": siteUrl
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
} 