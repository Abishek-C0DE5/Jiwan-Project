import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Download, FileText, Lock } from "lucide-react";
import {
  createClient,
  getCurrentUserWithProfile,
} from "@/lib/supabase/server";
import { formatDate, formatFileSize } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteContentRenderer } from "@/components/notes/NoteContentRenderer";
import { NoteDetailActions } from "@/components/notes/NoteDetailActions";
import type { PublicProfile, StudyNote } from "@/types/database";

async function NoteDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;

  const supabase = await createClient();
  const { user } = await getCurrentUserWithProfile();

  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single<StudyNote>();

  if (!note) {
    notFound();
  }

  const { data: author } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", note.author_id)
    .single<PublicProfile>();

  return (
    <div className="space-y-6">
      <Link
        href="/notes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Study Notes
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={note.note_type === "pdf" ? "warning" : "default"}>
            {note.note_type === "pdf" ? "PDF Document" : "Written Note"}
          </Badge>
          <Badge variant="outline">{note.subject}</Badge>
          <Badge variant="outline">{note.education_level}</Badge>
          {note.topic && <Badge variant="muted">{note.topic}</Badge>}
          {note.visibility === "private" && (
            <Badge variant="muted" className="gap-1">
              <Lock className="h-3 w-3" /> Private
            </Badge>
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          {note.title}
        </h1>

        {note.description && (
          <p className="text-sm text-muted-foreground">{note.description}</p>
        )}

        <div className="flex flex-col gap-4 pt-3 border-t border-border sm:flex-row sm:items-center sm:justify-between">
          {author && (
            <Link
              href={`/profile/${author.id}`}
              className="flex items-center gap-2.5 group"
            >
              <Avatar src={author.avatar_url} name={author.full_name} size="sm" />
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary">
                  {author.full_name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(note.created_at)}
                </p>
              </div>
            </Link>
          )}

          <NoteDetailActions
            noteId={note.id}
            authorId={note.author_id}
            noteType={note.note_type}
            currentUserId={user?.id || null}
          />
        </div>
      </div>

      {/* Note Body or PDF Preview */}
      {note.note_type === "created" ? (
        <Card>
          <CardContent className="p-6">
            {note.content ? (
              <NoteContentRenderer content={note.content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                This note has no content.
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {note.file_name || "study-note.pdf"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF &middot; {formatFileSize(note.file_size)}
                  </p>
                </div>
              </div>
              <a href={`/api/notes/${note.id}/file?download=1`}>
                <Button size="sm">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </a>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-muted">
              <iframe
                src={`/api/notes/${note.id}/file`}
                title={note.title}
                className="h-[640px] w-full bg-white"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
      <Suspense fallback={<Skeleton className="h-[540px] w-full" />}>
        <NoteDetailContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
