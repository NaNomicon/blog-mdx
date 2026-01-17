"use client";

import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ShareNoteProps {
  slug: string;
  className?: string;
}

export function ShareNote({ slug, className }: ShareNoteProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const url = `${window.location.origin}/notes/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "h-8 gap-2 text-muted-foreground hover:text-primary transition-all",
        className
      )}
      onClick={copyLink}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <LinkIcon className="h-3.5 w-3.5" />
      )}
      <span className="text-xs font-medium">{copied ? "Copied!" : "Copy Link"}</span>
    </Button>
  );
}
