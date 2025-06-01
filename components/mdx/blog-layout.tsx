import React from 'react';
import Image from 'next/image';
import TableOfContents from './table-of-contents';
import ScrollToHash from './scroll-to-hash';

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
      {/* Scroll to hash handler */}
      <ScrollToHash />

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

      {/* Mobile Table of Contents - Collapsible at top */}
      <div className="xl:hidden mb-8">
        <div className="max-h-[500px]">
          <TableOfContents 
            className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            maxLevel={3}
            isMobile={true}
          />
        </div>
      </div>

      {/* Blog Content - Restored to original layout */}
      <div className="prose prose-lg md:prose-xl lg:prose-xl mx-auto max-w-none">
        {children}
      </div>

      {/* Desktop Floating Table of Contents - Fixed at far-right edge */}
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 z-50 hidden xl:block">
        <TableOfContents 
          className="w-64 max-h-[70vh] overflow-y-auto p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
          maxLevel={3}
          isMobile={false}
        />
      </div>

      {/* Mobile Floating TOC - Sticky at bottom */}
      <div className="xl:hidden fixed bottom-4 right-4 z-50">
        <div className="max-h-[60vh]">
          <TableOfContents 
            className="w-80 max-w-[calc(100vw-2rem)] p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg"
            maxLevel={3}
            isMobile={true}
          />
        </div>
      </div>
    </>
  );
} 