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
    .limit(5);

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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      {(books as Partial<BookListing>[]).map((book) => (
        <Link key={book.id} href={`/books/${book.id}`} className="group">
          <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              {book.images && book.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={book.images[0]}
                  alt={book.title || "Book cover"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <BookOpen className="h-10 w-10 opacity-40" />
                </div>
              )}
              {book.condition && (
                <Badge className="absolute top-2.5 left-2.5 bg-card/95 text-foreground backdrop-blur">
                  {book.condition}
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-1.5">
              <p className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                {book.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {book.author} &middot; {book.subject}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-primary">
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
    <div className="space-y-14 pb-16 w-full">
      {/* Full-Width Hero */}
      <section className="border-b border-border bg-gradient-to-br from-[#042f24] via-[#064e3b] to-[#065f46] text-white">
        <div className="w-full px-4 py-14 sm:px-6 sm:py-20 lg:px-10 xl:px-12">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-900/50 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-100">
              FOR STUDENTS, BY STUDENTS
            </span>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl leading-[1.08]">
              Buy &amp; sell textbooks, share notes, and learn smarter.
            </h1>
            <p className="text-base text-emerald-100/85 sm:text-lg max-w-2xl leading-relaxed">
              One refined, distraction-free platform for students to trade
              affordable second-hand books, write or upload study notes, and
              master subjects with curated video lessons.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/marketplace">
                <Button
                  size="lg"
                  className="bg-white text-emerald-950 hover:bg-emerald-50 font-semibold shadow-sm"
                >
                  Browse Books
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/notes">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-emerald-300/40 bg-emerald-900/40 text-white hover:bg-emerald-800/60"
                >
                  Explore Study Notes
                </Button>
              </Link>
              <Link href="/learn">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-emerald-100 hover:bg-emerald-800/40 hover:text-white"
                >
                  Watch Video Lessons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Book Marketplace</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                List your used textbooks in minutes, filter by subject or price
                in NPR, save favourites, and message sellers directly.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Open Marketplace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Study Notes Hub</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Write clean study notes with our built-in editor or upload your
                own PDF summaries to share with classmates.
              </p>
              <Link
                href="/notes"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Browse Notes <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <CardContent className="p-6 space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <PlaySquare className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Focused Video Learning</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Search educational YouTube videos by topic and watch them inside
                a distraction-free embedded player.
              </p>
              <Link
                href="/learn"
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Start Learning <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Books */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-12 space-y-6">
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
                <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
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

      {/* Trust & Safety Note */}
      <section className="w-full px-4 sm:px-6 lg:px-10 xl:px-12">
        <Card className="bg-secondary/60 border-emerald-200/80">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-foreground">
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
