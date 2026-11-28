import { Suspense } from "react";
import { redirect } from "next/navigation";
import {
  createClient,
  getCurrentUserWithProfile,
} from "@/lib/supabase/server";
import { DEFAULT_NOTICES } from "@/lib/constants/notices";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminModerationClient } from "@/components/admin/AdminModerationClient";
import type { Report } from "@/types/database";

async function AdminContent() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/auth/login?redirectTo=/admin");
  }

  // Server-side role enforcement
  if (profile.role !== "admin" || profile.is_suspended) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Only fetch the initial Reports tab + lightweight head counts; other tabs lazy/background load
  const [
    { data: reports },
    { count: totalUsers },
    { count: activeBooks },
    { count: activeNotes },
  ] = await Promise.all([
    supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25),
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

  return (
    <AdminModerationClient
      adminId={user.id}
      adminEmail={profile.email}
      reports={(reports as Report[]) || []}
      initialCounts={{
        totalUsers: totalUsers ?? 0,
        activeBooks: activeBooks ?? 0,
        activeNotes: activeNotes ?? 0,
      }}
      notices={DEFAULT_NOTICES}
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
