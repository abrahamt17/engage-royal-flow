import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ImportResponse = {
  success: boolean;
  platform: string;
  importStatus: "complete" | "partial" | "manual_required";
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    watch_time_pct?: number;
  };
  metadata?: {
    title?: string;
    author_name?: string;
    thumbnail_url?: string;
    published_at?: string;
    external_id?: string;
  };
  message?: string;
};

function detectPlatform(url: string): string {
  const normalized = url.toLowerCase();
  if (normalized.includes("youtube.com") || normalized.includes("youtu.be")) return "YouTube";
  if (normalized.includes("instagram.com")) return "Instagram";
  if (normalized.includes("tiktok.com")) return "TikTok";
  if (normalized.includes("twitter.com") || normalized.includes("x.com")) return "X / Twitter";
  if (normalized.includes("twitch.tv")) return "Twitch";
  return "Unknown";
}

function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

async function importYouTubeMetrics(url: string): Promise<ImportResponse> {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return {
      success: false,
      platform: "YouTube",
      importStatus: "manual_required",
      metrics: {},
      message: "Could not extract a YouTube video ID from that URL.",
    };
  }

  const apiKey = Deno.env.get("YOUTUBE_API_KEY");

  if (!apiKey) {
    return {
      success: true,
      platform: "YouTube",
      importStatus: "partial",
      metrics: {},
      metadata: { external_id: videoId },
      message: "YouTube detected, but YOUTUBE_API_KEY is not configured. Enter metrics manually or add the API key to enable autofill.",
    };
  }

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`YouTube API error: ${text}`);
  }

  const data = await res.json();
  const item = data.items?.[0];

  if (!item) {
    return {
      success: false,
      platform: "YouTube",
      importStatus: "manual_required",
      metrics: {},
      metadata: { external_id: videoId },
      message: "No YouTube video was found for that URL.",
    };
  }

  return {
    success: true,
    platform: "YouTube",
    importStatus: "partial",
    metrics: {
      views: Number(item.statistics?.viewCount ?? 0),
      likes: Number(item.statistics?.likeCount ?? 0),
      comments: Number(item.statistics?.commentCount ?? 0),
    },
    metadata: {
      title: item.snippet?.title,
      author_name: item.snippet?.channelTitle,
      thumbnail_url: item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.default?.url,
      published_at: item.snippet?.publishedAt,
      external_id: videoId,
    },
    message: "Imported YouTube views, likes, and comments. Shares, saves, and watch time still need manual input.",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { content_url } = await req.json();

    if (!content_url || typeof content_url !== "string") {
      return new Response(JSON.stringify({ error: "content_url is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const platform = detectPlatform(content_url);
    let response: ImportResponse;

    switch (platform) {
      case "YouTube":
        response = await importYouTubeMetrics(content_url);
        break;
      case "Instagram":
      case "TikTok":
      case "X / Twitter":
      case "Twitch":
        response = {
          success: true,
          platform,
          importStatus: "manual_required",
          metrics: {},
          message: `${platform} import is not configured yet. Connect the platform API or enter metrics manually.`,
        };
        break;
      default:
        response = {
          success: false,
          platform: "Unknown",
          importStatus: "manual_required",
          metrics: {},
          message: "Unsupported or unrecognized content URL.",
        };
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown import error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
