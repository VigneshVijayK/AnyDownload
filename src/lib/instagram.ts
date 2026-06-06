export type MediaItem = {
  type: "image" | "video";
  thumbnail: string;
  url: string;
  label: string;
};

export type RelatedProfile = {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  isVerified: boolean;
  isPrivate: boolean;
};

export type ProfileInfo = {
  username: string;
  fullName: string;
  avatar: string;
  biography: string;
  followers: number;
  following: number;
  postsCount: number;
  isVerified: boolean;
  isPrivate: boolean;
  relatedProfiles: RelatedProfile[];
};

export type FetchResult = {
  items: MediaItem[];
  profile: ProfileInfo | null;
};

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

export function parseInstagramUrl(url: string): ParsedInput {
  const domain = "(?:instagram\\.com|instagr\\.am)";

  const withUser = url.match(
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/([a-zA-Z0-9_.]{1,30})\\/(p|reel|reels|tv)\\/([^\\/?#]+)`, "i")
  );
  if (withUser) {
    return { type: URL_TYPES[withUser[2].toLowerCase()] || "post", id: withUser[3], username: withUser[1] };
  }

  const patterns: { regex: RegExp; type: "post" | "reel" | "tv" | "story" | "profile" }[] = [
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/p\\/([^\\/?#]+)`, "i"), type: "post" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/reel\\/([^\\/?#]+)`, "i"), type: "reel" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/reels\\/([^\\/?#]+)`, "i"), type: "reel" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/tv\\/([^\\/?#]+)`, "i"), type: "tv" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/stories\\/([^\\/?#]+)`, "i"), type: "story" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/([a-zA-Z0-9_.]{1,30})\\/?$`, "i"), type: "profile" },
    { regex: new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?${domain}\\/([a-zA-Z0-9_.]{1,30})\\/?\\?`, "i"), type: "profile" },
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

export async function fetchMedia(type: string, id: string, username?: string): Promise<FetchResult> {
  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, id, username }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data as FetchResult;
}
