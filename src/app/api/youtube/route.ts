import { NextResponse } from "next/server";
import type { YouTubeVideoResult } from "@/types/database";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const searchCache = new Map<
  string,
  { timestamp: number; results: YouTubeVideoResult[] }
>();

function formatIsoDuration(iso: string | undefined): string | null {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${minutes}:${pad(seconds)}`;
}

interface YouTubeSearchItem {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    publishedAt?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
    };
  };
}

interface YouTubeVideoItem {
  id?: string;
  contentDetails?: {
    duration?: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = (searchParams.get("q") || "").trim();

  if (!rawQuery || rawQuery.length < 2) {
    return NextResponse.json(
      { error: "Please enter at least 2 characters to search." },
      { status: 400 }
    );
  }

  const normalizedKey = rawQuery.toLowerCase();
  const cached = searchCache.get(normalizedKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ results: cached.results, cached: true });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "YouTube Data API is not configured. Add YOUTUBE_API_KEY to your server environment variables.",
      },
      { status: 503 }
    );
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", rawQuery);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("safeSearch", "strict");
    searchUrl.searchParams.set("maxResults", "12");
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetch(searchUrl.toString(), {
      next: { revalidate: 900 },
    });

    if (!searchRes.ok) {
      const errBody = await searchRes.json().catch(() => ({}));
      const reason = errBody?.error?.errors?.[0]?.reason;
      if (searchRes.status === 403 && reason === "quotaExceeded") {
        return NextResponse.json(
          {
            error:
              "Daily YouTube search quota has been reached. Please try again later.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error:
            errBody?.error?.message ||
            "Unable to fetch videos from YouTube right now.",
        },
        { status: searchRes.status }
      );
    }

    const searchData = (await searchRes.json()) as {
      items?: YouTubeSearchItem[];
    };
    const items = searchData.items || [];
    const videoIds = items
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    const durationMap = new Map<string, string | null>();
    if (videoIds.length > 0) {
      const detailsUrl = new URL(
        "https://www.googleapis.com/youtube/v3/videos"
      );
      detailsUrl.searchParams.set("part", "contentDetails");
      detailsUrl.searchParams.set("id", videoIds.join(","));
      detailsUrl.searchParams.set("key", apiKey);

      const detailsRes = await fetch(detailsUrl.toString());
      if (detailsRes.ok) {
        const detailsData = (await detailsRes.json()) as {
          items?: YouTubeVideoItem[];
        };
        for (const v of detailsData.items || []) {
          if (v.id) {
            durationMap.set(
              v.id,
              formatIsoDuration(v.contentDetails?.duration)
            );
          }
        }
      }
    }

    const results: YouTubeVideoResult[] = items
      .filter((item) => Boolean(item.id?.videoId))
      .map((item) => {
        const id = item.id!.videoId!;
        return {
          id,
          title: item.snippet?.title || "Untitled video",
          description: item.snippet?.description || "",
          channelTitle: item.snippet?.channelTitle || "YouTube Channel",
          publishedAt: item.snippet?.publishedAt || "",
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          duration: durationMap.get(id) ?? null,
        };
      });

    searchCache.set(normalizedKey, { timestamp: Date.now(), results });

    return NextResponse.json({ results, cached: false });
  } catch {
    return NextResponse.json(
      { error: "Network error while contacting YouTube API." },
      { status: 500 }
    );
  }
}
