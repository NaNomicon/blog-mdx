import React from 'react';
import Image from 'next/image';

interface BlogLayoutProps {
  metadata: {
    title: string;
    publishDate: string;
    description: string;
    category: string;
    cover_image: string;
    tldr?: string;
  };
  children: React.ReactNode;
}

export function BlogLayout({ metadata, children }: BlogLayoutProps) {
  return (
    <>
      {/* TLDR Section */}
      {metadata.tldr && (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">TLDR:</p>
          <p className="text-gray-700 dark:text-gray-300 italic">{metadata.tldr}</p>
        </div>
      )}

      {/* Cover Image */}
      {metadata.cover_image && (
        <div className="mb-8">
          <Image 
            src={metadata.cover_image} 
            alt={`Cover image: ${metadata.title}`}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Separator */}
      <hr className="mb-8 border-gray-300 dark:border-gray-600" />

      {/* Blog Content */}
      <div className="prose prose-lg md:prose-lg lg:prose-lg mx-auto min-w-full">
        {children}
      </div>

      {/* Separator */}
      <hr className="mt-8 mb-4 border-gray-300 dark:border-gray-600" />

      {/* Published Date */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          Published on {metadata.publishDate}
        </p>
      </div>
    </>
  );
} 