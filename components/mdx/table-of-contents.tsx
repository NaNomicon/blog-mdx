'use client';

import React, { useEffect, useState, useRef } from 'react';
import { generateSlug } from '@/lib/utils';
import { ChevronDown, ChevronUp, List } from 'lucide-react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
  maxLevel?: number; // Maximum heading level to include (default: 3)
  isMobile?: boolean; // Whether this is the mobile version
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  className = '', 
  maxLevel = 3,
  isMobile = false
}) => {
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(isMobile); // Start collapsed on mobile
  const tocContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Extract headings from the page
    const headings = Array.from(
      document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ).filter((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      return level <= maxLevel;
    });

    const tocItems: TocItem[] = headings.map((heading) => {
      const text = heading.textContent || '';
      const level = parseInt(heading.tagName.charAt(1));
      const id = heading.id || generateSlug(text);
      
      // Ensure the heading has an ID
      if (!heading.id) {
        heading.id = id;
      }

      return { id, text, level };
    });

    setToc(tocItems);

    // Set up intersection observer for active section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0,
      }
    );

    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [maxLevel]);

  // Scroll active item into view when activeId changes
  useEffect(() => {
    if (activeId && tocContainerRef.current && !isCollapsed) {
      const activeButton = tocContainerRef.current.querySelector(`button[data-id="${activeId}"]`);
      if (activeButton) {
        activeButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [activeId, isCollapsed]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      
      // Update URL without triggering a page reload
      window.history.pushState(null, '', `#${id}`);
      
      // Collapse on mobile after clicking
      if (isMobile) {
        setIsCollapsed(true);
      }
    }
  };

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className={`table-of-contents ${className}`}>
      {/* Header with toggle for mobile */}
      <div 
        className={`flex items-center justify-between ${isMobile ? 'cursor-pointer' : ''}`}
        onClick={isMobile ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <List className="w-5 h-5" />
          Table of Contents
        </h3>
        {isMobile && (
          <button
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            aria-label={isCollapsed ? 'Expand table of contents' : 'Collapse table of contents'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* TOC Content */}
      <div 
        ref={tocContainerRef}
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[400px] opacity-100 mt-4 overflow-y-auto'
        }`}
      >
        <ul className="space-y-2 pr-2">
          {toc.map((item) => (
            <li key={item.id}>
              <button
                data-id={item.id}
                onClick={() => handleClick(item.id)}
                className={`
                  block w-full text-left transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded text-sm
                  ${item.level === 1 ? 'font-semibold text-base' : ''}
                  ${item.level === 2 ? 'font-medium pl-3' : ''}
                  ${item.level === 3 ? 'font-normal pl-6' : ''}
                  ${item.level === 4 ? 'font-normal text-xs pl-9' : ''}
                  ${item.level === 5 ? 'font-normal text-xs pl-12' : ''}
                  ${item.level === 6 ? 'font-normal text-xs pl-15' : ''}
                  ${
                    activeId === item.id
                      ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default TableOfContents; 