export type ParsedFacebookInput = { type: "video"; id: string } | null;

export function parseFacebookUrl(url: string): ParsedFacebookInput {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^/]+\/videos\/(\d+)/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^/]+\/reels\/(\d+)/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^/]+\/posts\/([^/?#]+)/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/watch\/?\?v=(\d+)/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/reel\/(\d+)/i,
    /(?:https?:\/\/)?fb\.watch\/([a-zA-Z0-9_-]+)/i,
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9_.-]+\/videos\/[^/?#]+)/i,
  ];

  for (const pattern of patterns) {
    const m = url.match(pattern);
    if (m) return { type: "video", id: url };
  }

  if (url.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/.+/i)) {
    return { type: "video", id: url };
  }

  return null;
}

export function parseFacebookPlatform(url: string): { platform: string; type: string; id: string } | null {
  const parsed = parseFacebookUrl(url);
  if (!parsed) return null;
  return { platform: "facebook", ...parsed };
}
