import Link from "next/link";
import { BookOpen, MapPin } from "lucide-react";
import { formatNPR } from "@/lib/utils/format";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BookListing } from "@/types/database";

interface BookCardProps {
  book: BookListing;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/books/${book.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          {book.images && book.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.images[0]}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <BookOpen className="h-10 w-10 opacity-40" />
            </div>
          )}

          <div className="absolute top-2.5 left-2.5 flex gap-1.5">
            <Badge className="bg-card/90 text-foreground backdrop-blur">
              {book.condition}
            </Badge>
            {book.status === "sold" && (
              <Badge variant="destructive">Sold</Badge>
            )}
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col justify-between p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary">
              {book.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {book.author} &middot; {book.subject}
            </p>
            <p className="text-xs text-muted-foreground">
              {book.education_level}
            </p>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-border/60">
            <div>
              <p className="text-base font-bold text-primary">
                {formatNPR(book.price_npr)}
              </p>
              {book.original_price_npr &&
                book.original_price_npr > book.price_npr && (
                  <p className="text-xs text-muted-foreground line-through">
                    {formatNPR(book.original_price_npr)}
                  </p>
                )}
            </div>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground max-w-[110px] truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {book.location}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
