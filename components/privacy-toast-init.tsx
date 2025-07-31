"use client";

import { useEffect } from "react";
import {
  usePrivacyToast,
  isPrivacyConsentSet,
  isPrivacyToastActive,
  disableAnalytics,
} from "@/components/alert-privacy-notice";

export function PrivacyToastInit() {
  const { showPrivacyToast } = usePrivacyToast();
  useEffect(() => {
    if (!isPrivacyConsentSet()) {
      disableAnalytics();
    }
  }, []);

  useEffect(() => {
    // Show privacy toast on page load if consent hasn't been set and toast isn't already active
    if (
      typeof window !== "undefined" &&
      !isPrivacyConsentSet() &&
      !isPrivacyToastActive()
    ) {
      showPrivacyToast();
    }
  }, [showPrivacyToast]);

  return null; // This component doesn't render anything
}
