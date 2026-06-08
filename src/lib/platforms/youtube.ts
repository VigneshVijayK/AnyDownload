import { Innertube } from "youtubei.js";
import type { MediaItem } from "@/lib/types";

export type YouTubeInput = { type: string; id: string };

let innertube: Innertube | null = null;

const INNERTUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
const INNERTUBE_URL = "https://www.youtube.com/youtubei/v1/player";

async function getInnertube(): Promise<Innertube> {
  if (!innertube) {
    innertube = await Innertube.create({
      lang: "en",
      retrieve_player: true,
    });
  }
  return innertube;
}

const QUALITY_LABELS: Record<number, string> = {
  2160: "4K",
  1440: "1440p",
  1080: "1080p",
  720: "720p",
  480: "480p",
  360: "360p",
  240: "240p",
  144: "144p",
};

function qualityLabel(label: string | undefined, height: number): string {
  if (label) return label;
  return QUALITY_LABELS[height] || `${height}p`;
}

function extractVideoId(input: string): string | null {
  const idPattern = "[a-zA-Z0-9_-]{10,12}";
  const patterns = [
    new RegExp(
      `(?:https?:\\/\\/)?(?:www\\.|m\\.|music\\.)?youtube\\.com\\/watch\\?v=(${idPattern})`,
    ),
    new RegExp(
      `(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/shorts\\/(${idPattern})`,
    ),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtu\\.be\\/(${idPattern})`),
    new RegExp(
      `(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/embed\\/(${idPattern})`,
    ),
    new RegExp(
      `(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/live\\/(${idPattern})`,
    ),
    new RegExp(
      `(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/v\\/(${idPattern})`,
    ),
    new RegExp(`^(${idPattern})$`),
  ];
  for (const pattern of patterns) {
    const m = input.match(pattern);
    if (m) return m[1];
  }
  if (input.includes("youtube.com") || input.includes("youtu.be")) {
    const looseMatch = input.match(/[?&]v=([a-zA-Z0-9_-]{10,12})/);
    if (looseMatch) return looseMatch[1];
  }
  return null;
}

async function directInnerTube(
  videoId: string,
  clientName: string,
  clientVersion: string,
): Promise<{
  formats: any[];
  adaptiveFormats: any[];
  title: string;
  thumbnail: string;
} | null> {
  try {
    const context = {
      client: { clientName, clientVersion, hl: "en", gl: "US" },
    };
    const body = JSON.stringify({ context, videoId, racyCheckOk: true, contentCheckOk: true });
    const res = await fetch(INNERTUBE_URL + "?key=" + INNERTUBE_API_KEY, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36",
      },
      body,
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const sd = data?.streamingData;
    if (!sd?.formats && !sd?.adaptiveFormats) return null;

    const title =
      data?.videoDetails?.title || data?.microformat?.playerMicroformatRenderer?.title?.simpleText || "YouTube Video";
    const thumbs = data?.videoDetails?.thumbnail?.thumbnails;
    const thumbnail = thumbs?.length ? thumbs[thumbs.length - 1].url : "";

    const mapFormat = (f: any) => ({
      url: f.url,
      mimeType: f.mimeType,
      width: f.width,
      height: f.height,
      bitrate: f.bitrate,
      qualityLabel: f.qualityLabel,
      contentLength: f.contentLength,
      has_video: f.mimeType?.startsWith("video/"),
      has_audio: f.mimeType?.startsWith("audio/") || f.audioQuality != null,
      fps: f.fps,
    });

    return {
      formats: (sd.formats || []).map(mapFormat),
      adaptiveFormats: (sd.adaptiveFormats || []).map(mapFormat),
      title,
      thumbnail,
    };
  } catch {
    return null;
  }
}

export async function downloadYouTube(input: YouTubeInput) {
  const { id } = input;
  const videoId = extractVideoId(id);
  if (!videoId) throw new Error("Could not recognize a YouTube video in that link.");

  // Strategy 1: youtubei.js
  try {
    const yt = await getInnertube();
    for (const client of ["ANDROID", "IOS", "WEB_EMBEDDED"] as const) {
      try {
        const info = await yt.getInfo(videoId, { client });
        const sd = info?.streaming_data;
        const ps = (info as any)?.playability_status;
        if (ps) console.error(`[youtubei.js ${client}] playability:`, ps.status, ps.reason);
        if (sd) console.error(`[youtubei.js ${client}] formats:`, sd.formats?.length, "adaptive:", sd.adaptive_formats?.length);
        if (!sd?.formats?.length && !sd?.adaptive_formats?.length)
          continue;

        const title = info.basic_info?.title || "YouTube Video";
        const thumbs = info.basic_info?.thumbnail;
        const thumbnail = thumbs?.length ? thumbs[thumbs.length - 1].url : "";
        const player = yt.session.player;

        const items = await buildItems(
          sd!.formats || [],
          sd!.adaptive_formats || [],
          player,
          thumbnail,
        );
        if (items.length > 0) return { items, title };
      } catch {}
    }
  } catch (e) {
    console.error("youtubei.js failed:", e);
  }

  // Strategy 2: direct InnerTube API (multiple clients)
  const clients: [string, string][] = [
    ["ANDROID", "19.09.37"],
    ["IOS", "19.09.37"],
    ["WEB_EMBEDDED", "1.20240311.00.00"],
  ];
  for (const [clientName, clientVersion] of clients) {
    const result = await directInnerTube(videoId, clientName, clientVersion);
    if (!result) continue;
    const { formats, adaptiveFormats, title, thumbnail } = result;
    const items = await buildItems(formats, adaptiveFormats, null, thumbnail);
    if (items.length > 0) return { items, title };
  }

  throw new Error("Could not extract a downloadable URL for this video.");
}

async function buildItems(
  formats: any[],
  adaptive: any[],
  player: any,
  thumbnail: string,
): Promise<MediaItem[]> {
  const getUrl = async (f: any): Promise<string | null> => {
    if (f.url) return f.url;
    if (player) {
      try {
        const d = await f.decipher(player);
        if (d) return d;
      } catch {}
    }
    for (const key of ["cipher", "signature_cipher"]) {
      try {
        const params = new URLSearchParams(f[key]);
        const u = params.get("url");
        if (u) return u;
      } catch {}
    }
    return null;
  };

  const seenResolutions = new Set<number>();
  const seenUrls = new Set<string>();
  const items: MediaItem[] = [];

  const byHeight = (a: any, b: any) => (b.height || 0) - (a.height || 0);

  const combined = (formats || [])
    .filter((f) => f.has_video !== false && f.has_audio !== false)
    .sort(byHeight);

  for (const f of combined) {
    const url = await getUrl(f);
    if (!url || seenUrls.has(url)) continue;
    const res = f.height || 0;
    if (res > 0 && !seenResolutions.has(res)) {
      seenResolutions.add(res);
      seenUrls.add(url);
      items.push({
        type: "video",
        thumbnail,
        url,
        label: `Video ${qualityLabel(f.quality_label, res)}`,
      });
    }
  }

  if (items.length === 0) {
    const videoOnly = (adaptive || [])
      .filter((f) => f.has_video !== false)
      .sort(byHeight);
    for (const f of videoOnly) {
      const url = await getUrl(f);
      if (!url || seenUrls.has(url)) continue;
      const res = f.height || 0;
      if (res > 0 && !seenResolutions.has(res)) {
        seenResolutions.add(res);
        seenUrls.add(url);
        items.push({
          type: "video",
          thumbnail,
          url,
          label: `Video ${qualityLabel(f.quality_label, res)}`,
        });
      }
    }
  }

  if (items.length === 0) {
    const anyFormat = [...(formats || []), ...(adaptive || [])].filter(
      (f) => f.url,
    );
    for (const f of anyFormat) {
      const url = await getUrl(f);
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      items.push({
        type: "video",
        thumbnail,
        url,
        label: f.has_video ? "Video" : "Audio",
      });
    }
  }

  const audio = (adaptive || [])
    .filter((f) => f.has_audio !== false && f.has_video === false)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  for (const f of audio) {
    if (items.some((i) => i.label?.startsWith("MP3"))) break;
    const url = await getUrl(f);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    const bitrate = Math.round((f.bitrate || 128000) / 1000);
    items.push({
      type: "video",
      thumbnail,
      url,
      label: `MP3 (${bitrate}kbps)`,
    });
  }

  return items;
}
