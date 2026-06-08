import { execSync } from "child_process";
import { Innertube } from "youtubei.js";
import type { MediaItem } from "@/lib/types";

export type YouTubeInput = { type: string; id: string };

// ── yt-dlp ──────────────────────────────────────────────────────────

function hasYtDlp(): boolean {
  try {
    execSync("yt-dlp --version", { stdio: "pipe", encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

const QUALITY_LABELS: Record<string, string> = {
  "2160": "4K",
  "1440": "1440p",
  "1080": "1080p",
  "720": "720p",
  "480": "480p",
  "360": "360p",
  "240": "240p",
  "144": "144p",
};

async function fetchWithYtDlp(videoUrl: string) {
  const out = execSync(
    `yt-dlp -j --no-check-certificate "${videoUrl}"`,
    { timeout: 30000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8" },
  );
  const data = JSON.parse(out);
  if (!data) throw new Error("Could not retrieve video info.");

  const thumbnail = data.thumbnail || "";
  const title = data.title || "YouTube Video";
  const formats: any[] = data.formats || [];

  const seenRes = new Set<number>();
  const items: MediaItem[] = [];

  const combined = formats
    .filter((f: any) => f.url && f.height && parseInt(f.height) > 0 && f.acodec && f.acodec !== "none")
    .sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));

  for (const f of combined) {
    const res = parseInt(f.height) || 0;
    if (res > 0 && !seenRes.has(res)) {
      seenRes.add(res);
      items.push({
        type: "video",
        thumbnail,
        url: f.url,
        label: `Video ${QUALITY_LABELS[String(res)] || `${res}p`}`,
      });
    }
  }

  const audio = formats
    .filter((f: any) => (f.acodec && f.acodec !== "none") && (!f.vcodec || f.vcodec === "none") && f.url)
    .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));

  if (audio.length > 0) {
    items.push({
      type: "video",
      thumbnail,
      url: audio[0].url,
      label: `MP3 (${audio[0].abr || 128}kbps)`,
    });
  }

  return { items, title };
}

// ── youtubei.js fallback ────────────────────────────────────────────

let innertube: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
  if (!innertube) {
    innertube = await Innertube.create({ lang: "en", retrieve_player: true });
  }
  return innertube;
}

function extractVideoId(input: string): string | null {
  const idPattern = "[a-zA-Z0-9_-]{10,12}";
  const patterns = [
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.|music\\.)?youtube\\.com\\/watch\\?v=(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/shorts\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtu\\.be\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/embed\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/live\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/v\\/(${idPattern})`),
    new RegExp(`^(${idPattern})$`),
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  if (input.includes("youtube.com") || input.includes("youtu.be")) {
    const m = input.match(/[?&]v=([a-zA-Z0-9_-]{10,12})/);
    if (m) return m[1];
  }
  return null;
}

async function buildItems(formats: any[], adaptive: any[], player: any, thumbnail: string): Promise<MediaItem[]> {
  const getUrl = async (f: any): Promise<string | null> => {
    if (f.url) return f.url;
    if (player) {
      try { const d = await f.decipher(player); if (d) return d; } catch {}
    }
    for (const key of ["cipher", "signature_cipher"]) {
      try {
        const p = new URLSearchParams(f[key]);
        const u = p.get("url");
        if (u) return u;
      } catch {}
    }
    return null;
  };

  const seenRes = new Set<number>();
  const seenUrls = new Set<string>();
  const items: MediaItem[] = [];

  const combined = (formats || []).filter((f: any) => f.has_video !== false && f.has_audio !== false)
    .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

  for (const f of combined) {
    const url = await getUrl(f);
    if (!url || seenUrls.has(url)) continue;
    const res = f.height || 0;
    if (res > 0 && !seenRes.has(res)) { seenRes.add(res); seenUrls.add(url); items.push({ type: "video", thumbnail, url, label: `Video ${QUALITY_LABELS[String(res)] || `${res}p`}` }); }
  }

  if (!items.length) {
    const videoOnly = (adaptive || []).filter((f: any) => f.has_video !== false)
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
    for (const f of videoOnly) {
      const url = await getUrl(f);
      if (!url || seenUrls.has(url)) continue;
      const res = f.height || 0;
      if (res > 0 && !seenRes.has(res)) { seenRes.add(res); seenUrls.add(url); items.push({ type: "video", thumbnail, url, label: `Video ${QUALITY_LABELS[String(res)] || `${res}p`}` }); }
    }
  }

  const audio = (adaptive || []).filter((f: any) => f.has_audio !== false && f.has_video === false)
    .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

  for (const f of audio) {
    if (items.some((i) => i.label?.startsWith("MP3"))) break;
    const url = await getUrl(f);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    items.push({ type: "video", thumbnail, url, label: `MP3 (${Math.round((f.bitrate || 128000) / 1000)}kbps)` });
  }

  return items;
}

// ── Main ────────────────────────────────────────────────────────────

export async function downloadYouTube(input: YouTubeInput) {
  const { id } = input;
  const videoId = extractVideoId(id);
  if (!videoId) throw new Error("Could not recognize a YouTube video in that link.");

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Strategy 1: yt-dlp (most reliable)
  if (hasYtDlp()) {
    return await fetchWithYtDlp(videoUrl);
  }

  // Strategy 2: youtubei.js
  try {
    const yt = await getInnertube();
    for (const client of ["ANDROID", "IOS", "WEB_EMBEDDED"] as const) {
      try {
        const info = await yt.getInfo(videoId, { client });
        const sd = info?.streaming_data;
        if (!sd?.formats?.length && !sd?.adaptive_formats?.length) continue;
        const title = info.basic_info?.title || "YouTube Video";
        const thumbs = info.basic_info?.thumbnail;
        const thumbnail = thumbs?.length ? thumbs[thumbs.length - 1].url : "";
        const items = await buildItems(sd!.formats || [], sd!.adaptive_formats || [], yt.session.player, thumbnail);
        if (items.length > 0) return { items, title };
      } catch {}
    }
  } catch {}

  throw new Error(
    hasYtDlp()
      ? "yt-dlp failed to extract video. Try a different video."
      : "yt-dlp is not installed on this server. Install with: pip install yt-dlp",
  );
}
