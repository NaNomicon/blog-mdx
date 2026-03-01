"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function EnglishPostsToggle({ isActive }: { isActive: boolean }) {
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
