export type {
  MediaItem,
  ProfileInfo,
  FetchResult,
  Platform,
} from "@/lib/types";

export type ParsedInput =
  | { type: "post" | "reel" | "tv" | "story"; id: string; username?: string }
  | { type: "profile"; id: string }
  | null;

const URL_TYPES: Record<string, "post" | "reel" | "tv"> = {
  p: "post",
  reel: "reel",
  reels: "reel",
  tv: "tv",
};

const DOMAIN = "(?:instagram\\.com|instagr\\.am)";

export function parseInstagramUrl(url: string): ParsedInput {
  const withUser = url.match(
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/([a-zA-Z0-9_.]{1,30})\\/(p|reel|reels|tv)\\/([^\\/?#]+)`, "i")
  );
  if (withUser) {
    return { type: URL_TYPES[withUser[2].toLowerCase()] || "post", id: withUser[3], username: withUser[1] };
  }

  const patterns: { regex: RegExp; type: "post" | "reel" | "tv" | "story" | "profile" }[] = [
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/p\\/([^\\/?#]+)`, "i"), type: "post" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/reel\\/([^\\/?#]+)`, "i"), type: "reel" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/reels\\/([^\\/?#]+)`, "i"), type: "reel" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/tv\\/([^\\/?#]+)`, "i"), type: "tv" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/stories\\/([^\\/?#]+)`, "i"), type: "story" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/([a-zA-Z0-9_.]{1,30})\\/?$`, "i"), type: "profile" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${DOMAIN}\\/([a-zA-Z0-9_.]{1,30})\\/?\\?`, "i"), type: "profile" },
  ];

  for (const { regex, type } of patterns) {
    const match = url.match(regex);
    if (match) {
      if (type === "profile") return { type, id: match[1] };
      return { type, id: match[1] } as ParsedInput;
    }
  }
  return null;
}

export function parseUsername(input: string): string | null {
  const clean = input.replace(/^@/, "").replace(/\s/g, "").trim();
  if (/^[a-zA-Z0-9._]{1,30}$/.test(clean)) return clean;
  return null;
}
