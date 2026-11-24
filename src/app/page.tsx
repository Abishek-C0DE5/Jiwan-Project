import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Play,
  PlaySquare,
  ShieldCheck,
  Sparkles,
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
      {/* Creative Editorial Luxury-Emerald Hero */}
      <section className="relative overflow-hidden border-b border-emerald-950/20 bg-[#032219] text-white">
        {/* Atmospheric background layers */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.22),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(217,119,6,0.12),transparent_45%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-12">
          <div className="grid grid-cols-1 items-center gap-10 xl:grid-cols-12">
            {/* Left Editorial Column */}
            <div className="xl:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-900/50 px-3.5 py-1.5 text-xs font-semibold tracking-wider text-emerald-100 uppercase">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                The Student Commons
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl xl:text-6xl leading-[1.05]">
                Where every textbook finds its{" "}
                <span className="text-emerald-300 italic font-bold">
                  next scholar.
                </span>
              </h1>

              <p className="text-base text-emerald-100/80 sm:text-lg max-w-2xl leading-relaxed">
                Trade second-hand textbooks in NPR without middlemen, publish
                structured study notes or PDFs, and master tough chapters with
                focused video lessons—all inside one calm workspace.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href="/marketplace">
                  <Button
                    size="lg"
                    className="bg-emerald-400 text-emerald-950 hover:bg-emerald-300 font-bold shadow-md"
                  >
                    Explore Marketplace
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/notes">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-emerald-300/30 bg-white/5 text-white hover:bg-white/15"
                  >
                    Open Study Notes
                  </Button>
                </Link>
                <Link href="/learn">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="text-emerald-100 hover:bg-white/10 hover:text-white"
                  >
                    <PlaySquare className="h-4 w-4" />
                    Video Lessons
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-3 text-xs text-emerald-200/80">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Zero listing fees
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Private student inquiries
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Verified PDF &amp; video hub
                </span>
              </div>
            </div>

            {/* Right Interactive Bento Showcase */}
            <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Showcase Card 1: Marketplace */}
              <Link
                href="/marketplace"
                className="group rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.11] sm:col-span-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">
                      <BookOpen className="h-3 w-3" /> Marketplace
                    </span>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-200 transition-colors">
                      Second-Hand Textbooks in NPR
                    </h3>
                    <p className="text-xs text-emerald-100/75 leading-relaxed">
                      Filter by subject, condition, and city. Save favourites and
                      message sellers directly.
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-300/25 bg-emerald-950/70 px-3 py-2 text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-300/80">
                      Save up to
                    </p>
                    <p className="text-lg font-extrabold text-emerald-300">
                      60%
                    </p>
                  </div>
                </div>
              </Link>

              {/* Showcase Card 2: Study Notes */}
              <Link
                href="/notes"
                className="group rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.11]"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200">
                  <FileText className="h-3 w-3" /> Study Notes
                </span>
                <h3 className="mt-3 text-base font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Write &amp; Upload PDFs
                </h3>
                <p className="mt-1 text-xs text-emerald-100/75 leading-relaxed">
                  Clean markdown editor + private-bucket PDF sharing with instant
                  preview.
                </p>
              </Link>

              {/* Showcase Card 3: Video Learning */}
              <Link
                href="/learn"
                className="group rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.11]"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-100">
                  <Play className="h-3 w-3 fill-current" /> Learn
                </span>
                <h3 className="mt-3 text-base font-bold text-white group-hover:text-emerald-200 transition-colors">
                  Distraction-Free Videos
                </h3>
                <p className="mt-1 text-xs text-emerald-100/75 leading-relaxed">
                  Search educational lessons and watch inside a clean embedded
                  player.
                </p>
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
