"use client";

import { useEffect, useState } from "react";
import { Clock, Play, PlaySquare, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { YouTubeVideoResult } from "@/types/database";

const SUGGESTED_TOPICS = [
  "Calculus Derivatives",
  "Newton's Laws of Motion",
  "Organic Chemistry Basics",
  "Data Structures and Algorithms",
  "Microeconomics Supply and Demand",
];

export function VideoLearningClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<YouTubeVideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeVideo, setActiveVideo] = useState<YouTubeVideoResult | null>(
    null
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    async function fetchVideos() {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const res = await fetch(
          `/api/youtube?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load videos.");
          setResults([]);
          return;
        }
        setResults(data.results || []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError("Could not reach the video search service.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
    return () => controller.abort();
  }, [debouncedQuery]);

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setDebouncedQuery(query.trim());
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any study topic (e.g., Quadratic Equations, Cell Biology)..."
              className="pl-9"
              aria-label="Search educational videos"
            />
          </div>
          <Button type="submit" disabled={loading || query.trim().length < 2}>
            Search Videos
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Try:
          </span>
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => {
                setQuery(topic);
                setDebouncedQuery(topic);
              }}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-secondary-foreground cursor-pointer"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Player Modal / Panel */}
      {activeVideo && (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="min-w-0 pr-4">
              <h2 className="font-semibold text-foreground truncate">
                {activeVideo.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                {activeVideo.channelTitle}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveVideo(null)}
              aria-label="Close video player"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.id}?rel=0&autoplay=1`}
              title={activeVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && <Alert variant="destructive">{error}</Alert>}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Initial State */}
      {!loading && !hasSearched && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-2">
          <PlaySquare className="mx-auto h-10 w-10 text-primary opacity-60" />
          <p className="font-medium text-foreground">
            Search for a topic to start learning
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Enter a subject, chapter, or concept above to find focused
            educational videos and watch them right here.
          </p>
        </div>
      )}

      {/* No Results State */}
      {!loading && hasSearched && !error && results.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center space-y-2">
          <p className="font-medium text-foreground">No videos found</p>
          <p className="text-sm text-muted-foreground">
            Try different keywords or a broader topic name.
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((video) => (
            <Card
              key={video.id}
              className="group overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md flex flex-col"
              onClick={() => setActiveVideo(video)}
            >
              <div className="relative aspect-video bg-muted overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </span>
                </div>
                {video.duration && (
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
                    <Clock className="h-3 w-3" />
                    {video.duration}
                  </span>
                )}
              </div>
              <CardContent className="p-4 space-y-1.5 flex-1">
                <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary">
                  {video.title}
                </h3>
                <p className="text-xs font-medium text-muted-foreground">
                  {video.channelTitle}
                </p>
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 pt-1">
                    {video.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
