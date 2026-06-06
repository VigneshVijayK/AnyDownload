import { exec } from "child_process";
import { promisify } from "util";
import type { MediaItem } from "@/lib/types";

const execAsync = promisify(exec);

export type ThreadsInput = { type: string; id: string };

export async function downloadThreads(input: ThreadsInput) {
  let { id } = input;

  let shortcode = id;
  const fullMatch = id.match(/\/post\/([a-zA-Z0-9_-]+)/);
  if (fullMatch) {
    shortcode = fullMatch[1];
  }

  const embedUrl = `https://www.threads.net/@_/post/${shortcode}/embed`;

  const { stdout } = await execAsync(
    `curl -sS -L --max-time 15 "${embedUrl}" \
      -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"`,
    { timeout: 20000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8" }
  );

  const items: MediaItem[] = [];
  let title = "Threads Post";

  const ogTitle = stdout.match(/<meta\s+property="og:title"\s+content="([^"]+)"/);
  if (ogTitle?.[1]) title = ogTitle[1];

  const ogImage = stdout.match(/<meta\s+property="og:image"\s+content="([^"]+)"/);
  const thumbnail = ogImage?.[1] || "";

  const videoUrls = [...stdout.matchAll(/https?:\/\/[^"'\s<>&]+\.mp4[^"'\s<>&]*/g)]
    .map((m) => m[0])
    .filter((v) => v.length > 50);

  const best = videoUrls
    .sort((a, b) => b.length - a.length)
    .find((url) => url.includes("video"));

  if (best) {
    items.push({ type: "video", thumbnail, url: best, label: "Download Video" });
  }

  if (items.length === 0 && thumbnail) {
    items.push({ type: "image", thumbnail, url: thumbnail, label: "Download Image" });
  }

  if (items.length === 0) {
    throw new Error("Could not extract media from this Threads post. The post may be private or deleted.");
  }

  return { items, title };
}
