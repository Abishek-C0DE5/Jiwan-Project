import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, GraduationCap, MapPin } from "lucide-react";
import { createClient, getCurrentUserWithProfile, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatDate, formatNPR } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BookGallery } from "@/components/marketplace/BookGallery";
import { BookDetailActions } from "@/components/marketplace/BookDetailActions";
import type { BookListing, PublicProfile } from "@/types/database";

async function BookDetailContent({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Supabase is not configured yet.
      </div>
    );
  }

  const { id } = await paramsPromise;
  const supabase = await createClient();
  const { user } = await getCurrentUserWithProfile();

  const { data: book } = await supabase
    .from("book_listings")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single<BookListing>();

  if (!book) {
    notFound();
  }

  const { data: seller } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("id", book.seller_id)
    .single<PublicProfile>();

  let initialSaved = false;
  if (user) {
    const { data: savedRow } = await supabase
      .from("saved_books")
      .select("id")
      .eq("user_id", user.id)
      .eq("book_id", book.id)
      .maybeSingle();
    initialSaved = Boolean(savedRow);
  }

  return (
    <div className="space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Photos & Description */}
        <div className="lg:col-span-7 space-y-6">
          <BookGallery images={book.images} title={book.title} />

          <Card>
            <CardContent className="p-5 space-y-3">
              <h2 className="font-semibold text-foreground">
                About this book
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                {book.description}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border text-sm">
                <div>
                  <span className="text-muted-foreground">Author:</span>{" "}
                  <span className="font-medium">{book.author}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject:</span>{" "}
                  <span className="font-medium">{book.subject}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>{" "}
                  <span className="font-medium">
                    {book.category?.name || "General"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Level:</span>{" "}
                  <span className="font-medium">{book.education_level}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Price, Seller, Actions */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{book.condition}</Badge>
              <Badge
                variant={book.status === "available" ? "success" : "destructive"}
              >
                {book.status === "available"
                  ? "Available"
                  : book.status === "sold"
                  ? "Sold"
                  : "Removed"}
              </Badge>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {book.title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                by {book.author}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-primary">
                {formatNPR(book.price_npr)}
              </span>
              {book.original_price_npr &&
                book.original_price_npr > book.price_npr && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatNPR(book.original_price_npr)}
                  </span>
                )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {book.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Listed {formatDate(book.created_at)}
              </span>
            </div>
          </div>

          {/* Seller Public Info */}
          {seller && (
            <Card>
              <CardContent className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={seller.avatar_url} name={seller.full_name} />
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${seller.id}`}
                      className="font-semibold text-sm text-foreground hover:text-primary truncate block"
                    >
                      {seller.full_name}
                    </Link>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      {seller.institution || seller.education_level || "Student"}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/profile/${seller.id}`}
                  className="text-xs font-medium text-primary hover:underline shrink-0"
                >
                  View profile
                </Link>
              </CardContent>
            </Card>
          )}

          <BookDetailActions
            bookId={book.id}
            sellerId={book.seller_id}
            status={book.status}
            currentUserId={user?.id || null}
            initialSaved={initialSaved}
          />
        </div>
      </div>
    </div>
  );
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
      <Suspense fallback={<Skeleton className="h-[520px] w-full" />}>
        <BookDetailContent paramsPromise={params} />
      </Suspense>
    </div>
  );
}
