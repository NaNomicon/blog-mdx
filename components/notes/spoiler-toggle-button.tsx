"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function SpoilerToggleButton() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const toggleSpoilers = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("spoilers", "true");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={toggleSpoilers}
      className="bg-background border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
    >
      <Eye className="h-4 w-4 mr-2 text-primary" />
      Turn off spoiler toggle
    </Button>
  );
}
