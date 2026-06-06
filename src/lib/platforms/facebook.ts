import { execSync, exec } from "child_process";
import { promisify } from "util";
import type { MediaItem } from "@/lib/types";

const execAsync = promisify(exec);

function hasYtDlp(): boolean {
  try {
    execSync("yt-dlp --version", { stdio: "pipe", encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

export type FacebookInput = { type: string; id: string };

export async function downloadFacebook(input: FacebookInput) {
  let { id } = input;

  if (!id.startsWith("http")) {
    throw new Error("Please paste a full Facebook video URL.");
  }

  if (!hasYtDlp()) {
    throw new Error("yt-dlp is required for Facebook downloads. Install it with: pip install yt-dlp");
  }

  const { stdout } = await execAsync(
    `yt-dlp -j --no-check-certificate "${id}"`,
    { timeout: 30000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8" }
  );

  let data: any;
  try {
    data = JSON.parse(stdout);
  } catch {
    throw new Error("Could not parse Facebook video info. The video may be private or unavailable.");
  }

  if (!data) {
    throw new Error("Could not retrieve Facebook video info.");
  }

  const thumbnail = data.thumbnail || "";
  const title = data.title || "Facebook Video";
  const formats: any[] = data.formats || [];

  const combined = [...formats]
    .filter((f: any) => f.url && f.vcodec && f.vcodec !== "none" && f.acodec && f.acodec !== "none")
    .sort((a: any, b: any) => {
      const ah = parseInt(a.height) || a.width || 0;
      const bh = parseInt(b.height) || b.width || 0;
      return bh - ah;
    });

  if (combined.length === 0) {
    const anyUrl = data.url || formats.find((f: any) => f.url)?.url;
    if (anyUrl) {
      return { items: [{ type: "video" as const, thumbnail, url: anyUrl, label: "Download Video" }], title };
    }
    throw new Error("Could not extract a downloadable video URL from this Facebook post.");
  }

  const items: MediaItem[] = [];
  const seen = new Set<string>();

  for (const f of combined) {
    if (!seen.has(f.url)) {
      seen.add(f.url);
      const label = `Video ${f.format_note || `${f.height || f.width || ""}p`}${f.filesize ? ` (${(f.filesize / 1024 / 1024).toFixed(1)}MB)` : ""}`;
      items.push({ type: "video", thumbnail, url: f.url, label });
    }
  }

  if (items.length === 0) {
    throw new Error("Could not extract a downloadable video URL from this Facebook post.");
  }

  return { items, title };
}
