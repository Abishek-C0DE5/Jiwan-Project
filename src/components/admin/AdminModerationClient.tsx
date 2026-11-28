"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Ban,
  Bell,
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CollegeNotice } from "@/lib/constants/notices";
import { formatDate, formatNPR } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookListing, Profile, Report, StudyNote } from "@/types/database";

interface AdminModerationClientProps {
  adminId: string;
  adminEmail: string;
  reports: Report[];
  initialCounts: {
    totalUsers: number;
    activeBooks: number;
    activeNotes: number;
  };
  notices: CollegeNotice[];
}

type AdminTab = "reports" | "books" | "notes" | "users" | "notices";

export function AdminModerationClient({
  adminId,
  adminEmail,
  reports: initialReports,
  initialCounts,
  notices: initialNotices,
}: AdminModerationClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("reports");
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [users, setUsers] = useState<Profile[] | null>(null);
  const [books, setBooks] = useState<BookListing[] | null>(null);
  const [notes, setNotes] = useState<StudyNote[] | null>(null);
  const [notices, setNotices] = useState<CollegeNotice[]>(initialNotices);
  const [tabLoading, setTabLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [newNoticeTitle, setNewNoticeTitle] = useState("");
  const [newNoticeHref, setNewNoticeHref] = useState("/marketplace");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fetchedTabsRef = useRef<Set<string>>(new Set());

  const loadAdminTab = useCallback(
    async (tab: "books" | "notes" | "users", showSpinner: boolean) => {
      if (fetchedTabsRef.current.has(tab)) return;
      fetchedTabsRef.current.add(tab);
      if (showSpinner) setTabLoading(true);
      try {
        const supabase = createClient();
        if (tab === "books") {
          const { data } = await supabase
            .from("book_listings")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(40);
          setBooks((data as BookListing[]) || []);
        } else if (tab === "notes") {
          const { data } = await supabase
            .from("notes")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(40);
          setNotes((data as StudyNote[]) || []);
        } else if (tab === "users") {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(40);
          setUsers((data as Profile[]) || []);
        }
      } finally {
        if (showSpinner) setTabLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timers = [
      setTimeout(() => void loadAdminTab("books", false), 250),
      setTimeout(() => void loadAdminTab("notes", false), 550),
      setTimeout(() => void loadAdminTab("users", false), 850),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loadAdminTab]);

  async function selectTab(tab: AdminTab) {
    setActiveTab(tab);
    if (tab === "books" && books === null) await loadAdminTab("books", true);
    else if (tab === "notes" && notes === null) await loadAdminTab("notes", true);
    else if (tab === "users" && users === null) await loadAdminTab("users", true);
  }

  const liveStats = useMemo(
    () => ({
      totalUsers: users ? users.length : initialCounts.totalUsers,
      activeBooks: books
        ? books.filter((b) => b.status === "available").length
        : initialCounts.activeBooks,
      activeNotes: notes
        ? notes.filter((n) => n.status === "active").length
        : initialCounts.activeNotes,
      pendingReports: reports.filter((r) => r.status === "pending").length,
    }),
    [users, books, notes, reports, initialCounts]
  );

  const q = searchQuery.trim().toLowerCase();

  const filteredBooks = useMemo(
    () =>
      (books ?? []).filter(
        (b) =>
          !q ||
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.subject.toLowerCase().includes(q)
      ),
    [books, q]
  );

  const filteredNotes = useMemo(
    () =>
      (notes ?? []).filter(
        (n) =>
          !q ||
          n.title.toLowerCase().includes(q) ||
          n.subject.toLowerCase().includes(q)
      ),
    [notes, q]
  );

  const filteredUsers = useMemo(
    () =>
      (users ?? []).filter(
        (u) =>
          !q ||
          u.full_name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      ),
    [users, q]
  );

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
        setBooks((prev) =>
          prev
            ? prev.map((b) =>
                b.id === report.target_id ? { ...b, status: "removed" } : b
              )
            : prev
        );
      } else {
        await supabase
          .from("notes")
          .update({ status: "removed" })
          .eq("id", report.target_id);
        setNotes((prev) =>
          prev
            ? prev.map((n) =>
                n.id === report.target_id ? { ...n, status: "removed" } : n
              )
            : prev
        );
      }
      await supabase
        .from("reports")
        .update({ status: "action_taken", reviewed_by: adminId })
        .eq("id", report.id);
      router.refresh();
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, status: "action_taken", reviewed_by: adminId }
            : r
        )
      );
      setFeedback("Content removed and report marked as action taken.");
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
      router.refresh();
      setReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: "dismissed", reviewed_by: adminId }
            : r
        )
      );
      setFeedback("Report dismissed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleBookStatusChange(
    book: BookListing,
    nextStatus: BookListing["status"]
  ) {
    setBusyId(book.id);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase
        .from("book_listings")
        .update({ status: nextStatus })
        .eq("id", book.id);
      router.refresh();
      setBooks((prev) =>
        prev
          ? prev.map((b) => (b.id === book.id ? { ...b, status: nextStatus } : b))
          : prev
      );
      setFeedback(`Book "${book.title}" marked as ${nextStatus}.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteBook(bookId: string, title: string) {
    setBusyId(bookId);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase.from("book_listings").delete().eq("id", bookId);
      router.refresh();
      setBooks((prev) => (prev ? prev.filter((b) => b.id !== bookId) : prev));
      setFeedback(`Deleted book "${title}".`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleNoteStatusChange(
    note: StudyNote,
    nextStatus: StudyNote["status"]
  ) {
    setBusyId(note.id);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase
        .from("notes")
        .update({ status: nextStatus })
        .eq("id", note.id);
      router.refresh();
      setNotes((prev) =>
        prev
          ? prev.map((n) => (n.id === note.id ? { ...n, status: nextStatus } : n))
          : prev
      );
      setFeedback(`Note "${note.title}" updated to ${nextStatus}.`);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteNote(noteId: string, title: string) {
    setBusyId(noteId);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase.from("notes").delete().eq("id", noteId);
      router.refresh();
      setNotes((prev) => (prev ? prev.filter((n) => n.id !== noteId) : prev));
      setFeedback(`Deleted note "${title}".`);
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
      router.refresh();
      setUsers((prev) =>
        prev
          ? prev.map((u) =>
              u.id === user.id ? { ...u, is_suspended: !u.is_suspended } : u
            )
          : prev
      );
      setFeedback(
        user.is_suspended
          ? `Unsuspended ${user.full_name}.`
          : `Suspended ${user.full_name}.`
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleAdminRole(user: Profile) {
    if (user.id === adminId) return;
    const nextRole: Profile["role"] = user.role === "admin" ? "student" : "admin";
    setBusyId(user.id);
    setFeedback(null);
    try {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ role: nextRole })
        .eq("id", user.id);
      router.refresh();
      setUsers((prev) =>
        prev
          ? prev.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u))
          : prev
      );
      setFeedback(`Updated ${user.full_name}'s role to ${nextRole}.`);
    } finally {
      setBusyId(null);
    }
  }

  function handleAddNotice(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;
    const item: CollegeNotice = {
      id: `notice-${Date.now()}`,
      title: newNoticeTitle.trim(),
      age: "Just now",
      href: newNoticeHref.trim() || "/marketplace",
      active: true,
    };
    setNotices((prev) => [item, ...prev]);
    setNewNoticeTitle("");
    setFeedback("Added new college notice.");
  }

  function handleToggleNotice(id: string) {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, active: !n.active } : n))
    );
  }

  function handleDeleteNotice(id: string) {
    setNotices((prev) => prev.filter((n) => n.id !== id));
    setFeedback("Removed college notice.");
  }

  const tabs: { id: AdminTab; label: string; count?: number; icon: React.ElementType }[] = [
    { id: "reports", label: "Reports", count: liveStats.pendingReports, icon: ShieldAlert },
    { id: "books", label: "Books", count: books ? books.length : initialCounts.activeBooks, icon: BookOpen },
    { id: "notes", label: "Study Notes", count: notes ? notes.length : initialCounts.activeNotes, icon: FileText },
    { id: "users", label: "Students", count: users ? users.length : initialCounts.totalUsers, icon: Users },
    { id: "notices", label: "Notices", count: notices.length, icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#12434d]/20 bg-[#12434d]/5 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-[#12434d] font-medium">
          <ShieldCheck className="h-4 w-4 text-[#f2a51a]" />
          <span>
            Signed in as <strong>{adminEmail}</strong>
          </span>
        </div>
        <Badge className="bg-[#12434d] text-white">Admin Access</Badge>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold text-[#12434d] mt-1">
              {liveStats.totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Available Books</p>
            <p className="text-2xl font-bold text-[#12434d] mt-1">
              {liveStats.activeBooks}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Active Notes</p>
            <p className="text-2xl font-bold text-[#12434d] mt-1">
              {liveStats.activeNotes}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Pending Reports</p>
            <p className="text-2xl font-bold text-[#e2a024] mt-1">
              {liveStats.pendingReports}
            </p>
          </CardContent>
        </Card>
      </div>

      {feedback && <Alert variant="success">{feedback}</Alert>}

      {/* Tab Bar + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => void selectTab(tab.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  active
                    ? "bg-[#12434d] text-white shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-[#12434d]/10 hover:text-[#12434d]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {typeof tab.count === "number" && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      active
                        ? "bg-[#f2a51a] text-[#071d2b]"
                        : "bg-white text-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {(activeTab === "books" || activeTab === "notes" || activeTab === "users") && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="h-9 pl-8 text-xs"
            />
          </div>
        )}
      </div>

      {tabLoading && (activeTab === "books" || activeTab === "notes" || activeTab === "users") && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* TAB 1: REPORTS */}
      {activeTab === "reports" && (
        <section className="space-y-3">
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
      )}

      {/* TAB 2: BOOKS */}
      {activeTab === "books" && (
        <section className="space-y-2.5">
          {filteredBooks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No matching books found.
              </CardContent>
            </Card>
          ) : (
            filteredBooks.map((book) => (
              <Card key={book.id}>
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {book.title}
                      </p>
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
                      by {book.author} &middot; {book.subject} &middot;{" "}
                      <strong className="text-[#12434d]">
                        {formatNPR(book.price_npr)}
                      </strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link href={`/books/${book.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
                    {book.status !== "available" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === book.id}
                        onClick={() => handleBookStatusChange(book, "available")}
                      >
                        Restore
                      </Button>
                    )}
                    {book.status === "available" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === book.id}
                        onClick={() => handleBookStatusChange(book, "removed")}
                      >
                        Hide
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={busyId === book.id}
                      onClick={() => handleDeleteBook(book.id, book.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      )}

      {/* TAB 3: STUDY NOTES */}
      {activeTab === "notes" && (
        <section className="space-y-2.5">
          {filteredNotes.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No matching study notes found.
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id}>
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {note.title}
                      </p>
                      <Badge variant="outline" className="uppercase">
                        {note.note_type}
                      </Badge>
                      <Badge
                        variant={
                          note.status === "active" ? "success" : "destructive"
                        }
                      >
                        {note.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {note.subject} &middot; {note.education_level} &middot;{" "}
                      {formatDate(note.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Link href={`/notes/${note.id}`}>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Button>
                    </Link>
                    {note.status !== "active" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === note.id}
                        onClick={() => handleNoteStatusChange(note, "active")}
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === note.id}
                        onClick={() => handleNoteStatusChange(note, "removed")}
                      >
                        Hide
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={busyId === note.id}
                      onClick={() => handleDeleteNote(note.id, note.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      )}

      {/* TAB 4: STUDENTS & ACCOUNTS */}
      {activeTab === "users" && (
        <section className="space-y-2.5">
          {filteredUsers.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm">{u.full_name}</p>
                    <Badge
                      variant={u.role === "admin" ? "default" : "outline"}
                      className={
                        u.role === "admin"
                          ? "bg-[#12434d] text-white"
                          : undefined
                      }
                    >
                      {u.role}
                    </Badge>
                    {u.is_suspended && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {u.email} &middot; {u.education_level || "Student"} &middot;
                    Joined {formatDate(u.created_at)}
                  </p>
                </div>

                {u.id !== adminId && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAdminRole(u)}
                      disabled={busyId === u.id}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {u.role === "admin" ? "Make Student" : "Make Admin"}
                    </Button>
                    <Button
                      variant={u.is_suspended ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => handleToggleSuspend(u)}
                      disabled={busyId === u.id}
                    >
                      <Ban className="h-3.5 w-3.5" />
                      {u.is_suspended ? "Unsuspend" : "Suspend"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* TAB 5: COLLEGE NOTICES */}
      {activeTab === "notices" && (
        <section className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <form
                onSubmit={handleAddNotice}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <Input
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Enter new college notice headline..."
                  className="flex-1"
                />
                <Input
                  value={newNoticeHref}
                  onChange={(e) => setNewNoticeHref(e.target.value)}
                  placeholder="/marketplace"
                  className="sm:w-44"
                />
                <Button type="submit" className="shrink-0">
                  <Plus className="h-4 w-4" />
                  Add Notice
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-2.5">
            {notices.map((notice) => (
              <Card key={notice.id}>
                <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={notice.active ? "success" : "muted"}>
                        {notice.active ? "Active" : "Paused"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {notice.age} &middot; Link: {notice.href}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {notice.title}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleNotice(notice.id)}
                    >
                      {notice.active ? "Pause" : "Activate"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNotice(notice.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
