import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { Innertube } from "youtubei.js";
import type { MediaItem } from "@/lib/types";

export type YouTubeInput = { type: string; id: string };

const COOKIES_PATH = join(process.cwd(), "cookies.txt");

// ── yt-dlp lookup ──────────────────────────────────────────────────

function findYtDlp(): string {
  try { execSync("yt-dlp --version", { stdio: "pipe", encoding: "utf-8" }); return "yt-dlp"; } catch {}
  return "";
}

async function ensureYtDlp(): Promise<boolean> {
  if (findYtDlp()) return true;
  try {
    execSync("pip3 install --break-system-packages yt-dlp 2>/dev/null || pip3 install yt-dlp 2>/dev/null", { stdio: "pipe", timeout: 60000 });
  } catch {}
  return findYtDlp() !== "";
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
      const hasCookies = existsSync(COOKIES_PATH);
      const cookieFlag = hasCookies ? `--cookies "${COOKIES_PATH}"` : "";
      const jsRuntimeFlag = `--js-runtimes node:${nodePath}`;
      const args = client ? `--extractor-args "${client}"` : "";
      const raw = execSync(`${ytDlp} ${cookieFlag} ${jsRuntimeFlag} -j --no-check-certificate ${args} "${videoUrl}"`, {
        timeout: 30000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8",
      });
      const data = JSON.parse(raw);
      if (!data?.formats) continue;
      const thumbnail = data.thumbnail || "";
      const title = data.title || "YouTube Video";
      const seenUrls = new Set<string>();
      const items: MediaItem[] = [];
      for (const f of (data.formats || []).sort((a: any, b: any) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0))) {
        if (!f.url || seenUrls.has(f.url)) continue;
        const hasVideo = f.vcodec && f.vcodec !== "none";
        const hasAudio = f.acodec && f.acodec !== "none";
        if (hasVideo) {
          seenUrls.add(f.url);
          items.push({ type: "video", thumbnail, url: f.url, label: `Video ${QUALITY[String(f.height)] || `${f.height}p`}` });
        }
      }
      const audio = (data.formats || []).filter((f: any) => f.acodec && f.acodec !== "none" && (!f.vcodec || f.vcodec === "none") && f.url && !seenUrls.has(f.url))
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
  "https://pipedapi-libre.kavin.rocks",
  "https://pipedapi.leptons.xyz",
  "https://pipedapi.nosebs.ru",
  "https://piped-api.privacy.com.de",
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.owo.si",
  "https://pipedapi.ducks.party",
  "https://pipedapi.drgns.space",
  "https://api.piped.private.coffee",
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
  "https://yewtu.be",
  "https://vid.puffyan.us",
  "https://yt.artemislena.eu",
  "https://invidious.flokinet.to",
  "https://invidious.tiekoetter.com",
  "https://invidious.slipfox.xyz",
  "https://invidious.projectsegfau.lt",
  "https://inv.pistasjis.net",
  "https://vid.priv.au",
  "https://iv.melmac.space",
  "https://iv.ggtyler.dev",
  "https://inv.zzls.xyz",
  "https://invidious.protokolla.fi",
  "https://iv.nboeck.de",
  "https://invidious.private.coffee",
  "https://yt.drgnz.club",
  "https://invidious.asir.dev",
  "https://iv.datura.network",
  "https://invidious.fdn.fr",
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

  console.log("[YT] Trying strategies for", videoId);

  await ensureYtDlp();

  const strategies = [
    ["Piped", () => tryPiped(videoId)],
    ["Invidious", () => tryInvidious(videoId)],
    ["yt-dlp", () => tryYtDlp(videoUrl)],
    ["youtubei.js", () => tryYoutubeJs(videoId)],
    ["Direct API", () => tryDirectApi(videoId)],
  ] as const;

  for (const [name, fn] of strategies) {
    console.log(`[YT] Trying ${name}...`);
    try {
      const result = await fn();
      if (result) {
        console.log(`[YT] ${name} succeeded`);
        return result;
      }
      console.log(`[YT] ${name} returned nothing`);
    } catch (e) {
      console.log(`[YT] ${name} threw:`, (e as Error)?.message || e);
    }
  }

  throw new Error("Could not extract a downloadable URL for this video.");
}
