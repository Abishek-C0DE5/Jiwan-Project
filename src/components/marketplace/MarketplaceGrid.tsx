"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard } from "@/components/marketplace/BookCard";
import type { BookListing } from "@/types/database";

const PAGE_SIZE = 8;

interface MarketplaceGridProps {
  initialBooks: BookListing[];
  initialHasMore: boolean;
  filters: {
    q?: string;
    category?: string;
    condition?: string;
    maxPrice?: string;
    sort?: string;
  };
}

export function MarketplaceGrid({
  initialBooks,
  initialHasMore,
  filters,
}: MarketplaceGridProps) {
  const [books, setBooks] = useState<BookListing[]>(initialBooks);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);

    try {
      const supabase = createClient();
      const from = books.length;
      const to = from + PAGE_SIZE;

      let query = supabase
        .from("book_listings")
        .select("*, category:categories(*)")
        .eq("status", "available");

      if (filters.q) {
        const term = filters.q.trim();
        query = query.or(
          `title.ilike.%${term}%,author.ilike.%${term}%,subject.ilike.%${term}%`
        );
      }
      if (filters.category) {
        query = query.eq("category_id", filters.category);
      }
      if (filters.condition) {
        query = query.eq("condition", filters.condition);
      }
      if (filters.maxPrice) {
        const maxVal = Number(filters.maxPrice);
        if (!Number.isNaN(maxVal) && maxVal >= 0) {
          query = query.lte("price_npr", maxVal);
        }
      }

      if (filters.sort === "price_asc") {
        query = query.order("price_npr", { ascending: true });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data } = await query.range(from, to);
      const nextRows = (data as BookListing[]) || [];
      setHasMore(nextRows.length > PAGE_SIZE);
      setBooks((prev) => [...prev, ...nextRows.slice(0, PAGE_SIZE)]);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [books.length, filters, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}

        {loadingMore &&
          [1, 2, 3, 4].map((i) => (
            <div
              key={`sk-${i}`}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <Skeleton className="aspect-[3/2] w-full rounded-none" />
              <div className="p-5 space-y-2.5">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-6 w-1/3 mt-2" />
              </div>
            </div>
          ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center pt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingMore ? "Loading more books..." : "Load More Books"}
          </Button>
        </div>
      )}
    </div>
  );
}
