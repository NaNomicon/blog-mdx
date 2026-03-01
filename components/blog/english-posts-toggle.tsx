"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function EnglishPostsToggle({
  isActive,
  style = "default",
}: {
  isActive: boolean;
  style?: "default" | "filter";
}) {
  const t = useTranslations("Blog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) {
      params.delete("showEn");
    } else {
      params.set("showEn", "1");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  if (style === "filter") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={toggle}
        className={cn(
          "relative h-10 px-3 bg-background border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all",
          isActive && "border-primary bg-primary/5 border-solid"
        )}
      >
        <Globe className={cn("h-4 w-4 mr-2", isActive ? "text-primary" : "text-muted-foreground")} />
        <span className="text-xs font-medium uppercase tracking-wider">
          {isActive ? t("hideEnglishPosts") : t("showEnglishPosts")}
        </span>
      </Button>
    );
  }

  return (
    <Button
      variant={isActive ? "secondary" : "outline"}
      size="sm"
      onClick={toggle}
      className="gap-2"
    >
      <Globe className="w-4 h-4" />
      {isActive ? t("hideEnglishPosts") : t("showEnglishPosts")}
    </Button>
  );
}
