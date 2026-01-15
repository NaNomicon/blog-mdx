"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Check, ChevronsUpDown, X, Calendar as CalendarIcon, ArrowDownWideNarrow, ArrowUpWideNarrow, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

export function NotesFilter({ 
  collections, 
  tags,
  hideCollection = false
}: { 
  collections: string[]; 
  tags: string[];
  hideCollection?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [openTags, setOpenTags] = React.useState(false);
  const [openDate, setOpenDate] = React.useState(false);

  // Sync mounted state to avoid hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentCollection = searchParams.get("collection") || "all";
  const currentSort = (searchParams.get("sort") as "asc" | "desc") || "desc";
  const currentLayout = (searchParams.get("view") as "masonry" | "list") || "masonry";
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  
  const dateRange: DateRange | undefined = React.useMemo(() => {
    if (!fromParam && !toParam) return undefined;
    return {
      from: fromParam ? new Date(fromParam) : undefined,
      to: toParam ? new Date(toParam) : undefined,
    };
  }, [fromParam, toParam]);

  const currentTags = React.useMemo(() => {
    const tagParam = searchParams.get("tag");
    return tagParam ? tagParam.split(",") : [];
  }, [searchParams]);

  const setFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const setDateRange = (range: DateRange | undefined) => {
    const params = new URLSearchParams(searchParams.toString());
    if (range?.from) {
      params.set("from", format(range.from, "yyyy-MM-dd"));
    } else {
      params.delete("from");
    }
    
    if (range?.to) {
      params.set("to", format(range.to, "yyyy-MM-dd"));
    } else {
      params.delete("to");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleSort = () => {
    const nextSort = currentSort === "desc" ? "asc" : "desc";
    setFilter("sort", nextSort);
  };

  const toggleLayout = () => {
    const nextLayout = currentLayout === "masonry" ? "list" : "masonry";
    setFilter("view", nextLayout);
  };

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    
    if (newTags.length > 0) {
      params.set("tag", newTags.join(","));
    } else {
      params.delete("tag");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.push(pathname, { scroll: false });
  };

  if (!mounted) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-4 py-4 min-h-[72px]">
        <div className="h-10 w-[120px] bg-muted/20 animate-pulse rounded-md" />
        <div className="h-10 w-[150px] bg-muted/20 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3 py-2 relative">
        {/* Collection Select */}
        {!hideCollection && (
          <div className="flex items-center gap-2">
            <Select
              value={currentCollection}
              onValueChange={(value) => setFilter("collection", value)}
            >
              <SelectTrigger className="h-10 w-[160px] bg-background">
                <SelectValue placeholder="Collection" />
              </SelectTrigger>
              <SelectContent className="z-40">
                <SelectItem value="all">All Collections</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tags Multi-Select */}
        <div className="flex items-center gap-2">
          <Popover open={openTags} onOpenChange={setOpenTags}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openTags}
                className="h-10 w-[180px] justify-between bg-background font-normal"
              >
                <span className="truncate text-xs uppercase tracking-wider font-medium">
                  {currentTags.length > 0
                    ? `${currentTags.length} Tags`
                    : "Filter Tags"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0 z-40" align="end">
              <Command>
                <CommandInput placeholder="Search tags..." />
                <CommandList>
                  <CommandEmpty>No tag found.</CommandEmpty>
                  <CommandGroup>
                    {tags.map((tag) => (
                      <CommandItem
                        key={tag}
                        value={tag}
                        onSelect={() => {
                          toggleTag(tag);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            currentTags.includes(tag) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tag}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Date Range Picker */}
        <div className="flex items-center gap-2">
          <Popover open={openDate} onOpenChange={setOpenDate}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "h-10 w-[220px] justify-start text-left font-normal bg-background",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                <span className="text-xs uppercase tracking-wider font-medium truncate">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-40" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Sort Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 bg-background border-dashed"
          onClick={toggleSort}
          title={currentSort === "desc" ? "Newest first" : "Oldest first"}
        >
          {currentSort === "desc" ? (
            <ArrowDownWideNarrow className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <ArrowUpWideNarrow className="h-4 w-4 mr-2 text-primary" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider">
            {currentSort === "desc" ? "Newest" : "Oldest"}
          </span>
        </Button>

        {/* Layout Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-3 bg-background border-dashed"
          onClick={toggleLayout}
          title={currentLayout === "masonry" ? "Switch to list view" : "Switch to masonry view"}
        >
          {currentLayout === "masonry" ? (
            <LayoutGrid className="h-4 w-4 mr-2 text-primary" />
          ) : (
            <List className="h-4 w-4 mr-2 text-primary" />
          )}
          <span className="text-xs font-medium uppercase tracking-wider">
            {currentLayout === "masonry" ? "Masonry" : "List"}
          </span>
        </Button>

        {(currentCollection !== "all" || currentTags.length > 0 || dateRange || currentSort !== "desc" || currentLayout !== "masonry") && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-10 px-3 text-xs uppercase tracking-widest hover:bg-destructive/10 hover:text-destructive transition-colors font-bold"
            onClick={clearFilters}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      {(currentTags.length > 0 || dateRange) && (
        <div className="flex flex-wrap gap-2 items-center justify-end w-full">
          {currentTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1 px-2 bg-primary/5 hover:bg-primary/10 transition-colors border-none text-[10px] font-bold uppercase tracking-widest text-primary">
              #{tag}
              <button 
                className="ml-1 rounded-full outline-none focus:ring-1 focus:ring-ring"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleTag(tag);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-primary" />
              </button>
            </Badge>
          ))}
          {dateRange?.from && (
            <Badge variant="secondary" className="flex items-center gap-1 py-1 px-2 bg-primary/5 hover:bg-primary/10 transition-colors border-none text-[10px] font-bold uppercase tracking-widest text-primary">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {format(dateRange.from, "MMM dd")} 
              {dateRange.to ? ` - ${format(dateRange.to, "MMM dd")}` : ""}
              <button 
                className="ml-1 rounded-full outline-none focus:ring-1 focus:ring-ring"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDateRange(undefined);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-primary" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
