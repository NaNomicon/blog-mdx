"use client";

import { useEffect, useRef } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

interface ViewTrackerProps {
  slug: string;
  mode?: "immediate" | "scroll";
}

export function ViewTracker({ slug, mode = "immediate" }: ViewTrackerProps) {
  const recordView = useMutation(api.engagement.recordView);
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const hasRecorded = useRef(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initAndRecord = async () => {
      if (isLoading || hasRecorded.current) return;
      
      try {
        if (!isAuthenticated) {
          await signIn("anonymous");
          return;
        }

        await recordView({ slug });
        hasRecorded.current = true;
      } catch (error) {
        console.error("Failed to record view:", error);
      }
    };

    if (mode === "immediate") {
      initAndRecord();
    } else {
      // mode === "scroll"
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            initAndRecord();
            observer.disconnect();
          }
        },
        { threshold: 0.5 } // Count as a view when 50% of the element is visible
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => observer.disconnect();
    }
  }, [slug, recordView, signIn, isAuthenticated, isLoading, mode]);

  if (mode === "scroll") {
    return <div ref={elementRef} className="h-px w-full" aria-hidden="true" />;
  }

  return null;
}
