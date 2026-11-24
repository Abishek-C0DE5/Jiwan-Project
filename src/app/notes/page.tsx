import { Suspense } from "react";
import Link from "next/link";
import { FileText, FileUp, PenSquare, Search } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { EDUCATION_LEVELS } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { NotesGrid } from "@/components/notes/NotesGrid";
import type { StudyNote } from "@/types/database";

const INITIAL_PAGE_SIZE = 12;

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

  const { data: notes, error } = await query.range(0, INITIAL_PAGE_SIZE);
  const rows = (notes as StudyNote[]) || [];
  const hasMore = rows.length > INITIAL_PAGE_SIZE;
  const initialNotes = rows.slice(0, INITIAL_PAGE_SIZE);

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
      ) : initialNotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">No study notes found</p>
          <p className="text-sm text-muted-foreground">
            Create your first note or upload a helpful PDF summary.
          </p>
        </div>
      ) : (
        <NotesGrid
          key={JSON.stringify(params)}
          initialNotes={initialNotes}
          initialHasMore={hasMore}
          filters={params}
        />
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
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Study Notes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Read student-written summaries or download shared PDF study guides.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/notes/new">
            <Button size="lg">
              <PenSquare className="h-4 w-4" />
              Create Note
            </Button>
          </Link>
          <Link href="/notes/upload">
            <Button variant="outline" size="lg">
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-5 space-y-3"
                >
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-4/5" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
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
