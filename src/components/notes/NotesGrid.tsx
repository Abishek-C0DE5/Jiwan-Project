"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudyNote } from "@/types/database";

const PAGE_SIZE = 12;

interface NotesGridProps {
  initialNotes: StudyNote[];
  initialHasMore: boolean;
  filters: {
    q?: string;
    level?: string;
    type?: string;
  };
}

export function NotesGrid({
  initialNotes,
  initialHasMore,
  filters,
}: NotesGridProps) {
  const [notes, setNotes] = useState<StudyNote[]>(initialNotes);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    try {
      const supabase = createClient();
      const from = notes.length;
      const to = from + PAGE_SIZE;

      let query = supabase
        .from("notes")
        .select("*")
        .eq("status", "active")
        .eq("visibility", "public")
        .order("created_at", { ascending: false });

      if (filters.q) {
        const term = filters.q.trim();
        query = query.or(
          `title.ilike.%${term}%,subject.ilike.%${term}%,topic.ilike.%${term}%`
        );
      }
      if (filters.level) {
        query = query.eq("education_level", filters.level);
      }
      if (filters.type === "created" || filters.type === "pdf") {
        query = query.eq("note_type", filters.type);
      }

      const { data } = await query.range(from, to);
      const nextRows = (data as StudyNote[]) || [];
      setHasMore(nextRows.length > PAGE_SIZE);
      setNotes((prev) => [...prev, ...nextRows.slice(0, PAGE_SIZE)]);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {notes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`} className="group">
            <Card className="h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5 flex h-full flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant={note.note_type === "pdf" ? "warning" : "default"}
                    >
                      {note.note_type === "pdf" ? "PDF Document" : "Written Note"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {note.subject} &middot; {note.education_level}
                    {note.topic ? ` · ${note.topic}` : ""}
                  </p>
                  {note.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {note.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs text-muted-foreground">
                  <span>
                    {note.note_type === "pdf"
                      ? formatFileSize(note.file_size)
                      : "Formatted note"}
                  </span>
                  <span className="font-semibold text-primary group-hover:underline">
                    Open &rarr;
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {loadingMore &&
          [1, 2, 3, 4].map((i) => (
            <div
              key={`sk-${i}`}
              className="rounded-xl border border-border bg-card p-5 space-y-3"
            >
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "Loading more notes..." : "Load More Notes"}
          </Button>
        </div>
      )}
    </div>
  );
}
