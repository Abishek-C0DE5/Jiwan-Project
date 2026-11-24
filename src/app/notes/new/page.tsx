import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteEditorForm } from "@/components/notes/NoteEditorForm";

async function NewNoteContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/auth/login?redirectTo=/notes/new");
  }
  if (profile?.is_suspended) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create a Study Note</CardTitle>
        <CardDescription>
          Write clear, structured notes with headings and bullet points, then
          publish publicly or keep them private.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <NoteEditorForm userId={user.id} />
      </CardContent>
    </Card>
  );
}

export default function NewNotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <NewNoteContent />
      </Suspense>
    </div>
  );
}
