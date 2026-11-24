import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { BookListing } from "@/types/database";

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

  // Only load initial tab data (myBooks) + lightweight counts; other tabs lazy-load on click
  const [
    { data: myBooks },
    { count: publishedNotesCount },
  ] = await Promise.all([
    supabase
      .from("book_listings")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(24),
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("author_id", user.id)
      .eq("status", "active")
      .eq("visibility", "public"),
  ]);

  return (
    <DashboardClient
      profile={profile}
      initialBooks={(myBooks as BookListing[]) || []}
      publishedNotesCount={publishedNotesCount ?? 0}
    />
  );
}

export default function DashboardPage() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-72 w-full" />
          </div>
        }
      >
        <DashboardContent />
      </Suspense>
    </div>
  );
}
