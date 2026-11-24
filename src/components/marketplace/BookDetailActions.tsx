"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Flag,
  Heart,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inquirySchema, reportSchema } from "@/lib/validations/schemas";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

interface BookDetailActionsProps {
  bookId: string;
  sellerId: string;
  status: "available" | "sold" | "removed";
  currentUserId: string | null;
  initialSaved: boolean;
}

export function BookDetailActions({
  bookId,
  sellerId,
  status,
  currentUserId,
  initialSaved,
}: BookDetailActionsProps) {
  const router = useRouter();
  const isOwner = currentUserId === sellerId;

  const [saved, setSaved] = useState(initialSaved);
  const [savingFav, setSavingFav] = useState(false);

  const [message, setMessage] = useState("");
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquiryFeedback, setInquiryFeedback] = useState<{
    type: "success" | "destructive";
    text: string;
  } | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("Misleading information");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  async function toggleSaved() {
    if (!currentUserId) {
      router.push(`/auth/login?redirectTo=/books/${bookId}`);
      return;
    }
    setSavingFav(true);
    try {
      const supabase = createClient();
      if (saved) {
        await supabase
          .from("saved_books")
          .delete()
          .eq("user_id", currentUserId)
          .eq("book_id", bookId);
        setSaved(false);
      } else {
        await supabase.from("saved_books").insert({
          user_id: currentUserId,
          book_id: bookId,
        });
        setSaved(true);
      }
    } finally {
      setSavingFav(false);
    }
  }

  async function handleInquiry(e: React.FormEvent) {
    e.preventDefault();
    setInquiryFeedback(null);

    if (!currentUserId) {
      router.push(`/auth/login?redirectTo=/books/${bookId}`);
      return;
    }

    const parsed = inquirySchema.safeParse({ book_id: bookId, message });
    if (!parsed.success) {
      setInquiryFeedback({
        type: "destructive",
        text: parsed.error.issues[0]?.message || "Invalid message.",
      });
      return;
    }

    setSendingInquiry(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert({
        book_id: bookId,
        sender_id: currentUserId,
        receiver_id: sellerId,
        message: parsed.data.message,
      });

      if (error) {
        setInquiryFeedback({ type: "destructive", text: error.message });
        return;
      }

      setMessage("");
      setInquiryFeedback({
        type: "success",
        text: "Inquiry sent! Check your Dashboard > Sent Inquiries for replies.",
      });
    } finally {
      setSendingInquiry(false);
    }
  }

  async function handleToggleSold() {
    setUpdatingStatus(true);
    try {
      const supabase = createClient();
      const nextStatus = status === "sold" ? "available" : "sold";
      await supabase
        .from("book_listings")
        .update({ status: nextStatus })
        .eq("id", bookId);
      router.refresh();
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this book listing?")) {
      return;
    }
    setDeleting(true);
    try {
      const supabase = createClient();
      await supabase.from("book_listings").delete().eq("id", bookId);
      router.push("/marketplace");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      router.push(`/auth/login?redirectTo=/books/${bookId}`);
      return;
    }

    const parsed = reportSchema.safeParse({
      target_type: "book",
      target_id: bookId,
      reason: reportReason,
      details: reportDetails,
    });
    if (!parsed.success) return;

    setReporting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("reports").insert({
        reporter_id: currentUserId,
        target_type: "book",
        target_id: bookId,
        reason: parsed.data.reason,
        details: parsed.data.details || null,
      });
      if (!error) {
        setReportFeedback("Report submitted. Thank you for keeping our community safe.");
        setReportDetails("");
        setShowReport(false);
      }
    } finally {
      setReporting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Owner Controls */}
      {isOwner ? (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold">Manage your listing</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/books/${bookId}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-4 w-4" />
                Edit Listing
              </Button>
            </Link>
            <Button
              variant={status === "sold" ? "secondary" : "default"}
              size="sm"
              onClick={handleToggleSold}
              disabled={updatingStatus}
            >
              <CheckCircle2 className="h-4 w-4" />
              {status === "sold" ? "Mark as Available" : "Mark as Sold"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Save + Report Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={saved ? "secondary" : "outline"}
              onClick={toggleSaved}
              disabled={savingFav}
              className="flex-1"
            >
              <Heart
                className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
              />
              {saved ? "Saved to Favourites" : "Save Book"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowReport((p) => !p)}
              title="Report listing"
              aria-label="Report listing"
            >
              <Flag className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>

          {reportFeedback && <Alert variant="success">{reportFeedback}</Alert>}

          {showReport && (
            <form
              onSubmit={handleReport}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <p className="text-sm font-semibold">Report this listing</p>
              <Select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              >
                <option value="Misleading information">
                  Misleading information
                </option>
                <option value="Spam or duplicate">Spam or duplicate</option>
                <option value="Inappropriate content">
                  Inappropriate content
                </option>
                <option value="Suspected scam">Suspected scam</option>
              </Select>
              <Textarea
                rows={2}
                placeholder="Optional details..."
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
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

          {/* Inquiry Form */}
          {status === "available" ? (
            <form
              onSubmit={handleInquiry}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <p className="text-sm font-semibold">Contact Seller</p>
              <p className="text-xs text-muted-foreground">
                Send a message to ask about book condition or arrange a campus
                meetup. Private contact details stay protected.
              </p>
              {inquiryFeedback && (
                <Alert variant={inquiryFeedback.type}>
                  {inquiryFeedback.text}
                </Alert>
              )}
              <Textarea
                rows={3}
                placeholder="Hi! Is this book still available? Can we meet near campus?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="w-full"
                disabled={sendingInquiry}
              >
                <Send className="h-4 w-4" />
                {sendingInquiry ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          ) : (
            <Alert variant="warning">
              This book has been marked as <strong>Sold</strong> and is no
              longer accepting new inquiries.
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
