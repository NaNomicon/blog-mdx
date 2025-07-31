"use client";

import { useEffect } from "react";
import {
  usePrivacyToast,
  isPrivacyConsentSet,
  isPrivacyToastActive,
  disableAnalytics,
} from "@/components/alert-privacy-notice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function PrivacyToastInit() {
  const {
    showPrivacyToast,
    preferencesOpen,
    setPreferencesOpen,
    analyticsEnabled,
    setAnalyticsEnabledState,
    handleSavePreferences,
    savePreferences,
  } = usePrivacyToast();

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Save preferences when dialog is closed
      savePreferences();
    }
    setPreferencesOpen(open);
  };

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

  return (
    <Dialog open={preferencesOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cookie Preferences</DialogTitle>
          <DialogDescription>
            Manage your cookie preferences. You can enable or disable different
            types of cookies below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 border rounded-lg bg-muted/50 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <h4 className="font-medium">Strictly Necessary</h4>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essential cookies for the website to function properly.
                    These cannot be disabled.
                  </p>
                </div>
                <div className="flex items-center text-sm text-muted-foreground whitespace-nowrap">
                  Always Active
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium">Analytics (e.g., Umami)</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Help us understand how visitors interact with our website
                    through anonymous analytics.
                  </p>
                </div>
                <div className="flex items-center justify-end sm:justify-center">
                  <button
                    onClick={() => setAnalyticsEnabledState(!analyticsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-shrink-0 ${
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
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSavePreferences} className="w-full sm:w-auto">
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
