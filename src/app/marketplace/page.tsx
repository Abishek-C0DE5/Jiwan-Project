import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookFilters } from "@/components/marketplace/BookFilters";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import type { BookListing, Category } from "@/types/database";

const INITIAL_PAGE_SIZE = 8;

interface MarketplaceSearchParams {
  q?: string;
  category?: string;
  condition?: string;
  maxPrice?: string;
  sort?: string;
}

async function MarketplaceContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<MarketplaceSearchParams>;
}) {
  const params = await searchParamsPromise;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  let query = supabase
    .from("book_listings")
    .select("*, category:categories(*)")
    .eq("status", "available");

  if (params.q) {
    const term = params.q.trim();
    query = query.or(
      `title.ilike.%${term}%,author.ilike.%${term}%,subject.ilike.%${term}%`
    );
  }

  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  if (params.condition) {
    query = query.eq("condition", params.condition);
  }

  if (params.maxPrice) {
    const maxVal = Number(params.maxPrice);
    if (!Number.isNaN(maxVal) && maxVal >= 0) {
      query = query.lte("price_npr", maxVal);
    }
  }

  if (params.sort === "price_asc") {
    query = query.order("price_npr", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // Fetch 12 + 1 to detect if more pages exist without a heavy COUNT(*) query
  const { data: books, error } = await query.range(0, INITIAL_PAGE_SIZE);
  const rows = (books as BookListing[]) || [];
  const hasMore = rows.length > INITIAL_PAGE_SIZE;
  const initialBooks = rows.slice(0, INITIAL_PAGE_SIZE);

  return (
    <div className="space-y-6">
      <BookFilters categories={(categories as Category[]) || []} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Failed to load book listings: {error.message}
        </div>
      ) : initialBooks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-3">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">No matching books found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters, or list a book yourself.
          </p>
          <Link href="/marketplace/new" className="inline-block pt-1">
            <Button size="sm">Sell a Book</Button>
          </Link>
        </div>
      ) : (
        <MarketplaceGrid
          key={JSON.stringify(params)}
          initialBooks={initialBooks}
          initialHasMore={hasMore}
          filters={params}
        />
      )}
    </div>
  );
}

export default function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Book Marketplace
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buy and sell second-hand textbooks directly with fellow students.
          </p>
        </div>
        <Link href="/marketplace/new">
          <Button size="lg">
            <Plus className="h-4 w-4" />
            Sell a Book
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-36 w-full" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
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
          </div>
        }
      >
        <MarketplaceContent searchParamsPromise={searchParams} />
      </Suspense>
    </div>
  );
}
