'use client';

import { useEffect } from 'react';

const ScrollToHash: React.FC = () => {
  useEffect(() => {
    const scrollToHash = (retryCount = 0) => {
      // Get the hash from the URL
      const hash = window.location.hash;
      
      if (hash) {
        // Remove the # symbol
        const id = hash.substring(1);
        
        // Debug: Log all available heading IDs (only on first attempt)
        if (retryCount === 0) {
          const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          allHeadings.forEach((heading, index) => {
          });
        }
        
        // Try to find the element
        const element = document.getElementById(id);
        
        if (element) {
          // Wait a bit more to ensure everything is rendered
          setTimeout(() => {
            // Calculate offset to account for any fixed headers
            const offset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            // Scroll to the element with offset
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            
          }, 200);
        } else if (retryCount < 15) {
          // If element not found, retry after a short delay
          setTimeout(() => {
            scrollToHash(retryCount + 1);
          }, 400);
        } else {
        }
      }
    };

    // Wait for the page to be fully loaded
    const handlePageLoad = () => {
      if (window.location.hash) {
        // Wait a bit longer for React components to render
        setTimeout(() => {
          scrollToHash();
        }, 1000);
      }
    };

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      handlePageLoad();
    } else {
      window.addEventListener('load', handlePageLoad);
    }

    // Listen for hash changes (when user clicks browser back/forward)
    const handleHashChange = () => {
      scrollToHash();
    };

    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('load', handlePageLoad);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default ScrollToHash; 