import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminModerationClient } from "@/components/admin/AdminModerationClient";
import type { Profile, Report } from "@/types/database";

async function AdminContent() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Supabase is not configured yet.
      </div>
    );
  }

  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/auth/login?redirectTo=/admin");
  }

  // Server-side role enforcement
  if (profile.role !== "admin" || profile.is_suspended) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  const [
    { data: reports },
    { data: users },
    { count: totalUsers },
    { count: activeBooks },
    { count: activeNotes },
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
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("book_listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "available"),
    supabase
      .from("notes")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const reportList = (reports as Report[]) || [];
  const pendingReports = reportList.filter((r) => r.status === "pending").length;

  return (
    <AdminModerationClient
      adminId={user.id}
      reports={reportList}
      users={(users as Profile[]) || []}
      stats={{
        totalUsers: totalUsers ?? 0,
        activeBooks: activeBooks ?? 0,
        activeNotes: activeNotes ?? 0,
        pendingReports,
      }}
    />
  );
}

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Moderation
        </h1>
        <p className="text-sm text-muted-foreground">
          Review reported listings and notes, remove unauthorized content, and
          manage accounts.
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <AdminContent />
      </Suspense>
    </div>
  );
}
