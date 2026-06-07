import { Innertube } from "youtubei.js";
import type { MediaItem } from "@/lib/types";

export type YouTubeInput = { type: string; id: string };

let innertube: Innertube | null = null;

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

async function getFormatUrl(
  f: any,
  player: any,
): Promise<string | null> {
  if (f.url) return f.url;

  try {
    const deciphered = await f.decipher(player);
    if (deciphered) return deciphered;
  } catch {}

  if (f.cipher) {
    try {
      const params = new URLSearchParams(f.cipher);
      const u = params.get("url");
      if (u) return u;
    } catch {}
  }
  if (f.signature_cipher) {
    try {
      const params = new URLSearchParams(f.signature_cipher);
      const u = params.get("url");
      if (u) return u;
    } catch {}
  }
  return null;
}

export async function downloadYouTube(input: YouTubeInput) {
  const { id } = input;

  const videoId = extractVideoId(id);
  if (!videoId)
    throw new Error("Could not recognize a YouTube video in that link.");

  const yt = await getInnertube();

  let info;
  const clients: ("ANDROID" | "IOS" | "WEB_EMBEDDED")[] = [
    "ANDROID",
    "IOS",
    "WEB_EMBEDDED",
  ];

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

  if (!info?.basic_info) {
    throw new Error(
      "Could not get video information. YouTube may be blocking the request.",
    );
  }

  const title = info.basic_info.title || "YouTube Video";
  const thumbnails = info.basic_info.thumbnail;
  const thumbnail =
    thumbnails && thumbnails.length > 0
      ? thumbnails[thumbnails.length - 1].url
      : "";

  const player = yt.session.player;
  const formats = info.streaming_data?.formats || [];
  const adaptive = info.streaming_data?.adaptive_formats || [];

  const seenResolutions = new Set<number>();
  const seenUrls = new Set<string>();
  const items: MediaItem[] = [];

  const combined = formats
    .filter((f) => f.has_video && f.has_audio)
    .sort((a, b) => (b.height || 0) - (a.height || 0));

  for (const f of combined) {
    const url = await getFormatUrl(f, player);
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
      .filter((f) => f.has_video)
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    for (const f of videoOnly) {
      const url = await getFormatUrl(f, player);
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
    .filter((f) => f.has_audio && !f.has_video)
    .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

  for (const f of audio) {
    if (items.some((i) => i.label?.startsWith("MP3"))) break;

    const url = await getFormatUrl(f, player);
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

  if (items.length === 0) {
    const anyFormat = [...formats, ...adaptive].filter((f) => f.url);
    for (const f of anyFormat) {
      const url = await getFormatUrl(f, player);
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      items.push({
        type: "video",
        thumbnail,
        url,
        label: f.has_video ? `Video` : `Audio`,
      });
    }
  }

  if (items.length === 0) {
    throw new Error("Could not extract a downloadable URL for this video.");
  }

  return { items, title };
}
