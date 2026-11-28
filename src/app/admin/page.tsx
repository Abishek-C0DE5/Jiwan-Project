import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import {
  DEMO_ADMIN_USERS,
  DEMO_NOTICES,
  DEMO_REPORTS,
} from "@/lib/auth/demo";
import { DEMO_BOOKS, DEMO_NOTES } from "@/lib/data/demo";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminModerationClient } from "@/components/admin/AdminModerationClient";
import type { BookListing, Profile, Report, StudyNote } from "@/types/database";

async function AdminContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/auth/login?redirectTo=/admin");
  }

  // Server-side role enforcement
  if (profile.role !== "admin" || profile.is_suspended) {
    redirect("/dashboard");
  }

  if (!isSupabaseConfigured()) {
    return (
      <AdminModerationClient
        adminId={user.id}
        adminEmail={profile.email}
        isDemoMode={true}
        reports={DEMO_REPORTS}
        users={DEMO_ADMIN_USERS}
        books={DEMO_BOOKS}
        notes={DEMO_NOTES}
        notices={DEMO_NOTICES}
      />
    );
  }

  const supabase = await createClient();

  const [
    { data: reports },
    { data: users },
    { data: books },
    { data: notes },
  ] = await Promise.all([
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("book_listings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const reportList = (reports as Report[]) || [];

  return (
    <AdminModerationClient
      adminId={user.id}
      adminEmail={profile.email}
      isDemoMode={false}
      reports={reportList}
      users={(users as Profile[]) || []}
      books={(books as BookListing[]) || []}
      notes={(notes as StudyNote[]) || []}
      notices={DEMO_NOTICES}
    />
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-border pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#12434d]">
            Sushma Godawari Student Hub · Administration
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl mt-1">
            Admin Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage students, marketplace textbooks, study notes, college
            notices, and moderation reports.
          </p>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
