import { execSync, exec } from "child_process";
import { promisify } from "util";
import type { MediaItem } from "@/lib/types";

const execAsync = promisify(exec);

export type YouTubeInput = { type: string; id: string };

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

function hasYtDlp(): boolean {
  try {
    execSync("yt-dlp --version", { stdio: "pipe", encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

export async function downloadYouTube(input: YouTubeInput) {
  const { id } = input;

  if (!hasYtDlp()) {
    throw new Error("yt-dlp is required for YouTube downloads. Install with: pip install yt-dlp");
  }

  let videoUrl = id;
  if (!videoUrl.startsWith("http")) {
    videoUrl = `https://www.youtube.com/watch?v=${id}`;
  }

  const { stdout } = await execAsync(
    `yt-dlp -j --no-check-certificate "${videoUrl}"`,
    { timeout: 30000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8" }
  );

  let data: any;
  try {
    data = JSON.parse(stdout);
  } catch {
    throw new Error("Could not parse YouTube video info. The video may be private or unavailable.");
  }

  if (!data) {
    throw new Error("Could not retrieve YouTube video info.");
  }

  const thumbnail = data.thumbnail || "";
  const title = data.title || "YouTube Video";
  const formats: any[] = data.formats || [];

  const seenResolutions = new Set<number>();
  const items: MediaItem[] = [];

  const combined = [...formats]
    .filter((f) => f.url && f.height && parseInt(f.height) > 0 && f.acodec && f.acodec !== "none")
    .sort((a, b) => (parseInt(b.height) || 0) - (parseInt(a.height) || 0));

  for (const f of combined) {
    const res = parseInt(f.height) || 0;
    if (res > 0 && !seenResolutions.has(res)) {
      seenResolutions.add(res);
      const label = QUALITY_LABELS[String(res)] || `${res}p`;
      items.push({
        type: "video",
        thumbnail,
        url: f.url,
        label: `Video ${label}`,
      });
    }
  }

  const audio = formats
    .filter((f) => (f.acodec && f.acodec !== "none") && (!f.vcodec || f.vcodec === "none") && f.url)
    .sort((a, b) => (b.abr || 0) - (a.abr || 0));

  if (audio.length > 0) {
    const bitrate = audio[0].abr || 128;
    items.push({
      type: "video",
      thumbnail,
      url: audio[0].url,
      label: `MP3 (${bitrate}kbps)`,
    });
  }

  if (items.length === 0) {
    throw new Error("Could not extract a downloadable URL for this video. It may be age-restricted or private.");
  }

  return { items, title };
}
