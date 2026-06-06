export type MediaItem = {
  type: "image" | "video";
  thumbnail: string;
  url: string;
  label: string;
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
  relatedProfiles: { id: string; username: string; fullName: string; avatar: string; isVerified: boolean; isPrivate: boolean }[];
};

export type Platform = "instagram" | "youtube" | "twitter" | "facebook";

export type FetchResult = {
  items: MediaItem[];
  profile?: ProfileInfo;
  title?: string;
  platform: Platform;
};

export type PlatformInfo = {
  id: Platform;
  name: string;
  color: string;
  accentRgb: string;
  gradient: string;
  icon: string;
  placeholder: string;
  hint: string;
  bgGlow: [string, string, string];
  types: { type: string; label: string }[];
};

export const PLATFORMS: PlatformInfo[] = [
  {
    id: "instagram",
    name: "Instagram",
    color: "#e1306c",
    accentRgb: "225, 48, 108",
    gradient: "from-[#833ab4] via-[#fd1d1d] to-[#f77737]",
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    placeholder: "Paste Instagram link or username...",
    hint: "Posts, Reels, Stories, Profiles",
    bgGlow: ["#833ab4", "#e1306c", "#fd1d1d"],
    types: [
      { type: "url", label: "Post / Reel URL" },
      { type: "username", label: "Username / Profile" },
    ],
  },
  {
    id: "youtube",
    name: "YouTube",
    color: "#ff0000",
    accentRgb: "255, 0, 0",
    gradient: "from-[#ff0000] to-[#cc0000]",
    icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    placeholder: "Paste YouTube video URL...",
    hint: "Videos, Shorts",
    bgGlow: ["#ff0000", "#282828", "#0f0f0f"],
    types: [
      { type: "url", label: "Video URL" },
    ],
  },
  {
    id: "twitter",
    name: "X",
    color: "#1d9bf0",
    accentRgb: "29, 155, 240",
    gradient: "from-[#1d9bf0] to-[#0d8bd9]",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    placeholder: "Paste X / Twitter post URL...",
    hint: "Posts (videos & images)",
    bgGlow: ["#1d9bf0", "#000000", "#161617"],
    types: [
      { type: "url", label: "Post URL" },
    ],
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "#1877f2",
    accentRgb: "24, 119, 242",
    gradient: "from-[#1877f2] to-[#0c5dbf]",
    icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    placeholder: "Paste Facebook video URL...",
    hint: "Videos, Reels",
    bgGlow: ["#1877f2", "#0c5dbf", "#18191a"],
    types: [
      { type: "url", label: "Video URL" },
    ],
  },
];

export function getPlatformInfo(platform: Platform): PlatformInfo {
  return PLATFORMS.find((p) => p.id === platform)!;
}
