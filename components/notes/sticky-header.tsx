"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function StickyHeader({ 
  collections, 
  tags 
}: { 
  collections: string[]; 
  tags: string[] 
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentCollection = searchParams.get("collection");
  const currentTag = searchParams.get("tag");

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  if (collections.length === 0 && tags.length === 0) return null;

  return (
    <div className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
        {/* Collections */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collections:</span>
          {collections.map((collection) => (
            <Badge
              key={collection}
              variant={currentCollection === collection ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFilter("collection", currentCollection === collection ? null : collection)}
            >
              {collection}
            </Badge>
          ))}
        </div>

        <div className="h-4 w-px bg-border hidden sm:block" />

        {/* Tags */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tags:</span>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={currentTag === tag ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap"
              onClick={() => setFilter("tag", currentTag === tag ? null : tag)}
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {(currentCollection || currentTag) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={clearFilters}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
