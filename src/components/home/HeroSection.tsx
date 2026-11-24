"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, FileText, PlaySquare, Search } from "lucide-react";

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
    <section className="border-b border-border bg-white">
      <div className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-12 space-y-10">
        {/* Clean Bold Header & Search */}
        <div className="max-w-3xl space-y-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] leading-[1.08]">
            Everything you need for your studies, in one place.
          </h1>
          <p className="text-base text-muted-foreground sm:text-lg max-w-2xl leading-relaxed">
            Buy and sell second-hand textbooks in NPR, create or upload study
            notes, and watch focused educational videos.
          </p>

          <form
            onSubmit={handleSearch}
            className="flex items-center rounded-xl border border-border bg-background p-1.5 max-w-xl focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all"
          >
            <div className="flex flex-1 items-center gap-2.5 pl-3">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search textbooks by title, author, or subject..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                aria-label="Search textbooks"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-900 cursor-pointer shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* Three Clean, Simple Action Cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Link
            href="/marketplace"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Book Marketplace
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find affordable used textbooks or list the books you no longer
                need.
              </p>
            </div>
            <div className="pt-5">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                Explore books <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link
            href="/notes"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Study Notes
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Write structured study notes or upload PDF handouts to share.
              </p>
            </div>
            <div className="pt-5">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                Explore notes <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link
            href="/learn"
            className="group flex flex-col justify-between rounded-2xl border border-border bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
                <PlaySquare className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Video Lessons
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search educational videos by topic and watch without
                distractions.
              </p>
            </div>
            <div className="pt-5">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                Start learning <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
