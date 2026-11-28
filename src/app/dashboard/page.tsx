import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
} from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import type { BookListing } from "@/types/database";

async function DashboardContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/auth/login?redirectTo=/dashboard");
  }

  const supabase = await createClient();

  // Load initial tab data (first 12 books) + lightweight count; remaining tabs prefetch in background
  const [
    { data: myBooks },
    { count: publishedNotesCount },
  ] = await Promise.all([
    supabase
      .from("book_listings")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12),
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
