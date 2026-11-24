"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  PlaySquare,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";

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
    <section className="relative overflow-hidden bg-[#f8fbf9] border-b border-emerald-100">
      {/* Subtle Mint Corner Waves matching reference */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl"
      />

      <div className="relative w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-10 xl:px-12 space-y-10">
        {/* Main Two-Column Hero */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          {/* Left Column */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-sans text-4xl font-extrabold tracking-tight text-[#14221b] sm:text-5xl xl:text-[3.5rem] leading-[1.08]">
              Study Smarter,{" "}
              <span className="relative inline-block text-[#147a4b]">
                Together
                <svg
                  viewBox="0 0 220 14"
                  fill="none"
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#147a4b]"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10.5C58 2.5 148 2 217 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-base text-[#4b5e53] sm:text-lg max-w-xl leading-relaxed">
              Buy &amp; sell second-hand books, share study notes and explore
              educational videos &mdash; all in one place.
            </p>

            {/* Pill Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-emerald-200/90 bg-white p-1.5 shadow-sm max-w-xl focus-within:ring-2 focus-within:ring-[#147a4b]/30"
            >
              <div className="flex flex-1 items-center gap-2.5 pl-4">
                <Search className="h-4 w-4 text-[#6b7d72] shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search books, notes or topics..."
                  className="w-full bg-transparent text-sm text-[#14221b] placeholder:text-[#7c8e83] focus:outline-none"
                  aria-label="Search books, notes or topics"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-[#0d4a2f] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#093622] cursor-pointer shrink-0"
              >
                Search
              </button>
            </form>

            {/* 3 Quick Feature Links */}
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3 max-w-xl">
              <Link
                href="/marketplace"
                className="group flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-emerald-50/80"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ec] text-[#147a4b]">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14221b] group-hover:text-[#147a4b] truncate">
                    Book Marketplace
                  </p>
                  <p className="text-[11px] text-[#5e7266] truncate">
                    Buy &amp; sell books
                  </p>
                </div>
              </Link>

              <Link
                href="/notes"
                className="group flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-emerald-50/80"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ec] text-[#147a4b]">
                  <FileText className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14221b] group-hover:text-[#147a4b] truncate">
                    Study Notes
                  </p>
                  <p className="text-[11px] text-[#5e7266] truncate">
                    Create &amp; share PDFs
                  </p>
                </div>
              </Link>

              <Link
                href="/learn"
                className="group flex items-center gap-2.5 rounded-xl p-2 transition-colors hover:bg-emerald-50/80"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f4ec] text-[#147a4b]">
                  <PlaySquare className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#14221b] group-hover:text-[#147a4b] truncate">
                    Video Lessons
                  </p>
                  <p className="text-[11px] text-[#5e7266] truncate">
                    Focused learning
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: Books + Graduation Cap + Laptop + Floating Cards */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="relative w-full max-w-[520px] py-6">
              {/* Soft Mint Circle Backdrop */}
              <div
                aria-hidden="true"
                className="mx-auto h-72 w-72 sm:h-80 sm:w-80 rounded-full bg-[#d9efe2]"
              />

              {/* Centerpiece SVG: Stacked Green Books + Graduation Cap + Laptop */}
              <svg
                viewBox="0 0 420 310"
                className="absolute inset-0 m-auto w-[92%] max-w-[400px] drop-shadow-md"
                aria-hidden="true"
              >
                {/* Ground shadow */}
                <ellipse
                  cx="205"
                  cy="282"
                  rx="155"
                  ry="16"
                  fill="#cbe6d6"
                  opacity="0.7"
                />

                {/* Bottom Book */}
                <rect x="75" y="220" width="195" height="40" rx="8" fill="#0d4a2f" />
                <rect x="92" y="227" width="170" height="26" rx="4" fill="#f3f7f4" />
                <rect x="75" y="220" width="22" height="40" rx="6" fill="#093622" />

                {/* Middle Book */}
                <rect x="65" y="182" width="190" height="38" rx="8" fill="#186a43" />
                <rect x="82" y="189" width="165" height="24" rx="4" fill="#eef4f0" />
                <rect x="65" y="182" width="22" height="38" rx="6" fill="#115233" />

                {/* Top Book */}
                <rect x="82" y="146" width="185" height="36" rx="8" fill="#1f8555" />
                <rect x="99" y="152" width="160" height="24" rx="4" fill="#f7faf8" />
                <rect x="82" y="146" width="22" height="36" rx="6" fill="#14633e" />

                {/* Graduation Cap */}
                <path d="M128 112 h94 v26 c0 8 -94 8 -94 0 z" fill="#1f2937" />
                <polygon
                  points="175,68 250,96 175,124 100,96"
                  fill="#2d3748"
                />
                <circle cx="175" cy="96" r="5" fill="#d97706" />
                <path
                  d="M175 96 L220 112 L220 144"
                  stroke="#eab308"
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
                <circle cx="220" cy="147" r="4.5" fill="#eab308" />

                {/* Accent Spark Lines */}
                <line x1="125" y1="54" x2="117" y2="38" stroke="#147a4b" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="142" y1="48" x2="142" y2="31" stroke="#147a4b" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="158" y1="54" x2="166" y2="38" stroke="#147a4b" strokeWidth="3.5" strokeLinecap="round" />

                {/* Laptop Base */}
                <polygon
                  points="195,256 355,256 378,274 178,274"
                  fill="#cbd5e1"
                />
                <polygon
                  points="210,259 342,259 354,268 198,268"
                  fill="#94a3b8"
                />
                {/* Laptop Screen */}
                <rect
                  x="212"
                  y="165"
                  width="136"
                  height="91"
                  rx="8"
                  fill="#1e293b"
                  stroke="#94a3b8"
                  strokeWidth="3"
                />
                {/* Video Play Button on Screen */}
                <polygon points="270,194 270,226 298,210" fill="#ffffff" />
                {/* Progress bar */}
                <rect x="224" y="242" width="112" height="4" rx="2" fill="#475569" />
                <rect x="224" y="242" width="46" height="4" rx="2" fill="#22c55e" />
              </svg>
            </div>
          </div>
        </div>

        {/* Clean, Honest Value Strip */}
        <div className="grid grid-cols-1 gap-4 rounded-2xl border border-emerald-100 bg-white px-6 py-5 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#065f46] text-white">
              <Wallet className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#14221b]">Zero Listing Fees</p>
              <p className="text-xs text-[#5e7266]">Trade books directly in NPR</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#147a4b] text-white">
              <FileText className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#14221b]">Notes &amp; PDFs</p>
              <p className="text-xs text-[#5e7266]">Write or upload study guides</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f291e] text-white">
              <PlaySquare className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#14221b]">Focused Video Hub</p>
              <p className="text-xs text-[#5e7266]">Distraction-free YouTube lessons</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#065f46] text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#14221b]">Privacy First</p>
              <p className="text-xs text-[#5e7266]">Student emails stay private</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
