'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandling } from '@/lib/error-handler';

export function TelegramClientInit() {
  useEffect(() => {
    // Initialize client-side error handling
    setupGlobalErrorHandling();
  }, []);

  return null; // This component doesn't render anything
} 