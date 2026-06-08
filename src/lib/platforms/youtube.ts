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

async function getUrlFromFormat(f: any, player: any): Promise<string | null> {
  if (f.url) return f.url;
  try {
    const d = await f.decipher(player);
    if (d) return d;
  } catch {}
  for (const key of ["cipher", "signature_cipher"]) {
    try {
      const params = new URLSearchParams(f[key]);
      const u = params.get("url");
      if (u) return u;
    } catch {}
  }
  return null;
}

interface RawFormat {
  url?: string;
  mimeType?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  contentLength?: string;
  qualityLabel?: string;
  audioQuality?: string;
  hasVideo?: boolean;
  hasAudio?: boolean;
  fps?: number;
}

async function fetchWithInnerTube(
  videoId: string,
): Promise<{ formats: RawFormat[]; adaptiveFormats: RawFormat[] } | null> {
  try {
    const res = await fetch(INNERTUBE_URL + "?key=" + INNERTUBE_API_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: "19.09.37",
            androidSdkVersion: 31,
          },
        },
        videoId,
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.playabilityStatus?.status !== "OK") return null;
    const sd = data.streamingData;
    if (!sd) return null;
    const formats: RawFormat[] = (sd.formats || []).map((f: any) => ({
      url: f.url,
      mimeType: f.mimeType,
      width: f.width,
      height: f.height,
      bitrate: f.bitrate,
      contentLength: f.contentLength,
      qualityLabel: f.qualityLabel,
      hasVideo: true,
      hasAudio: true,
      fps: f.fps,
    }));
    const adaptiveFormats: RawFormat[] = (sd.adaptiveFormats || []).map(
      (f: any) => ({
        url: f.url,
        mimeType: f.mimeType,
        width: f.width,
        height: f.height,
        bitrate: f.bitrate,
        contentLength: f.contentLength,
        qualityLabel: f.qualityLabel,
        audioQuality: f.audioQuality,
        hasVideo: f.mimeType?.startsWith("video/"),
        hasAudio: f.mimeType?.startsWith("audio/"),
        fps: f.fps,
      }),
    );
    return { formats, adaptiveFormats };
  } catch {
    return null;
  }
}

export async function downloadYouTube(input: YouTubeInput) {
  const { id } = input;
  const videoId = extractVideoId(id);
  if (!videoId)
    throw new Error("Could not recognize a YouTube video in that link.");

  let title = "YouTube Video";
  let thumbnail = "";
  let formats: any[] = [];
  let adaptive: any[] = [];

  // Try youtubei.js first
  try {
    const yt = await getInnertube();
    const clients: ("ANDROID" | "IOS" | "WEB_EMBEDDED")[] = [
      "ANDROID",
      "IOS",
      "WEB_EMBEDDED",
    ];
    let info;
    for (const client of clients) {
      try {
        info = await yt.getInfo(videoId, { client });
        if (
          info?.streaming_data?.formats?.length ||
          info?.streaming_data?.adaptive_formats?.length
        ) {
          break;
        }
      } catch {
        continue;
      }
    }
    if (info?.basic_info) {
      title = info.basic_info.title || title;
      const thumbs = info.basic_info.thumbnail;
      if (thumbs?.length) thumbnail = thumbs[thumbs.length - 1].url;
    }
    if (info?.streaming_data) {
      formats = info.streaming_data.formats || [];
      adaptive = info.streaming_data.adaptive_formats || [];
    }
    const player = yt.session.player;

    const items = buildItems(formats, adaptive, player, thumbnail);
    if (items.length > 0) return { items, title };
  } catch (e) {
    console.error("youtubei.js failed, trying direct InnerTube API:", e);
  }

  // Fallback: direct InnerTube API
  const fallback = await fetchWithInnerTube(videoId);
  if (fallback) {
    formats = fallback.formats;
    adaptive = fallback.adaptiveFormats;
    const items = buildItems(formats, adaptive, null, thumbnail);
    if (items.length > 0) return { items, title };
  }

  throw new Error("Could not extract a downloadable URL for this video.");
}

function buildItems(
  formats: any[],
  adaptive: any[],
  player: any,
  thumbnail: string,
): MediaItem[] {
  const seenResolutions = new Set<number>();
  const seenUrls = new Set<string>();
  const items: MediaItem[] = [];

  const combined = formats
    .filter((f) => f.has_video !== false && f.has_audio !== false)
    .sort((a, b) => (b.height || 0) - (a.height || 0));

  for (const f of combined) {
    const url = f.url;
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
    const videoOnly = adaptive
      .filter((f) => f.has_video !== false)
      .sort((a, b) => (b.height || 0) - (a.height || 0));
    for (const f of videoOnly) {
      const url = f.url;
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

  const audio = adaptive
    .filter((f) => f.has_audio !== false && f.has_video === false)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  for (const f of audio) {
    if (items.some((i) => i.label?.startsWith("MP3"))) break;
    const url = f.url;
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
