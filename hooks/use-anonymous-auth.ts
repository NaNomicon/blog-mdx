'use client';

import { useCallback } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";

export function useAnonymousAuth() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const ensureAuthenticated = useCallback(async () => {
    if (isLoading) return false;
    if (!isAuthenticated) {
      await signIn("anonymous");
      return false;
    }
    return true;
  }, [signIn, isAuthenticated, isLoading]);
  return { isAuthenticated, isLoading, ensureAuthenticated };
}
