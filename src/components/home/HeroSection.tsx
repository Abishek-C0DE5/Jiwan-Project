"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Flame,
  LayoutDashboard,
  PlaySquare,
  PlusCircle,
  Search,
  Upload,
} from "lucide-react";

const TRENDING_TOPICS = [
  { label: "B.Sc. CSIT", href: "/marketplace?q=Computer+Science" },
  { label: "BBS", href: "/marketplace?q=Business" },
  { label: "Physics", href: "/marketplace?q=Physics" },
  { label: "Calculus Notes", href: "/notes?q=Calculus" },
];

const QUICK_ACTIONS = [
  {
    title: "Book Marketplace",
    subtitle: "Buy & sell textbooks in NPR",
    href: "/marketplace",
    icon: BookOpen,
    accent: "bg-[#12434d]/10 text-[#12434d]",
  },
  {
    title: "Study Notes",
    subtitle: "Lecture notes & PDF handouts",
    href: "/notes",
    icon: FileText,
    accent: "bg-[#fef3c7] text-[#b45309]",
  },
  {
    title: "Video Lessons",
    subtitle: "Focused topic-based videos",
    href: "/learn",
    icon: PlaySquare,
    accent: "bg-[#12434d]/10 text-[#12434d]",
  },
  {
    title: "Sell a Book",
    subtitle: "List your used textbooks",
    href: "/marketplace/new",
    icon: PlusCircle,
    accent: "bg-[#fef3c7] text-[#b45309]",
  },
  {
    title: "Upload Notes",
    subtitle: "Share PDFs with your peers",
    href: "/notes/new",
    icon: Upload,
    accent: "bg-[#12434d]/10 text-[#12434d]",
  },
  {
    title: "My Dashboard",
    subtitle: "Manage listings & saved items",
    href: "/dashboard",
    icon: LayoutDashboard,
    accent: "bg-[#fef3c7] text-[#b45309]",
  },
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
    <section className="relative">
      {/* Full-Bleed Hero Banner with Student Photo & Deep Navy/Teal Gradient */}
      <div className="relative overflow-hidden bg-[#071d2b]">
        {/* Background Student Photo */}
        <Image
          src="/images/student-photo.jpg"
          alt="Godawari College Students"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-65"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(7,29,43,0.88) 0%, rgba(18,67,77,0.72) 58%, rgba(8,59,69,0.58) 100%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pt-20 sm:pb-28 lg:px-8">
          <div className="max-w-2xl space-y-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f2a51a]">
              Established 1992 AD · Itahari, Sunsari
            </p>

            <h1 className="font-serif text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.08]">
              Knowledge for today.{" "}
              <span className="text-[#f4b63e]">Confidence for tomorrow.</span>
            </h1>

            <p className="text-base text-white/85 sm:text-lg max-w-xl leading-relaxed">
              Tribhuvan University affiliated B.Sc. CSIT and BBS student hub —
              buy and sell second-hand textbooks, share study notes, and watch
              focused educational videos.
            </p>

            {/* Pill Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-white/20 bg-white p-1.5 shadow-lg max-w-xl focus-within:ring-2 focus-within:ring-[#f2a51a]"
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
                className="inline-flex items-center gap-1.5 rounded-full bg-[#f2a51a] px-5 py-2.5 text-sm font-bold text-[#071d2b] transition-colors hover:bg-[#e2a024] cursor-pointer shrink-0"
              >
                <Search className="h-3.5 w-3.5" />
                Search
              </button>
            </form>

            {/* Primary Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg bg-[#f2a51a] px-5 py-2.5 text-sm font-bold text-[#071d2b] shadow-sm transition-colors hover:bg-[#e2a024]"
              >
                Browse Textbooks
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/notes"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
              >
                Explore Study Notes
              </Link>
            </div>

            {/* Trending Topics */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-white/75">
                <Flame className="h-3.5 w-3.5 text-[#f2a51a]" />
                Trending:
              </span>
              {TRENDING_TOPICS.map((topic) => (
                <Link
                  key={topic.label}
                  href={topic.href}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 transition-colors hover:border-[#f2a51a] hover:bg-[#f2a51a] hover:text-[#071d2b]"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping Quick-Action Bento Strip (Godawari College style) */}
      <div className="relative z-10 mx-auto -mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-white p-4 sm:p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-[#f8fafc]/60 px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#12434d]/30 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-sans text-sm font-bold text-foreground group-hover:text-[#12434d] transition-colors">
                        {action.title}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {action.subtitle}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-[#12434d]" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
