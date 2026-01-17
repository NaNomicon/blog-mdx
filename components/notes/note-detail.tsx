import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { format } from "date-fns";
import { type Post, type NoteMetadata } from "@/lib/content";
import { Calendar, Folder, Tag, ExternalLink, Book, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShareNote } from "./share-note";

export function NoteDetail({ 
  note,
  prev,
  next
}: { 
  note: Post<NoteMetadata>;
  prev?: Post<NoteMetadata> | null;
  next?: Post<NoteMetadata> | null;
}) {
  const { slug, type, metadata } = note;
  const { title, publishDate, collection, tags, category, source_url, book_title } = metadata;

  const MDXContent = dynamic(() => import(`@/content/${type}/${slug}.mdx`), {
    loading: () => <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-full"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  });

  const formattedDate = format(new Date(publishDate), "MMMM dd, yyyy");

  return (
    <article className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="space-y-4 border-b pb-6 md:pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={publishDate}>{formattedDate}</time>
            </div>
            {collection && (
              <div className="flex items-center gap-1.5 font-medium text-primary">
                <Folder className="h-4 w-4" />
                <span>{collection}</span>
              </div>
            )}
            {category && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider px-2 py-0">
                {category}
              </Badge>
            )}
          </div>
          <ShareNote slug={slug} />
        </div>

        <h1 className="text-2xl md:text-4xl font-medium leading-tight">
          {title}
        </h1>

        {/* Links or Book Info */}
        <div className="flex flex-wrap gap-3 md:gap-4 pt-2">
          {source_url && (
            <a 
              href={source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Source URL
            </a>
          )}
          {book_title && (
            <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Book className="h-4 w-4" />
              <span>Book: {book_title}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-neutral dark:prose-invert max-w-none min-h-[100px] text-sm md:text-base">
        <MDXContent />
      </div>

      {/* Footer / Tags & Nav */}
      <div className="space-y-6 md:space-y-8 pt-6 md:pt-8 border-t">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                <Tag className="h-3 w-3" />
                <span>{tag}</span>
              </div>
            ))}
          </div>
        )}

        {/* Prev/Next Navigation */}
        {(prev || next) && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-dashed">
            {prev ? (
              <Button variant="ghost" asChild className="pl-2 hover:bg-primary/10 hover:text-primary transition-all group justify-start h-auto py-3">
                <Link href={`/notes/${prev.slug}`} scroll={false} className="flex items-center gap-2">
                  <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] uppercase text-muted-foreground">Previous</span>
                    <span className="text-xs md:text-sm font-medium line-clamp-1 max-w-[200px] sm:max-w-[150px]">{prev.metadata.title}</span>
                  </div>
                </Link>
              </Button>
            ) : <div className="hidden sm:block" />}

            {next ? (
              <Button variant="ghost" asChild className="pr-2 hover:bg-primary/10 hover:text-primary transition-all group justify-end h-auto py-3">
                <Link href={`/notes/${next.slug}`} scroll={false} className="flex items-center gap-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase text-muted-foreground">Next</span>
                    <span className="text-xs md:text-sm font-medium line-clamp-1 max-w-[200px] sm:max-w-[150px]">{next.metadata.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : <div className="hidden sm:block" />}
          </div>
        )}
      </div>
    </article>
  );
}
