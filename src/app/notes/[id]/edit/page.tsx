import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient, getCurrentUserWithProfile } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditorForm } from "@/components/notes/NoteEditorForm";
import type { StudyNote } from "@/types/database";

async function EditNoteContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  const { id } = await paramsPromise;
  const { user } = await getCurrentUserWithProfile();
  if (!user) {
    redirect(`/auth/login?redirectTo=/notes/${id}/edit`);
  }

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single<StudyNote>();

  if (!note) notFound();
  if (note.author_id !== user.id || note.note_type !== "created") {
    redirect(`/notes/${id}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Edit Study Note</CardTitle>
        <CardDescription>
          Update your note content, subject, or visibility.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NoteEditorForm userId={user.id} initialData={note} />
      </CardContent>
    </Card>
  );
}

export default function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <EditNoteContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
