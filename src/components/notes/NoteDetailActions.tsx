"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flag, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { reportSchema } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

interface NoteDetailActionsProps {
  noteId: string;
  authorId: string;
  noteType: "created" | "pdf";
  currentUserId: string | null;
}

export function NoteDetailActions({
  noteId,
  authorId,
  noteType,
  currentUserId,
}: NoteDetailActionsProps) {
  const router = useRouter();
  const isOwner = currentUserId === authorId;

  const [deleting, setDeleting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState("Copyrighted or pirated material");
  const [details, setDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this study note?")) {
      return;
    }
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("notes").delete().eq("id", noteId);
      router.push("/notes");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/auth/login?redirectTo=/notes/${noteId}`);
      return;
    }

    const parsed = reportSchema.safeParse({
      target_type: "note",
      target_id: noteId,
      reason,
      details,
    });
    if (!parsed.success) return;

    setReporting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("reports").insert({
        reporter_id: currentUserId,
        target_type: "note",
        target_id: noteId,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
      });

      if (!error) {
        setReportFeedback(
          "Report submitted. An admin will review this study note."
        );
        setDetails("");
        setShowReport(false);
      }
    } finally {
      setReporting(false);
    }
  }

  return (
    <div className="space-y-3">
      {isOwner ? (
        <div className="flex flex-wrap gap-2">
          {noteType === "created" && (
            <Link href={`/notes/${noteId}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit Note
              </Button>
            </Link>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete Note"}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReport((p) => !p)}
          >
            <Flag className="h-4 w-4" />
            Report Copyright / Inappropriate Content
          </Button>

          {reportFeedback && <Alert variant="success">{reportFeedback}</Alert>}

          {showReport && (
            <form
              onSubmit={handleReport}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <p className="text-sm font-semibold">Report this note</p>
              <Select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Copyrighted or pirated material">
                  Copyrighted or pirated material
                </option>
                <option value="Inappropriate or harmful content">
                  Inappropriate or harmful content
                </option>
                <option value="Spam or unreadable file">
                  Spam or unreadable file
                </option>
              </Select>
              <Textarea
                rows={2}
                placeholder="Optional details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={reporting}>
                  {reporting ? "Submitting..." : "Submit Report"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowReport(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
