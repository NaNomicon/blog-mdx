"use client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import Link from "next/link";

function isPrivacyConsentSet() {
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

export default function AlertCookieNotice() {
  function handleAccept() {
    enableAnalytics();
    markPrivacyConsentSet();
  }

  function handleEssentialOnly() {
    disableAnalytics();
    markPrivacyConsentSet();
  }

  function handleDecline() {
    disableAnalytics();
    markPrivacyConsentSet();
  }

  return (
    <Alert variant="default" className="min-w-[400px]">
      <Cookie />
      <AlertTitle>We Value Your Privacy</AlertTitle>
      <AlertDescription>
        We use cookies to enhance your browsing experience and analyze site
        traffic. See our{" "}
        <Link
          href="/privacy-policy"
          className="underline underline-offset-2 font-bold"
        >
          Privacy Policy
        </Link>
        .
      </AlertDescription>
      <div className="flex gap-2 pt-3">
        <Button size="sm" onClick={handleAccept}>
          Accept
        </Button>
        <Button size="sm" variant="secondary" onClick={handleEssentialOnly}>
          Essential only
        </Button>
        <Button size="sm" variant="outline" onClick={handleDecline}>
          Decline
        </Button>
      </div>
    </Alert>
  );
}
