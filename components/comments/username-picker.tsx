"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Shuffle, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/convex/_generated/api";
import { generateRandomUsername } from "@/lib/username-generator";
import { useAnonymousAuth } from "@/hooks/use-anonymous-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

interface UsernamePickerProps {
  currentUsername: string | null;
  onUsernameChange: (name: string) => void;
}

export function UsernamePicker({ currentUsername, onUsernameChange }: UsernamePickerProps) {
  const t = useTranslations("Comments");
  const setUsername = useMutation(api.comments.setUsername);
  const { ensureAuthenticated } = useAnonymousAuth();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentUsername ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!USERNAME_REGEX.test(value)) {
      setError(t("username.invalid"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      // Gate on anonymous sign-in. On a fresh session, view-tracker signs in
      // async on mount — claiming before that completes throws "Not
      // authenticated". First attempt signs in, returns false.
      const authed = await ensureAuthenticated();
      if (!authed) return;
      await setUsername({ username: value });
      onUsernameChange(value);
      setEditing(false);
    } catch (err) {
      if (err instanceof ConvexError && err.data?.kind === "usernameTaken") {
        setError(t("username.taken"));
      } else {
        setError(t("error.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!editing && currentUsername ? (
        <>
          <span className="text-sm text-muted-foreground">
            {t("username.label")}{" "}
            <strong className="font-semibold text-foreground">{currentUsername}</strong>
          </span>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setEditing(true)}>
            {t("username.change")}
          </Button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("username.placeholder")}
            className="w-48"
            aria-label={t("username.placeholder")}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setValue(generateRandomUsername())}
          >
            <Shuffle className="h-3.5 w-3.5" />
            {t("username.random")}
          </Button>
          <Button type="submit" size="sm" disabled={submitting}>
            <Check className="h-3.5 w-3.5" />
            {t("form.save")}
          </Button>
        </form>
      )}
      {error && <span className="w-full text-xs text-red-600 dark:text-red-400">{error}</span>}
    </div>
  );
}
