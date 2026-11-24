"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

interface BookGalleryProps {
  images: string[];
  title: string;
}

export function BookGallery({ images, title }: BookGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <BookOpen className="h-14 w-14 opacity-40" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[selectedIndex] || images[0]}
          alt={`${title} photo ${selectedIndex + 1}`}
          className="h-full w-full object-contain bg-card"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 cursor-pointer ${
                idx === selectedIndex ? "border-primary" : "border-border opacity-70 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
