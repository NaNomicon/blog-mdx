'use client';

import { useEffect } from 'react';

interface CloudflareAnalyticsProps {
  token?: string;
}

export function CloudflareAnalytics({ token }: CloudflareAnalyticsProps) {
  useEffect(() => {
    if (!token) {
      console.warn('Cloudflare Analytics: No token provided');
      return;
    }

    // Check if script is already loaded
    if (document.querySelector('script[data-cf-beacon]')) {
      return;
    }

    // Create and inject the Cloudflare Analytics script
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.setAttribute('data-cf-beacon', `{"token": "${token}"}`);
    script.setAttribute('data-cf-settings', '{"analytics":{"enabled":true}}');
    
    // Add error handling
    script.onerror = () => {
      console.error('Failed to load Cloudflare Analytics script');
    };

    script.onload = () => {
      console.log('Cloudflare Analytics loaded successfully');
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[data-cf-beacon]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [token]);

  // This component doesn't render anything visible
  return null;
}

// Server-side component for static injection (alternative approach)
export function CloudflareAnalyticsScript({ token }: CloudflareAnalyticsProps) {
  if (!token) {
    return null;
  }

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
      data-cf-settings='{"analytics":{"enabled":true}}'
    />
  );
} 