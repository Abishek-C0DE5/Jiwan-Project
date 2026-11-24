import { Suspense } from "react";
import Link from "next/link";
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
    <div className="w-full space-y-12 pb-14">
      <HeroSection />

      {/* Recent Books */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Recently Listed Books
            </h2>
            <p className="text-sm text-muted-foreground">
              Fresh second-hand textbooks from students near you.
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" size="sm">
              View all
            </Button>
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => (
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
    </div>
  );
}
