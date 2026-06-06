import type { Platform, FetchResult } from "@/lib/types";

export async function fetchMedia(
  platform: Platform,
  type: string,
  id: string,
  username?: string
): Promise<FetchResult> {
  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, type, id, username }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data as FetchResult;
}
