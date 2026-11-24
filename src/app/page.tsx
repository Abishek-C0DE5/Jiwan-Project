import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  PlaySquare,
  ShieldCheck,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatNPR } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookListing } from "@/types/database";

async function RecentBooksPreview() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Connect your Supabase project in <code>.env.local</code> to display
          live student book listings here.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: books } = await supabase
    .from("book_listings")
    .select(
      "id, title, author, subject, price_npr, condition, location, images, status"
    )
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {(books as Partial<BookListing>[]).map((book) => (
        <Link key={book.id} href={`/books/${book.id}`} className="group">
          <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              {book.images && book.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.images[0]}
                  alt={book.title || "Book cover"}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 opacity-40" />
                </div>
              )}
              {book.condition && (
                <Badge className="absolute top-2.5 left-2.5 bg-card/90 text-foreground backdrop-blur">
                  {book.condition}
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-1.5">
              <p className="font-semibold text-foreground line-clamp-1 group-hover:text-primary">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {book.author} &middot; {book.subject}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="font-semibold text-primary">
                  {formatNPR(book.price_npr ?? 0)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {book.location}
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl space-y-5">
            <Badge variant="default">For Students, By Students</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Buy &amp; sell textbooks, share notes, and learn smarter.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              One clean platform for students to trade affordable second-hand
              books, create or upload study notes, and discover focused
              educational videos.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/marketplace">
                <Button size="lg">
                  Browse Books
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/notes">
                <Button variant="outline" size="lg">
                  Explore Study Notes
                </Button>
              </Link>
              <Link href="/learn">
                <Button variant="ghost" size="lg">
                  Watch Video Lessons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Book Marketplace</h2>
              <p className="text-sm text-muted-foreground">
                List your used textbooks in minutes, filter by subject or price
                in NPR, save favourites, and message sellers directly.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Open Marketplace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Study Notes Hub</h2>
              <p className="text-sm text-muted-foreground">
                Write clean study notes with our built-in editor or upload your
                own PDF summaries to share with classmates.
              </p>
              <Link
                href="/notes"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Browse Notes <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <PlaySquare className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Focused Video Learning</h2>
              <p className="text-sm text-muted-foreground">
                Search educational YouTube videos by topic and watch them inside
                a distraction-free embedded player.
              </p>
              <Link
                href="/learn"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Start Learning <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Books */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
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
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          }
        >
          <RecentBooksPreview />
        </Suspense>
      </section>

      {/* Trust & Safety Note */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="bg-secondary/40 border-indigo-100">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">
                  Privacy-first student community
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your email address and private details are never exposed
                  publicly. Contact sellers safely through built-in inquiries.
                </p>
              </div>
            </div>
            <Link href="/auth/signup">
              <Button size="sm">Join StudyHub</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
