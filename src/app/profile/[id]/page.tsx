import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCap, MapPin } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard } from "@/components/marketplace/BookCard";
import type { BookListing, PublicProfile, StudyNote } from "@/types/database";

async function PublicProfileContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Supabase is not configured yet.
      </div>
    );
  }

  const { id } = await paramsPromise;
  const supabase = await createClient();

  // Always query public_profiles view so private email/flags are never exposed
  const { data: profile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", id)
    .single<PublicProfile>();

  if (!profile) {
    notFound();
  }

  const [{ data: books }, { data: notes }] = await Promise.all([
    supabase
      .from("book_listings")
      .select("*, category:categories(*)")
      .eq("seller_id", id)
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("notes")
      .select("*")
      .eq("author_id", id)
      .eq("status", "active")
      .eq("visibility", "public")
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-foreground">
              {profile.full_name}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              {profile.institution && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-4 w-4" />
                  {profile.institution}
                </span>
              )}
              {profile.education_level && (
                <Badge variant="outline">{profile.education_level}</Badge>
              )}
              {profile.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Member since {formatDate(profile.created_at)}
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Books Listed ({books?.length || 0})
        </h2>
        {!books || books.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No active book listings from this student.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(books as BookListing[]).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">
          Shared Study Notes ({notes?.length || 0})
        </h2>
        {!notes || notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No public study notes shared yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(notes as StudyNote[]).map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-1.5">
                    <Badge variant={note.note_type === "pdf" ? "warning" : "default"}>
                      {note.note_type === "pdf" ? "PDF" : "Note"}
                    </Badge>
                    <p className="font-semibold text-foreground line-clamp-1">
                      {note.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {note.subject} &middot; {note.education_level}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
      <Suspense fallback={<Skeleton className="h-[480px] w-full" />}>
        <PublicProfileContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
