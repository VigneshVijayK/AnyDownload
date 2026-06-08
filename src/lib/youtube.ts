export type ParsedYouTubeInput = { type: "video"; id: string } | null;

export function parseYouTubeUrl(url: string): ParsedYouTubeInput {
  const idPattern = "[a-zA-Z0-9_-]{10,12}";

  const patterns = [
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.|music\\.)?youtube\\.com\\/watch\\?v=(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/shorts\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtu\\.be\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/embed\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/v\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?(?:www\\.|m\\.)?youtube\\.com\\/live\\/(${idPattern})`),
    new RegExp(`(?:https?:\\/\\/)?youtube\\.com\\/watch\\?v=(${idPattern})`),
    new RegExp(`^(?:https?:\\/\\/)?(?:www\\.)?youtube\\.com\\/clip\\/(${idPattern})`),
    new RegExp(`^(${idPattern})$`),
  ];

  for (const pattern of patterns) {
    const m = url.match(pattern);
    if (m) return { type: "video", id: m[1] };
  }

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const looseMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{10,12})/);
    if (looseMatch) return { type: "video", id: looseMatch[1] };
  }

  return null;
}

export function parseYouTubePlatform(url: string): { platform: string; type: string; id: string } | null {
  const parsed = parseYouTubeUrl(url);
  if (!parsed) return null;
  return { platform: "youtube", ...parsed };
}
