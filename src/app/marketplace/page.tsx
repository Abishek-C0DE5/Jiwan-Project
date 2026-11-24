import { Suspense } from "react";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookCard } from "@/components/marketplace/BookCard";
import { BookFilters } from "@/components/marketplace/BookFilters";
import type { BookListing, Category } from "@/types/database";

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
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted-foreground">
          Configure <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>{" "}
          to browse and list books.
        </p>
      </div>
    );
  }

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

  const { data: books, error } = await query.limit(48);

  return (
    <div className="space-y-6">
      <BookFilters categories={(categories as Category[]) || []} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Failed to load book listings: {error.message}
        </div>
      ) : !books || books.length === 0 ? (
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(books as BookListing[]).map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Book Marketplace
          </h1>
          <p className="text-sm text-muted-foreground">
            Buy and sell second-hand textbooks directly with fellow students.
          </p>
        </div>
        <Link href="/marketplace/new">
          <Button>
            <Plus className="h-4 w-4" />
            Sell a Book
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            <Skeleton className="h-36 w-full" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
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
