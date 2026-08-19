"use client";

import { useState, FormEvent } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { Shuffle, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/convex/_generated/api";
import { generateRandomUsername } from "@/lib/username-generator";
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
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (currentUsername && !editing) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>
          {t("username.label")} <strong className="text-foreground">{currentUsername}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
          {t("username.change")}
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!USERNAME_REGEX.test(value)) {
      setError(t("username.invalid"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
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
      {error && <span className="w-full text-xs text-red-600 dark:text-red-400">{error}</span>}
    </form>
  );
}
