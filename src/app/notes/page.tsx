import { Suspense } from "react";
import Link from "next/link";
import { FileText, FileUp, PenSquare, Search } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { EDUCATION_LEVELS, formatDate, formatFileSize } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudyNote } from "@/types/database";

interface NotesSearchParams {
  q?: string;
  level?: string;
  type?: string;
}

async function NotesContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<NotesSearchParams>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Configure Supabase in <code>.env.local</code> to browse and share
        study notes.
      </div>
    );
  }

  const params = await searchParamsPromise;
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select("*")
    .eq("status", "active")
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (params.q) {
    const term = params.q.trim();
    query = query.or(
      `title.ilike.%${term}%,subject.ilike.%${term}%,topic.ilike.%${term}%`
    );
  }

  if (params.level) {
    query = query.eq("education_level", params.level);
  }

  if (params.type === "created" || params.type === "pdf") {
    query = query.eq("note_type", params.type);
  }

  const { data: notes, error } = await query.limit(48);

  return (
    <div className="space-y-6">
      <form
        action="/notes"
        method="GET"
        className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4"
      >
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search by title, subject, or topic..."
            className="pl-9"
          />
        </div>

        <Select name="level" defaultValue={params.level || ""}>
          <option value="">All Levels</option>
          {EDUCATION_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Select name="type" defaultValue={params.type || ""}>
            <option value="">All Formats</option>
            <option value="created">Written Notes</option>
            <option value="pdf">PDF Documents</option>
          </Select>
          <Button type="submit">Filter</Button>
        </div>
      </form>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Failed to load study notes: {error.message}
        </div>
      ) : !notes || notes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">No study notes found</p>
          <p className="text-sm text-muted-foreground">
            Create your first note or upload a helpful PDF summary.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(notes as StudyNote[]).map((note) => (
            <Link key={note.id} href={`/notes/${note.id}`} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="p-5 flex h-full flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          note.note_type === "pdf" ? "warning" : "default"
                        }
                      >
                        {note.note_type === "pdf" ? "PDF Document" : "Written Note"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.created_at)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary">
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
                    <span className="font-medium text-primary group-hover:underline">
                      Open &rarr;
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NotesPage({
  searchParams,
}: {
  searchParams: Promise<NotesSearchParams>;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Study Notes
          </h1>
          <p className="text-sm text-muted-foreground">
            Read student-written summaries or download shared PDF study guides.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/notes/new">
            <Button>
              <PenSquare className="h-4 w-4" />
              Create Note
            </Button>
          </Link>
          <Link href="/notes/upload">
            <Button variant="outline">
              <FileUp className="h-4 w-4" />
              Upload PDF
            </Button>
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        }
      >
        <NotesContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
