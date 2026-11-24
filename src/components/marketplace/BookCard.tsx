import Link from "next/link";
import { ArrowRight, BookOpen, MapPin } from "lucide-react";
import { formatNPR } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import type { BookListing } from "@/types/database";

interface BookCardProps {
  book: BookListing;
}

export function BookCard({ book }: BookCardProps) {
  const conditionBg =
    book.condition === "Like New"
      ? "bg-[#065f46]"
      : book.condition === "Good"
      ? "bg-[#147a4b]"
      : "bg-[#b45309]";

  return (
    <Link href={`/books/${book.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden border-emerald-100 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        {/* Book Image */}
        <div className="relative aspect-[3/2] bg-muted overflow-hidden">
          {book.images && book.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.images[0]}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="h-10 w-10 opacity-40" />
            </div>
          )}

          {/* Solid Filled Condition Pill (White text, no outline) */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm ${conditionBg}`}
            >
              {book.condition}
            </span>
            {book.status === "sold" && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Sold
              </span>
            )}
          </div>
        </div>

        {/* Clean, Easy-to-Scan Book Info */}
        <CardContent className="flex flex-1 flex-col justify-between p-5 space-y-4">
          <div className="space-y-2">
            {/* Single Clean Category Pill + Education Level Text */}
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#147a4b] px-2.5 py-0.5 text-xs font-semibold text-white">
                {book.category?.name || book.subject}
              </span>
              <span className="text-xs font-medium text-[#52665a] truncate">
                {book.education_level}
              </span>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-[#0c1b13] line-clamp-2 leading-snug group-hover:text-[#065f46] transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-[#52665a] line-clamp-1 mt-1">
                by {book.author}
              </p>
            </div>
          </div>

          {/* Clear Price & Location Footer */}
          <div className="space-y-3 pt-3 border-t border-emerald-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-[#065f46]">
                  {formatNPR(book.price_npr)}
                </span>
                {book.original_price_npr &&
                  book.original_price_npr > book.price_npr && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatNPR(book.original_price_npr)}
                    </span>
                  )}
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#065f46] group-hover:translate-x-0.5 transition-transform">
                View
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>

            <p className="inline-flex items-center gap-1.5 text-xs text-[#52665a]">
              <MapPin className="h-3.5 w-3.5 text-[#147a4b] shrink-0" />
              <span className="truncate">{book.location}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
