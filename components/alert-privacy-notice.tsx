"use client";
import { Button } from "@/components/ui/button";
import { Cookie, Settings, Check } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  function handleAccept() {
    enableAnalytics();
    markPrivacyConsentSet();
    toast.dismiss(PRIVACY_TOAST_ID);
  }

  function handleEssentialOnly() {
    disableAnalytics();
    markPrivacyConsentSet();
    toast.dismiss(PRIVACY_TOAST_ID);
  }

  function handleSavePreferences() {
    setAnalyticsEnabled(analyticsEnabled);
    markPrivacyConsentSet();
    setPreferencesOpen(false);
    toast.dismiss(PRIVACY_TOAST_ID);
  }

  function PreferencesContent() {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-600" />
                <h4 className="font-medium">Strictly Necessary</h4>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Essential cookies for the website to function properly. These
                cannot be disabled.
              </p>
            </div>
            <div className="text-sm text-muted-foreground">Always Active</div>
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">Analytics (e.g., Umami)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Help us understand how visitors interact with our website
                through anonymous analytics.
              </p>
            </div>
            <button
              onClick={() => setAnalyticsEnabledState(!analyticsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                analyticsEnabled ? "bg-primary" : "bg-input"
              }`}
              role="switch"
              aria-checked={analyticsEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  analyticsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  }

  function showPrivacyToast() {
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
        <div className="flex items-start gap-4 p-4 bg-background border border-border rounded-lg shadow-lg min-w-[350px]">
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
            <div className="flex gap-2">
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
              <Sheet open={preferencesOpen} onOpenChange={setPreferencesOpen}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-1" />
                    Preferences
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Cookie Preferences</SheetTitle>
                    <SheetDescription>
                      Manage your cookie preferences. You can enable or disable
                      different types of cookies below.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6">
                    <PreferencesContent />
                  </div>
                  <SheetFooter>
                    <Button onClick={handleSavePreferences} className="w-full">
                      Save Preferences
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
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
  }

  return { showPrivacyToast };
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
