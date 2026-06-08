import { execSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { Innertube } from "youtubei.js";
import type { MediaItem } from "@/lib/types";

export type YouTubeInput = { type: string; id: string };

const BIN_DIR = join(process.cwd(), "bin");
const YT_DLP_PATH = join(BIN_DIR, "yt-dlp");

// ── yt-dlp download + lookup ───────────────────────────────────────

function findYtDlp(): string {
  if (existsSync(YT_DLP_PATH)) return YT_DLP_PATH;
  try { execSync("yt-dlp --version", { stdio: "pipe", encoding: "utf-8" }); return "yt-dlp"; } catch {}
  return "";
}

// Try to download yt-dlp at runtime if missing
async function ensureYtDlp(): Promise<boolean> {
  if (findYtDlp()) return true;
  try {
    mkdirSync(BIN_DIR, { recursive: true });
    const urls = [
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux",
      "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
        if (!res.ok || !res.body) continue;
        const chunks: Uint8Array[] = [];
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        const buf = new Uint8Array(
          chunks.reduce((acc, c) => acc + c.length, 0),
        );
        let offset = 0;
        for (const c of chunks) { buf.set(c, offset); offset += c.length; }
        writeFileSync(YT_DLP_PATH, Buffer.from(buf), { mode: 0o755 });
        return existsSync(YT_DLP_PATH);
      } catch {}
    }
  } catch {}
  return false;
}

// ── helpers ─────────────────────────────────────────────────────────

const QUALITY: Record<string, string> = {
  "2160": "4K", "1440": "1440p", "1080": "1080p", "720": "720p",
  "480": "480p", "360": "360p", "240": "240p", "144": "144p",
};

function qLabel(l: string | undefined, h: number): string {
  return l || QUALITY[String(h)] || `${h}p`;
}

