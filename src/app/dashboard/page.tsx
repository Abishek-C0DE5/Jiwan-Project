import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type {
  BookListing,
  Inquiry,
  SavedBook,
  StudyNote,
} from "@/types/database";

async function DashboardContent() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Configure Supabase in <code>.env.local</code> to access your student
        dashboard.
      </div>
    );
  }

  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const supabase = await createClient();

  const [
    { data: myBooks },
    { data: myNotes },
    { data: savedBooks },
    { data: receivedInquiries },
    { data: sentInquiries },
  ] = await Promise.all([
    supabase
      .from("book_listings")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("notes")
      .select("*")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("saved_books")
      .select("*, book:book_listings(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select(
        "*, book:book_listings(id, title, price_npr, status, images), sender:public_profiles!inquiries_sender_id_fkey(*)"
      )
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select(
        "*, book:book_listings(id, title, price_npr, status, images), receiver:public_profiles!inquiries_receiver_id_fkey(*)"
      )
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <DashboardClient
      profile={profile}
      myBooks={(myBooks as BookListing[]) || []}
      myNotes={(myNotes as StudyNote[]) || []}
      savedBooks={(savedBooks as SavedBook[]) || []}
      receivedInquiries={(receivedInquiries as Inquiry[]) || []}
      sentInquiries={(sentInquiries as Inquiry[]) || []}
    />
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<Skeleton className="h-[560px] w-full" />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
