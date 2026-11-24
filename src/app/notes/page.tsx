import { Suspense } from "react";
import Link from "next/link";
import { Check, FileText, FileUp, PenSquare, Search } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { EDUCATION_LEVELS } from "@/lib/utils/format";
import { DEMO_NOTES } from "@/lib/data/demo";
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

function NotesFilterBar({ params }: { params: NotesSearchParams }) {
  const buildTypeHref = (typeVal: string) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set("q", params.q);
    if (params.level) sp.set("level", params.level);
    if (typeVal) sp.set("type", typeVal);
    const qs = sp.toString();
    return qs ? `/notes?${qs}` : "/notes";
  };

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
      <form
        action="/notes"
        method="GET"
        className="grid grid-cols-1 gap-3 sm:grid-cols-12"
      >
        {params.type && <input type="hidden" name="type" value={params.type} />}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={params.q || ""}
            placeholder="Search notes by title, subject, or topic..."
            className="pl-10 h-11"
          />
        </div>

        <div className="sm:col-span-4">
          <Select
            name="level"
            defaultValue={params.level || ""}
            className="h-11"
          >
            <option value="">All Education Levels</option>
            {EDUCATION_LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
          </Select>
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" className="w-full h-11">
            Search
          </Button>
        </div>
      </form>

      {/* Distinct Active vs Inactive Format Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={buildTypeHref("")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            !params.type
              ? "bg-[#065f46] text-white shadow-sm"
              : "bg-[#e6f4ec] text-[#064e3b] hover:bg-[#d1ebdc]"
          }`}
        >
          {!params.type && <Check className="h-3.5 w-3.5" />}
          All Formats
        </Link>
        <Link
          href={buildTypeHref("created")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            params.type === "created"
              ? "bg-[#065f46] text-white shadow-sm"
              : "bg-[#e6f4ec] text-[#064e3b] hover:bg-[#d1ebdc]"
          }`}
        >
          {params.type === "created" && <Check className="h-3.5 w-3.5" />}
          Written Notes
        </Link>
        <Link
          href={buildTypeHref("pdf")}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            params.type === "pdf"
              ? "bg-[#b45309] text-white shadow-sm"
              : "bg-amber-100 text-amber-900 hover:bg-amber-200/80"
          }`}
        >
          {params.type === "pdf" && <Check className="h-3.5 w-3.5" />}
          PDF Documents
        </Link>
      </div>
    </div>
  );
}

async function NotesContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<NotesSearchParams>;
}) {
  const params = await searchParamsPromise;

  if (!isSupabaseConfigured()) {
    let filtered = [...DEMO_NOTES];
    if (params.q) {
      const q = params.q.trim().toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q) ||
          (n.topic || "").toLowerCase().includes(q)
      );
    }
    if (params.level) {
      filtered = filtered.filter((n) => n.education_level === params.level);
    }
    if (params.type === "created" || params.type === "pdf") {
      filtered = filtered.filter((n) => n.note_type === params.type);
    }

    return (
      <div className="space-y-6">
        <NotesFilterBar params={params} />
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
            <p className="font-medium text-foreground">No matching notes found</p>
          </div>
        ) : (
          <NotesGrid
            key={JSON.stringify(params)}
            initialNotes={filtered}
            initialHasMore={false}
            filters={params}
          />
        )}
      </div>
    );
  }

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
      <NotesFilterBar params={params} />

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
            <Skeleton className="h-28 w-full" />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 space-y-3"
                >
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-6 w-4/5" />
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