function extractVideoId(input: string): string | null {
  const p = "[a-zA-Z0-9_-]{10,12}";
  for (const re of [
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.|music\\.)?youtube\\.com\\/watch\\?v=(${p})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/shorts\\/(${p})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtu\\.be\\/(${p})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/embed\\/(${p})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/live\\/(${p})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/v\\/(${p})`),
    new RegExp(`^(${p})$`),
  ]) { const m = input.match(re); if (m) return m[1]; }
  if (/youtube\.com|youtu\.be/.test(input)) {
    const m = input.match(/[?&]v=([a-zA-Z0-9_-]{10,12})/);
    if (m) return m[1];
  }
  return null;
}

// ── Strategy 1: yt-dlp ─────────────────────────────────────────────

async function tryYtDlp(videoUrl: string): Promise<{ items: MediaItem[]; title: string } | null> {
  const ytDlp = findYtDlp();
  if (!ytDlp) return null;
  const clients = [
    "",
    "youtube:player_client=android",
    "youtube:player_client=ios",
    "youtube:player_client=web_embedded",
  ];
  for (const client of clients) {
    try {
      const nodePath = process.execPath;
      const args = client ? `--extractor-args "${client}"` : "";
      const raw = execSync(`${ytDlp} --js-runtimes node:${nodePath} -j --no-check-certificate ${args} "${videoUrl}"`, {
        timeout: 30000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8",
      });
      const data = JSON.parse(raw);
      if (!data?.formats) continue;
      const thumbnail = data.thumbnail || "";
      const title = data.title || "YouTube Video";
      const seen = new Set<number>();
      const items: MediaItem[] = [];
      for (const f of (data.formats || []).sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))) {
        if (!f.url || !f.height || !f.acodec || f.acodec === "none") continue;
        const res = parseInt(f.height);
        if (res > 0 && !seen.has(res)) { seen.add(res); items.push({ type: "video", thumbnail, url: f.url, label: `Video ${QUALITY[String(res)] || `${res}p`}` }); }
      }
      const audio = (data.formats || []).filter((f: any) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none") && f.url)
        .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));
      if (audio.length) items.push({ type: "video", thumbnail, url: audio[0].url, label: `MP3 (${audio[0].abr || 128}kbps)` });
      if (items.length) return { items, title };
    } catch {}
  }
  return null;
}

// ── Strategy 2: youtubei.js ─────────────────────────────────────────

let innertube: Innertube | null = null;

async function getYt(): Promise<Innertube> {
  if (!innertube) innertube = await Innertube.create({ lang: "en", retrieve_player: true });
  return innertube;
}

async function buildItems(formats: any[], adaptive: any[], player: any, thumbnail: string): Promise<MediaItem[]> {
  const getUrl = async (f: any): Promise<string | null> => {
    if (f.url) return f.url;
    if (player) { try { const d = await f.decipher(player); if (d) return d; } catch {} }
    for (const k of ["cipher", "signature_cipher"]) {
      try { const p = new URLSearchParams(f[k]); const u = p.get("url"); if (u) return u; } catch {}
    }
    return null;
  };
  const seenRes = new Set<number>();
  const seenUrls = new Set<string>();
  const items: MediaItem[] = [];

  for (const f of (formats || []).filter((f: any) => f.has_video !== false && f.has_audio !== false)
    .sort((a: any, b: any) => (b.height || 0) - (a.height || 0))) {
    const url = await getUrl(f);
    if (!url || seenUrls.has(url)) continue;
    const res = f.height || 0;
    if (res > 0 && !seenRes.has(res)) { seenRes.add(res); seenUrls.add(url); items.push({ type: "video", thumbnail, url, label: `Video ${qLabel(f.quality_label, res)}` }); }
  }

  if (!items.length) {
    for (const f of (adaptive || []).filter((f: any) => f.has_video !== false).sort((a: any, b: any) => (b.height || 0) - (a.height || 0))) {
      const url = await getUrl(f);
      if (!url || seenUrls.has(url)) continue;
      const res = f.height || 0;
      if (res > 0 && !seenRes.has(res)) { seenRes.add(res); seenUrls.add(url); items.push({ type: "video", thumbnail, url, label: `Video ${qLabel(f.quality_label, res)}` }); }
    }
  }

  if (!items.length) {
    for (const f of [...(formats || []), ...(adaptive || [])].filter((f: any) => f.url)) {
      const url = await getUrl(f);
      if (!url || seenUrls.has(url)) continue;
      seenUrls.add(url);
      items.push({ type: "video", thumbnail, url, label: f.has_video ? "Video" : "Audio" });
    }
  }

  for (const f of (adaptive || []).filter((f: any) => f.has_audio !== false && f.has_video === false)
    .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))) {
    if (items.some((i) => i.label?.startsWith("MP3"))) break;
    const url = await getUrl(f);
    if (!url || seenUrls.has(url)) continue;
    seenUrls.add(url);
    items.push({ type: "video", thumbnail, url, label: `MP3 (${Math.round((f.bitrate || 128000) / 1000)}kbps)` });
  }
  return items;
}

async function tryYoutubeJs(videoId: string): Promise<{ items: MediaItem[]; title: string } | null> {
  try {
    const yt = await getYt();
    for (const client of ["ANDROID", "IOS", "WEB_EMBEDDED", "WEB"] as const) {
      try {
        const info = await yt.getInfo(videoId, { client });
        const sd = info?.streaming_data;
        if (!sd?.formats?.length && !sd?.adaptive_formats?.length) continue;
        const title = info.basic_info?.title || "YouTube Video";
        const thumbs = info.basic_info?.thumbnail;
        const thumbnail = thumbs?.length ? thumbs[thumbs.length - 1].url : "";
        const items = await buildItems(sd!.formats || [], sd!.adaptive_formats || [], yt.session.player, thumbnail);
        if (items.length) return { items, title };
      } catch {}
    }
  } catch {}
  return null;
}

// ── Strategy 3: direct InnerTube API ────────────────────────────────

async function tryDirectApi(videoId: string): Promise<{ items: MediaItem[]; title: string } | null> {
  const clients: [string, string][] = [
    ["ANDROID", "19.09.37"], ["IOS", "19.09.37"], ["WEB_EMBEDDED", "1.20240311.00.00"],
  ];
  for (const [name, ver] of clients) {
    try {
      const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36" },
        body: JSON.stringify({ context: { client: { clientName: name, clientVersion: ver, hl: "en", gl: "US" } }, videoId, racyCheckOk: true, contentCheckOk: true }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const sd = data?.streamingData;
      if (!sd?.formats?.length && !sd?.adaptiveFormats?.length) continue;
      const title = data?.videoDetails?.title || "YouTube Video";
      const thumbs = data?.videoDetails?.thumbnail?.thumbnails;
      const thumbnail = thumbs?.length ? thumbs[thumbs.length - 1].url : "";
      const mapF = (f: any) => ({ url: f.url, height: f.height, bitrate: f.bitrate, quality_label: f.qualityLabel, has_video: f.mimeType?.startsWith("video/"), has_audio: f.mimeType?.startsWith("audio/") || !!f.audioQuality });
      const items = await buildItems((sd.formats || []).map(mapF), (sd.adaptiveFormats || []).map(mapF), null, thumbnail);
      if (items.length) return { items, title };
    } catch {}
  }
  return null;
}

// ── Strategy 4: Piped API (third-party proxy, bypasses IP blocks) ──

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.smnz.de",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.lunar.icu",
  "https://pipedapi.privacydev.net",
];

async function tryPiped(videoId: string): Promise<{ items: MediaItem[]; title: string } | null> {
  for (const base of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${base}/streams/${videoId}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const title = data.title || "YouTube Video";
      const thumbnail = data.thumbnailUrl || "";
      const seen = new Set<string>();
      const items: MediaItem[] = [];
      for (const s of [...(data.videoStreams || []), ...(data.audioStreams || [])]) {
        if (!s.url || seen.has(s.url)) continue;
        seen.add(s.url);
        if (s.audioOnly) {
          const bitrate = /(\d+)\s*kbps/.exec(s.quality);
          items.push({ type: "video", thumbnail, url: s.url, label: `MP3 (${bitrate?.[1] || 128}kbps)` });
        } else {
          items.push({ type: "video", thumbnail, url: s.url, label: `Video ${s.quality || ""}` });
        }
      }
      if (items.length) return { items, title };
    } catch (e) { console.log(`[PIPED] ${base} failed:`, (e as Error)?.message || e); }
  }
  return null;
}

// ── Strategy 5: Invidious API (alternative proxy frontend) ─────────

const INVIDIOUS_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.snopyta.org",
  "https://yewtu.be",
  "https://inv.tux.pizza",
  "https://invidious.privacydev.net",
  "https://vid.puffyan.us",
];

async function tryInvidious(videoId: string): Promise<{ items: MediaItem[]; title: string } | null> {
  for (const base of INVIDIOUS_INSTANCES) {
    try {
      const res = await fetch(`${base}/api/v1/videos/${videoId}`, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const data = await res.json();
      const title = data.title || "YouTube Video";
      const thumbs = data.videoThumbnails || [];
      const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : "";
      const seen = new Set<string>();
      const items: MediaItem[] = [];
      for (const f of [...(data.formatStreams || []), ...(data.adaptiveFormats || [])]) {
        if (!f.url || seen.has(f.url)) continue;
        seen.add(f.url);
        if (f.encoding?.startsWith("audio/") || f.type?.startsWith("audio/") || f.audioTrack) {
          items.push({ type: "video", thumbnail, url: f.url, label: `MP3 (${Math.round((f.bitRate || 128000) / 1000)}kbps)` });
        } else {
          items.push({ type: "video", thumbnail, url: f.url, label: `Video ${f.qualityLabel || `${f.resolution || ""}`}` });
        }
      }
      if (items.length) return { items, title };
    } catch (e) { console.log(`[INVIDIOUS] ${base} failed:`, (e as Error)?.message || e); }
  }
  return null;
}

// ── Main ────────────────────────────────────────────────────────────

export async function downloadYouTube(input: YouTubeInput) {
  const { id } = input;
  const videoId = extractVideoId(id);
  if (!videoId) throw new Error("Could not recognize a YouTube video in that link.");

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  await ensureYtDlp();

  const r1 = await tryYtDlp(videoUrl);
  if (r1) return r1;

  const r2 = await tryYoutubeJs(videoId);
  if (r2) return r2;

  const r3 = await tryDirectApi(videoId);
  if (r3) return r3;

  const r4 = await tryPiped(videoId);
  if (r4) return r4;

  const r5 = await tryInvidious(videoId);
  if (r5) return r5;

  throw new Error("Could not extract a downloadable URL for this video.");
}
