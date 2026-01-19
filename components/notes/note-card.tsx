import { memo, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { type Post, type NoteMetadata } from "@/lib/content";
import { Calendar, Tag, Folder, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EngagementStats } from "@/components/mdx/engagement-stats";
import { ViewTracker } from "@/components/mdx/view-tracker";
import { cn } from "@/lib/utils";

// Cache dynamic components globally to prevent re-loading on state changes
const mdxCache = new Map<string, React.ComponentType>();

function getMDXComponent(type: string, slug: string) {
  const key = `${type}:${slug}`;
  if (!mdxCache.has(key)) {
    mdxCache.set(
      key,
      dynamic(() => import(`@/content/${type}/${slug}.mdx`), {
        loading: () => <div className="h-20 bg-muted/20 rounded-md animate-pulse" />,
      })
    );
  }
  return mdxCache.get(key)!;
}

export const NoteCard = memo(function NoteCard({ 
  note, 
  layout = "masonry" 
}: { 
  note: Post<NoteMetadata>;
  layout?: "masonry" | "list";
}) {
    const { slug, type, metadata } = note;
  const { title, publishDate, collection, tags, category, spoiler } = metadata;
  const isSpoiler = spoiler === true;
  const isList = layout === "list";

  const MDXContent = getMDXComponent(type, slug);

  return (
    <div className={cn(
      "break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out fill-mode-both",
      isList ? "mb-0" : "mb-8"
    )}>
      <div className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        isList && "hover:-translate-y-0.5"
      )}>
        <div className={cn(
          "p-7 space-y-6",
          isList && "md:p-10 md:space-y-8"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <time dateTime={publishDate}>
                  {new Date(publishDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </div>
              <EngagementStats slug={slug} />
            </div>
            {collection && (
              <Link 
                href={`/notes/collection/${encodeURIComponent(collection)}`}
                className="flex items-center gap-1.5 text-primary/70 hover:text-primary transition-colors"
              >
                <Folder className="h-3.5 w-3.5" />
                <span>{collection}</span>
              </Link>
            )}
          </div>

          {/* Title & Link */}
          <div className="flex items-start justify-between gap-4">
            <Link href={`/notes/${slug}`} scroll={false} className="block group/title">
              <h3 className={cn(
                "font-semibold leading-tight tracking-tight group-hover/title:text-primary transition-colors",
                isList ? "text-3xl md:text-4xl" : "text-2xl"
              )}>
                {title}
              </h3>
            </Link>
            <Link 
              href={`/notes/${slug}`} 
              scroll={false}
              className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
              title="View full note"
            >
              <LinkIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Content Area with background */}
          <div className={cn(
            "relative rounded-lg bg-secondary/50 p-4 ring-1 ring-border/50",
            isList && "md:p-8"
          )}>
            <div className={cn(
              "prose prose-neutral dark:prose-invert max-w-none overflow-hidden",
              isList ? "prose-base md:prose-lg" : "prose-sm"
            )}>
              <MDXContent />
            </div>
          </div>

          {/* Footer */}
          {(category || (tags && tags.length > 0) || isSpoiler) && (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {category && (
                <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none">
                  {category}
                </Badge>
              )}
              {isSpoiler && (
                <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-500 border-none">
                  Spoiler
                </Badge>
              )}
              <div className="flex flex-wrap gap-2">
                {tags?.map((tag) => (
                  <div key={tag} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-default">
                    <Tag className="h-3 w-3 opacity-60" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <ViewTracker slug={slug} mode="scroll" />
      </div>
    </div>
  );
});
