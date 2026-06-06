import type { Platform } from "@/lib/types";

export type ParsedThreadsInput = { type: "post"; id: string } | null;

export function parseThreadsUrl(url: string): ParsedThreadsInput {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?threads\.(?:net|com)\/@[\w.]+\/post\/([a-zA-Z0-9_-]+)/i,
    /(?:https?:\/\/)?(?:www\.)?threads\.(?:net|com)\/@[\w.]+\/([a-zA-Z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const m = url.match(pattern);
    if (m) return { type: "post", id: m[1] };
  }

  return null;
}

export function parseThreadsPlatform(url: string): { platform: Platform; type: string; id: string } | null {
  const parsed = parseThreadsUrl(url);
  if (!parsed) return null;
  return { platform: "threads", ...parsed };
}
