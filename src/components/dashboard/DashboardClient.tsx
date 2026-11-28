"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Heart,
  Inbox,
  LogOut,
  MessageSquare,
  PenSquare,
  Plus,
  Send,
  Settings,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatFileSize, formatNPR } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileSettingsForm } from "./ProfileSettingsForm";
import type {
  BookListing,
  Inquiry,
  Profile,
  SavedBook,
  StudyNote,
} from "@/types/database";

type TabKey =
  | "books"
  | "uploaded_notes"
  | "created_notes"
  | "saved"
  | "received"
  | "sent"
  | "settings";

interface DashboardClientProps {
  profile: Profile;
  initialBooks: BookListing[];
  publishedNotesCount: number;
}

export function DashboardClient({
  profile,
  initialBooks,
  publishedNotesCount,
}: DashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("books");

  const [myBooks, setMyBooks] = useState<BookListing[]>(initialBooks);
  const [myNotes, setMyNotes] = useState<StudyNote[] | null>(null);
  const [savedBooks, setSavedBooks] = useState<SavedBook[] | null>(null);
  const [receivedInquiries, setReceivedInquiries] = useState<Inquiry[] | null>(
    null
  );
  const [sentInquiries, setSentInquiries] = useState<Inquiry[] | null>(null);
  const [tabLoading, setTabLoading] = useState(false);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fetchedTabsRef = useRef<Set<string>>(new Set());

  const activeBooksCount = myBooks.filter(
    (b) => b.status === "available"
  ).length;
  const soldBooksCount = myBooks.filter((b) => b.status === "sold").length;

  const loadTabData = useCallback(
    async (
      key: "notes" | "saved" | "received" | "sent",
      showSpinner: boolean
    ) => {
      if (fetchedTabsRef.current.has(key)) return;
      fetchedTabsRef.current.add(key);

      if (showSpinner) setTabLoading(true);
      try {
        const supabase = createClient();
        if (key === "notes") {
          const { data } = await supabase
            .from("notes")
            .select("*")
            .eq("author_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(30);
          setMyNotes((data as StudyNote[]) || []);
        } else if (key === "saved") {
          const { data } = await supabase
            .from("saved_books")
            .select("*, book:book_listings(*)")
            .eq("user_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(30);
          setSavedBooks((data as SavedBook[]) || []);
        } else if (key === "received") {
          const { data } = await supabase
            .from("inquiries")
            .select(
              "*, book:book_listings(id, title, price_npr, status, images), sender:public_profiles!inquiries_sender_id_fkey(*)"
            )
            .eq("receiver_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(30);
          setReceivedInquiries((data as Inquiry[]) || []);
        } else if (key === "sent") {
          const { data } = await supabase
            .from("inquiries")
            .select(
              "*, book:book_listings(id, title, price_npr, status, images), receiver:public_profiles!inquiries_receiver_id_fkey(*)"
            )
            .eq("sender_id", profile.id)
            .order("created_at", { ascending: false })
            .limit(30);
          setSentInquiries((data as Inquiry[]) || []);
        }
      } finally {
        if (showSpinner) setTabLoading(false);
      }
    },
    [profile.id]
  );

  // Stagger background prefetching of secondary dashboard tabs after initial paint
  useEffect(() => {
    const timers = [
      setTimeout(() => void loadTabData("notes", false), 250),
      setTimeout(() => void loadTabData("saved", false), 550),
      setTimeout(() => void loadTabData("received", false), 850),
      setTimeout(() => void loadTabData("sent", false), 1150),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loadTabData]);

  async function selectTab(tab: TabKey) {
    setActiveTab(tab);

    if (
      (tab === "created_notes" || tab === "uploaded_notes") &&
      myNotes === null
    ) {
      await loadTabData("notes", true);
    } else if (tab === "saved" && savedBooks === null) {
      await loadTabData("saved", true);
    } else if (tab === "received" && receivedInquiries === null) {
      await loadTabData("received", true);
    } else if (tab === "sent" && sentInquiries === null) {
      await loadTabData("sent", true);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  async function handleToggleSold(book: BookListing) {
    const supabase = createClient();
    const nextStatus = book.status === "sold" ? "available" : "sold";
    await supabase
      .from("book_listings")
      .update({ status: nextStatus })
      .eq("id", book.id);
    setMyBooks((prev) =>
      prev.map((b) => (b.id === book.id ? { ...b, status: nextStatus } : b))
    );
  }

  async function handleDeleteBook(id: string) {
    if (!window.confirm("Delete this book listing?")) return;
    const supabase = createClient();
    await supabase.from("book_listings").delete().eq("id", id);
    setMyBooks((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleDeleteNote(id: string) {
    if (!window.confirm("Delete this study note?")) return;
    const supabase = createClient();
    await supabase.from("notes").delete().eq("id", id);
    setMyNotes((prev) => (prev ? prev.filter((n) => n.id !== id) : prev));
  }

  async function handleRemoveSaved(bookId: string) {
    const supabase = createClient();
    await supabase
      .from("saved_books")
      .delete()
      .eq("user_id", profile.id)
      .eq("book_id", bookId);
    setSavedBooks((prev) =>
      prev ? prev.filter((s) => s.book_id !== bookId) : prev
    );
  }

  async function handleSendReply(inquiryId: string) {
    const replyText = (replyDrafts[inquiryId] || "").trim();
    if (replyText.length < 2) return;

    setReplyingId(inquiryId);
    setFeedback(null);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("inquiries")
        .update({ reply: replyText, status: "replied" })
        .eq("id", inquiryId);

      if (!error) {
        setFeedback("Reply sent successfully.");
        setReceivedInquiries((prev) =>
          prev
            ? prev.map((inq) =>
                inq.id === inquiryId
                  ? { ...inq, reply: replyText, status: "replied" }
                  : inq
              )
            : prev
        );
      }
    } finally {
      setReplyingId(null);
    }
  }

  const uploadedNotes = (myNotes || []).filter((n) => n.note_type === "pdf");
  const createdNotes = (myNotes || []).filter((n) => n.note_type === "created");

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "books", label: "My Books", icon: BookOpen },
    { key: "created_notes", label: "My Created Notes", icon: PenSquare },
    { key: "uploaded_notes", label: "My Notes (PDF)", icon: FileText },
    { key: "saved", label: "Saved Books", icon: Heart },
    { key: "received", label: "Received Inquiries", icon: Inbox },
    { key: "sent", label: "Sent Inquiries", icon: Send },
    { key: "settings", label: "Profile Settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Welcome, {profile.full_name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your books, study notes, inquiries, and profile settings.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/marketplace/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Sell a Book
            </Button>
          </Link>
          <Link href="/notes/new">
            <Button variant="outline" size="sm">
              Create Note
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {profile.is_suspended && (
        <Alert variant="destructive">
          Your account is currently suspended. You cannot create new listings or
          notes. Contact an administrator if you believe this is a mistake.
        </Alert>
      )}

      {/* Simple Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Active Book Listings
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {activeBooksCount}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-primary opacity-75" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Sold Books
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {soldBooksCount}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-emerald-600 opacity-75" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Published Notes
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {publishedNotesCount}
              </p>
            </div>
            <FileText className="h-8 w-8 text-emerald-700 opacity-75" />
          </CardContent>
        </Card>
      </div>

      {feedback && <Alert variant="success">{feedback}</Alert>}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => selectTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                active
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lazy-Loading Tab Skeleton */}
      {tabLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          {activeTab === "books" && (
            <div className="space-y-3">
              {myBooks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center space-y-2">
                    <p className="font-medium">
                      You haven&apos;t listed any books yet
                    </p>
                    <Link
                      href="/marketplace/new"
                      className="inline-block pt-1"
                    >
                      <Button size="sm">Sell a Book</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                myBooks.map((book) => (
                  <Card key={book.id}>
                    <CardContent className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/books/${book.id}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {book.title}
                          </Link>
                          <Badge
                            variant={
                              book.status === "available"
                                ? "success"
                                : book.status === "sold"
                                ? "warning"
                                : "destructive"
                            }
                          >
                            {book.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatNPR(book.price_npr)} &middot; {book.condition}{" "}
                          &middot; Listed {formatDate(book.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Link href={`/books/${book.id}/edit`}>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </Link>
                        {book.status !== "removed" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleToggleSold(book)}
                          >
                            {book.status === "sold"
                              ? "Mark Available"
                              : "Mark Sold"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id)}
                          className="text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {(activeTab === "created_notes" ||
            activeTab === "uploaded_notes") && (
            <div className="space-y-3">
              {(activeTab === "created_notes" ? createdNotes : uploadedNotes)
                .length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center space-y-2">
                    <p className="font-medium">
                      {activeTab === "created_notes"
                        ? "No created notes yet"
                        : "No uploaded PDF notes yet"}
                    </p>
                    <Link
                      href={
                        activeTab === "created_notes"
                          ? "/notes/new"
                          : "/notes/upload"
                      }
                      className="inline-block pt-1"
                    >
                      <Button size="sm">
                        {activeTab === "created_notes"
                          ? "Create Note"
                          : "Upload PDF"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                (activeTab === "created_notes"
                  ? createdNotes
                  : uploadedNotes
                ).map((note) => (
                  <Card key={note.id}>
                    <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/notes/${note.id}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {note.title}
                          </Link>
                          <Badge variant="outline">{note.visibility}</Badge>
                          {note.status === "removed" && (
                            <Badge variant="destructive">Removed</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {note.subject} &middot; {note.education_level}
                          {note.note_type === "pdf" &&
                            ` · ${formatFileSize(note.file_size)}`}
                          {` · ${formatDate(note.created_at)}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {note.note_type === "created" && (
                          <Link href={`/notes/${note.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-3">
              {!savedBooks || savedBooks.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center space-y-2">
                    <p className="font-medium">No saved books yet</p>
                    <Link href="/marketplace" className="inline-block pt-1">
                      <Button size="sm" variant="outline">
                        Browse Marketplace
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                savedBooks.map((item) =>
                  item.book ? (
                    <Card key={item.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <Link
                            href={`/books/${item.book.id}`}
                            className="font-semibold text-foreground hover:text-primary"
                          >
                            {item.book.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatNPR(item.book.price_npr)} &middot;{" "}
                            {item.book.condition} &middot; {item.book.location}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveSaved(item.book_id)}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  ) : null
                )
              )}
            </div>
          )}

          {activeTab === "received" && (
            <div className="space-y-3">
              {!receivedInquiries || receivedInquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    No inquiries received yet.
                  </CardContent>
                </Card>
              ) : (
                receivedInquiries.map((inq) => (
                  <Card key={inq.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <Link
                            href={`/books/${inq.book_id}`}
                            className="font-semibold text-sm hover:text-primary"
                          >
                            {inq.book?.title || "Book Listing"}
                          </Link>
                        </div>
                        <Badge
                          variant={
                            inq.status === "replied" ? "success" : "warning"
                          }
                        >
                          {inq.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">
                        <span className="font-medium">
                          {inq.sender?.full_name || "Student"}:
                        </span>{" "}
                        {inq.message}
                      </p>

                      {inq.reply ? (
                        <p className="text-sm text-foreground bg-secondary/40 rounded-lg p-3">
                          <span className="font-medium">Your reply:</span>{" "}
                          {inq.reply}
                        </p>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a reply..."
                            value={replyDrafts[inq.id] || ""}
                            onChange={(e) =>
                              setReplyDrafts((prev) => ({
                                ...prev,
                                [inq.id]: e.target.value,
                              }))
                            }
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSendReply(inq.id)}
                            disabled={replyingId === inq.id}
                          >
                            {replyingId === inq.id ? "Sending..." : "Reply"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="space-y-3">
              {!sentInquiries || sentInquiries.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-sm text-muted-foreground">
                    You haven&apos;t sent any book inquiries yet.
                  </CardContent>
                </Card>
              ) : (
                sentInquiries.map((inq) => (
                  <Card key={inq.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/books/${inq.book_id}`}
                          className="font-semibold text-sm hover:text-primary"
                        >
                          {inq.book?.title || "Book Listing"}
                        </Link>
                        <Badge
                          variant={
                            inq.status === "replied" ? "success" : "muted"
                          }
                        >
                          {inq.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        You asked: &ldquo;{inq.message}&rdquo;
                      </p>
                      {inq.reply && (
                        <p className="text-sm text-foreground bg-secondary/40 rounded-lg p-3">
                          <span className="font-medium">
                            {inq.receiver?.full_name || "Seller"} replied:
                          </span>{" "}
                          {inq.reply}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <Card>
              <CardContent className="p-6">
                <ProfileSettingsForm profile={profile} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
