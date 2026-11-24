"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, Check, ExternalLink, ShieldAlert, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import type { Profile, Report } from "@/types/database";

interface AdminModerationClientProps {
  adminId: string;
  reports: Report[];
  users: Profile[];
  stats: {
    totalUsers: number;
    activeBooks: number;
    activeNotes: number;
    pendingReports: number;
  };
}

export function AdminModerationClient({
  adminId,
  reports,
  users,
  stats,
}: AdminModerationClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleRemoveTarget(report: Report) {
    setBusyId(report.id);
    setFeedback(null);
    try {
      const supabase = createClient();
      if (report.target_type === "book") {
        await supabase
          .from("book_listings")
          .update({ status: "removed" })
          .eq("id", report.target_id);
      } else {
        await supabase
          .from("notes")
          .update({ status: "removed" })
          .eq("id", report.target_id);
      }

      await supabase
        .from("reports")
        .update({ status: "action_taken", reviewed_by: adminId })
        .eq("id", report.id);

      setFeedback("Content removed and report marked as action taken.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDismissReport(reportId: string) {
    setBusyId(reportId);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase
        .from("reports")
        .update({ status: "dismissed", reviewed_by: adminId })
        .eq("id", reportId);
      setFeedback("Report dismissed.");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleSuspend(user: Profile) {
    if (user.id === adminId) return;
    setBusyId(user.id);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ is_suspended: !user.is_suspended })
        .eq("id", user.id);
      setFeedback(
        user.is_suspended
          ? `Unsuspended ${user.full_name}.`
          : `Suspended ${user.full_name}.`
      );
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Platform Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Available Books</p>
            <p className="text-2xl font-bold mt-1">{stats.activeBooks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Active Notes</p>
            <p className="text-2xl font-bold mt-1">{stats.activeNotes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Reports</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              {stats.pendingReports}
            </p>
          </CardContent>
        </Card>
      </div>

      {feedback && <Alert variant="success">{feedback}</Alert>}

      {/* Reported Content */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Reported Books &amp; Notes
        </h2>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No reports submitted yet.
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => {
            const targetHref =
              report.target_type === "book"
                ? `/books/${report.target_id}`
                : `/notes/${report.target_id}`;

            return (
              <Card key={report.id}>
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="uppercase">
                        {report.target_type}
                      </Badge>
                      <Badge
                        variant={
                          report.status === "pending"
                            ? "warning"
                            : report.status === "action_taken"
                            ? "destructive"
                            : "muted"
                        }
                      >
                        {report.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(report.created_at)}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{report.reason}</p>
                    {report.details && (
                      <p className="text-xs text-muted-foreground">
                        {report.details}
                      </p>
                    )}
                    <Link
                      href={targetHref}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Inspect reported item <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>

                  {report.status === "pending" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveTarget(report)}
                        disabled={busyId === report.id}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove Content
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDismissReport(report.id)}
                        disabled={busyId === report.id}
                      >
                        <Check className="h-4 w-4" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      {/* Account Moderation */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">User Accounts</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{u.full_name}</p>
                    <Badge variant="outline">{u.role}</Badge>
                    {u.is_suspended && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {u.email} &middot; Joined {formatDate(u.created_at)}
                  </p>
                </div>

                {u.id !== adminId && (
                  <Button
                    variant={u.is_suspended ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => handleToggleSuspend(u)}
                    disabled={busyId === u.id}
                  >
                    <Ban className="h-4 w-4" />
                    {u.is_suspended ? "Unsuspend" : "Suspend Account"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
