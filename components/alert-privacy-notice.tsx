"use client";
import { Button } from "@/components/ui/button";
import { Cookie, Settings } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState, useEffect, useCallback } from "react";

export function isPrivacyConsentSet() {
  return localStorage.getItem("privacy.consent") === "1";
}

export function markPrivacyConsentSet() {
  localStorage.setItem("privacy.consent", "1");
}

export function disableAnalytics() {
  localStorage.setItem("umami.disabled", "1");
}

export function enableAnalytics() {
  localStorage.removeItem("umami.disabled");
}

export function isAnalyticsEnabled() {
  return localStorage.getItem("umami.disabled") !== "1";
}

export function setAnalyticsEnabled(enabled: boolean) {
  if (enabled) {
    enableAnalytics();
  } else {
    disableAnalytics();
  }
}

const PRIVACY_TOAST_ID = "privacy-consent-toast";

export function usePrivacyToast() {
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(() =>
    isAnalyticsEnabled()
  );

  const handleAccept = useCallback(() => {
    enableAnalytics();
    markPrivacyConsentSet();
    toast.dismiss(PRIVACY_TOAST_ID);
  }, []);

  const handleEssentialOnly = useCallback(() => {
    disableAnalytics();
    markPrivacyConsentSet();
    toast.dismiss(PRIVACY_TOAST_ID);
  }, []);

  const showPrivacyToast = useCallback(() => {
    if (isPrivacyConsentSet()) {
      return;
    }

    // Check if privacy toast is already showing
    if (
      document.querySelector(
        `[data-sonner-toast][data-toast-id="${PRIVACY_TOAST_ID}"]`
      )
    ) {
      return;
    }

    toast.custom(
      (t) => (
        <div className="flex items-start gap-4 p-4 bg-background border border-border rounded-lg shadow-lg min-w-[280px] max-w-[90vw] sm:min-w-[400px]">
          <Cookie className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <div>
              <h3 className="font-semibold text-foreground">
                We Value Your Privacy
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                We use privacy-focused cookies to improve your experience. Your
                data is anonymized and stays securely with us.
                <br />
                See our{" "}
                <Link
                  href="/privacy-policy"
                  className="underline underline-offset-2 font-bold text-foreground hover:text-muted-foreground"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button size="sm" onClick={handleAccept}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleEssentialOnly}
              >
                Essential only
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPreferencesOpen(true)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Preferences
              </Button>
            </div>
          </div>
        </div>
      ),
      {
        id: PRIVACY_TOAST_ID,
        position: "bottom-center",
        dismissible: false,
        duration: Infinity,
      }
    );
  }, [setPreferencesOpen, handleAccept, handleEssentialOnly]);

  // Hide toast when preferences dialog is open
  useEffect(() => {
    if (preferencesOpen) {
      toast.dismiss(PRIVACY_TOAST_ID);
    }
  }, [preferencesOpen]);

  const savePreferences = useCallback(() => {
    setAnalyticsEnabled(analyticsEnabled);
    markPrivacyConsentSet();
    toast.dismiss(PRIVACY_TOAST_ID);
  }, [analyticsEnabled]);

  const handleSavePreferences = useCallback(() => {
    savePreferences();
    setPreferencesOpen(false);
  }, [savePreferences]);

  return {
    showPrivacyToast,
    preferencesOpen,
    setPreferencesOpen,
    analyticsEnabled,
    setAnalyticsEnabledState,
    handleSavePreferences,
    savePreferences,
  };
}

// Utility function to check if privacy toast is currently showing
export function isPrivacyToastActive() {
  if (typeof window === "undefined") return false;
  return (
    document.querySelector(
      `[data-sonner-toast][data-toast-id="${PRIVACY_TOAST_ID}"]`
    ) !== null
  );
}

// Function to dismiss privacy toast from anywhere
export function dismissPrivacyToast() {
  toast.dismiss(PRIVACY_TOAST_ID);
}
