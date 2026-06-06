import type { Platform } from "@/lib/types";

export type ParsedTwitterInput = { type: "tweet"; id: string } | null;

export function parseTwitterUrl(url: string): ParsedTwitterInput {
  const match = url.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  if (match) return { type: "tweet", id: match[1] };
  const direct = url.match(/^(\d{10,20})$/);
  if (direct) return { type: "tweet", id: direct[1] };
  return null;
}

export function parseTwitterPlatform(url: string): { platform: Platform; type: string; id: string } | null {
  const parsed = parseTwitterUrl(url);
  if (!parsed) return null;
  return { platform: "twitter", ...parsed };
}
