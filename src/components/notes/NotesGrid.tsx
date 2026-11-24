"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Calendar, FileText, Loader2, PenSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => {
          const isPdf = note.note_type === "pdf";
          return (
            <Link key={note.id} href={`/notes/${note.id}`} className="group">
              <Card className="h-full border-border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-6 flex h-full flex-col justify-between space-y-5">
                  <div className="space-y-3.5">
                    {/* Top row: Solid Filled Format Pill + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          isPdf ? "bg-[#b45309]" : "bg-[#065f46]"
                        }`}
                      >
                        {isPdf ? (
                          <FileText className="h-3.5 w-3.5" />
                        ) : (
                          <PenSquare className="h-3.5 w-3.5" />
                        )}
                        {isPdf ? "PDF Document" : "Written Note"}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-[#52665a]">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(note.created_at)}
                      </span>
                    </div>

                    {/* Subject & Level line (clean, no tag clutter) */}
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#147a4b]">
                      {note.subject} &middot; {note.education_level}
                    </p>

                    {/* Bold Title & Description */}
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-extrabold text-[#0c1b13] line-clamp-2 leading-snug group-hover:text-[#065f46] transition-colors">
                        {note.title}
                      </h3>
                      {note.description && (
                        <p className="text-sm text-[#52665a] line-clamp-2 leading-relaxed">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Clean Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-emerald-100">
                    <span className="text-xs font-medium text-[#52665a]">
                      {isPdf
                        ? `PDF · ${formatFileSize(note.file_size)}`
                        : note.topic || "Study Summary"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-[#065f46] group-hover:translate-x-0.5 transition-transform">
                      {isPdf ? "View PDF" : "Read Note"}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {loadingMore &&
          [1, 2, 3].map((i) => (
            <div
              key={`sk-${i}`}
              className="rounded-xl border border-border bg-card p-6 space-y-3"
            >
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-6 w-4/5" />
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
