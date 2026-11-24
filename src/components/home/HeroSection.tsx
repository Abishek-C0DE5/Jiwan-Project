"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FileText,
  Flame,
  LayoutDashboard,
  PlaySquare,
  Search,
  Sparkles,
} from "lucide-react";

const TRENDING_TOPICS = [
  { label: "Physics", href: "/marketplace?q=Physics" },
  { label: "Chemistry", href: "/marketplace?q=Chemistry" },
  { label: "Computer Science", href: "/marketplace?q=Computer+Science" },
  { label: "Calculus Notes", href: "/notes?q=Calculus" },
];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/marketplace?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/marketplace");
    }
  }

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      {/* Top Hero Banner with Blended Right Illustration */}
      <div className="relative">
        {/* Right-side Hero Illustration (Desktop) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-student.jpg"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="relative w-full px-4 pt-10 pb-8 sm:px-6 sm:pt-12 lg:px-10 xl:px-12">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ede9fe] px-3.5 py-1 text-xs font-semibold text-[#5b21b6]">
              <Sparkles className="h-3.5 w-3.5" />
              Your Study Companion
            </span>

            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem] leading-[1.08]">
              Everything you need for your{" "}
              <span className="relative inline-block text-[#6d28d9]">
                studies.
                <svg
                  viewBox="0 0 180 12"
                  fill="none"
                  className="absolute -bottom-1.5 left-0 w-full h-2.5 text-[#7c3aed]"
                  aria-hidden="true"
                >
                  <path
                    d="M3 9C52 2 128 2 177 8"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base text-muted-foreground sm:text-lg max-w-xl leading-relaxed">
              Buy and sell second-hand textbooks in NPR, create or upload study
              notes, and watch focused educational videos.
            </p>

            {/* Rounded Pill Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-border bg-white p-1.5 shadow-sm max-w-xl focus-within:border-[#6d28d9] focus-within:ring-2 focus-within:ring-[#6d28d9]/20 transition-all"
            >
              <div className="flex flex-1 items-center gap-2.5 pl-4">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search textbooks, notes, author, or subject..."
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  aria-label="Search textbooks or notes"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5b21b6] cursor-pointer shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </form>

            {/* Trending Topics */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Flame className="h-3.5 w-3.5 text-amber-500" />
                Trending:
              </span>
              {TRENDING_TOPICS.map((topic) => (
                <Link
                  key={topic.label}
                  href={topic.href}
                  className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-violet-300 hover:bg-[#ede9fe] hover:text-[#5b21b6]"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Three Tinted Feature Cards + Quick Access */}
      <div className="w-full px-4 pb-10 sm:px-6 lg:px-10 xl:px-12 space-y-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Card 1: Book Marketplace (Emerald Accent) */}
          <Link
            href="/marketplace"
            className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/80 p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-semibold text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-5 space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">
                Book Marketplace
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find affordable used textbooks or list the books you no longer
                need.
              </p>
            </div>
          </Link>

          {/* Card 2: Study Notes (Blue Accent) */}
          <Link
            href="/notes"
            className="group relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50/80 p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-blue-700">
                <FileText className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100/90 px-3 py-1 text-xs font-semibold text-blue-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Explore <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-5 space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">Study Notes</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Write structured study notes or upload PDF handouts to share.
              </p>
            </div>
          </Link>

          {/* Card 3: Video Lessons (Purple Accent) */}
          <Link
            href="/learn"
            className="group relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50/90 p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#ede9fe] text-[#6d28d9]">
                <PlaySquare className="h-5 w-5" />
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#ede9fe] px-3 py-1 text-xs font-semibold text-[#5b21b6] group-hover:bg-[#6d28d9] group-hover:text-white transition-colors">
                Start Learning <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="mt-5 space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">
                Video Lessons
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search educational videos by topic and watch without
                distractions.
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Access Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 rounded-full bg-[#6d28d9]" />
              <div>
                <h2 className="text-base font-bold text-foreground leading-none">
                  Quick Access
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Jump into what you need, faster.
                </p>
              </div>
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/marketplace"
              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-violet-200 hover:shadow-xs"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ede9fe] text-[#6d28d9]">
                  <BookOpen className="h-4 w-4" />
                </span>
                Browse Books
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/notes"
              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-sky-200 hover:shadow-xs"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-blue-700">
                  <FileText className="h-4 w-4" />
                </span>
                View Notes
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/learn"
              className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-violet-200 hover:shadow-xs"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ede9fe] text-[#6d28d9]">
                  <PlaySquare className="h-4 w-4" />
                </span>
                Watch Videos
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm font-semibold text-foreground transition-all hover:border-emerald-200 hover:shadow-xs"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <LayoutDashboard className="h-4 w-4" />
                </span>
                My Dashboard
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
