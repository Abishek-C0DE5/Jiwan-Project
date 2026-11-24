import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DEMO_BOOKS } from "@/lib/data/demo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroSection } from "@/components/home/HeroSection";
import { BookCard } from "@/components/marketplace/BookCard";
import type { BookListing } from "@/types/database";

async function RecentBooksPreview() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DEMO_BOOKS.slice(0, 4).map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    );
  }

  const supabase = await createClient();
  const { data: books } = await supabase
    .from("book_listings")
    .select("*, category:categories(*)")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(4);

  if (!books || books.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No books listed yet. Be the first student to list a textbook!
        </p>
        <Link href="/marketplace/new" className="mt-4 inline-block">
          <Button size="sm">Sell a Book</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {(books as BookListing[]).map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="w-full space-y-16 pb-16">
      <HeroSection />

      {/* Recent Books */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#12434d]">
              Campus Marketplace
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
              Recently Listed Textbooks
            </h2>
            <p className="text-sm text-muted-foreground">
              Affordable second-hand textbooks shared by Godawari College students.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#12434d] hover:text-[#083b45] transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-none" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-4 w-1/3 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <RecentBooksPreview />
        </Suspense>
      </section>

      {/* Bottom CTA Banner (Godawari College style) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="godawari-cta-gradient rounded-2xl px-6 py-10 sm:px-12 sm:py-14 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f2a51a]">
                Your Next Chapter
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                Ready to share notes or find your next textbook?
              </h2>
              <p className="text-sm sm:text-base text-white/80">
                Join fellow B.Sc. CSIT and BBS students at Godawari College to
                exchange books, upload study guides, and learn together.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/marketplace/new"
                className="inline-flex items-center gap-2 rounded-lg bg-[#f2a51a] px-5 py-3 text-sm font-bold text-[#071d2b] transition-colors hover:bg-[#e2a024]"
              >
                List a Textbook
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/notes/new"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Upload Study Notes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
