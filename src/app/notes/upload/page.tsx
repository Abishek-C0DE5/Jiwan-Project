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
import { PdfUploadForm } from "@/components/notes/PdfUploadForm";

async function UploadNoteContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user) {
    redirect("/auth/login?redirectTo=/notes/upload");
  }
  if (profile?.is_suspended) {
    redirect("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Upload PDF Study Note</CardTitle>
        <CardDescription>
          Share original notes or permitted study handouts in PDF format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PdfUploadForm />
      </CardContent>
    </Card>
  );
}

export default function UploadNotePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <UploadNoteContent />
      </Suspense>
    </div>
  );
}
