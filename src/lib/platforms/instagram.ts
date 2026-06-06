import { execSync, exec } from "child_process";
import { promisify } from "util";
import type { MediaItem, ProfileInfo } from "@/lib/types";

const execAsync = promisify(exec);

const IG_APP_ID = "936619743392459";

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, { data: any; ts: number }>();
function cacheGet<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T;
  cache.delete(key);
  return entry?.data as T | null;
}
function cacheSet(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
];
let uaIndex = 0;
function nextUA(): string {
  return USER_AGENTS[uaIndex++ % USER_AGENTS.length];
}

const HTTP_PROXY = process.env.INSTAGRAM_PROXY || process.env.HTTP_PROXY || "";
function proxyCmd(cmd: string): string {
  if (!HTTP_PROXY) return cmd;
  return cmd.replace(/^curl /, `curl -x "${HTTP_PROXY}" `);
}

let lastRequestTime = 0;
async function rateLimitedFetch(cmd: string): Promise<string> {
  const now = Date.now();
  const gap = now - lastRequestTime;
  if (gap < 1200) {
    await new Promise((r) => setTimeout(r, 1200 - gap));
  }
  lastRequestTime = Date.now();

  for (let attempt = 0; attempt < 3; attempt++) {
    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 20000,
      maxBuffer: 1024 * 1024 * 10,
      encoding: "utf-8",
    });

    if (!stdout || stdout.trim().length === 0) {
      throw new Error(`Empty response from Instagram. ${stderr ? "Curl stderr: " + stderr : ""}`);
    }

    const trimmed = stdout.trim();
    if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
      throw new Error(`Instagram returned HTML instead of JSON.`);
    }

    if (trimmed.includes('"Please wait a few minutes')) {
      if (attempt < 2) {
        const wait = (attempt + 1) * 5000;
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      throw new Error("Instagram rate limit reached. Please wait a moment and try again.");
    }

    return stdout;
  }

  throw new Error("Failed to fetch from Instagram after retries.");
}

function hasCurl(): boolean {
  try {
    execSync("curl --version", { stdio: "pipe", encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

function pathForType(type: string): string {
  switch (type) {
    case "reel": return "reel";
    case "tv": return "tv";
    default: return "p";
  }
}

async function fetchWithCurl(url: string): Promise<string> {
  const cmd = proxyCmd([
    `curl -sS --max-time 15 "${url}"`,
    `-H "x-ig-app-id: ${IG_APP_ID}"`,
    `-H "User-Agent: ${nextUA()}"`,
    `-H "Accept: application/json"`,
    `-H "Referer: https://www.instagram.com/"`,
  ].join(" "));

  return rateLimitedFetch(cmd);
}

type RawNode = {
  shortcode: string;
  is_video: boolean;
  display_url: string;
  video_url?: string;
  __typename?: string;
  edge_sidecar_to_children?: { edges: { node: RawNode }[] };
};

async function fetchProfileMedia(username: string) {
  const cacheKey = `profile:${username}`;
  const cached = cacheGet<{ items: MediaItem[]; nodes: RawNode[]; profile: any }>(cacheKey);
  if (cached) return cached;

  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

  if (!hasCurl()) {
    throw new Error("Curl is required but not found on this server. Install curl or use a VPS/Docker host.");
  }

  const raw = await fetchWithCurl(url);

  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Instagram returned an invalid response. They may be blocking automated requests. Try again later.");
  }

  if (data?.message?.includes?.("Please wait a few minutes")) {
    throw new Error("Instagram rate limit reached. Please wait a moment and try again.");
  }

  const user = data?.data?.user;

  if (!user) {
    throw new Error("Could not find this user on Instagram.");
  }

  const edges = user.edge_owner_to_timeline_media?.edges ?? [];
  const nodes: RawNode[] = edges.map((e: any) => e.node);
  const items: MediaItem[] = [];
  for (const n of nodes) {
    const children = n.__typename === "GraphSidecar" ? n.edge_sidecar_to_children?.edges ?? [] : [];
    if (children.length > 0) {
      for (const child of children) {
        const c = child.node;
        items.push({
          type: (c.is_video ? "video" : "image") as "image" | "video",
          thumbnail: c.display_url,
          url: c.video_url || c.display_url,
          label: c.is_video ? "Download Video" : "Download Image",
        });
      }
    } else {
      items.push({
        type: (n.is_video ? "video" : "image") as "image" | "video",
        thumbnail: n.display_url,
        url: n.video_url || n.display_url,
        label: n.is_video ? "Download Video" : "Download Image",
      });
    }
  }

  const relatedProfiles = (user.edge_related_profiles?.edges ?? []).map((e: any) => ({
    id: e.node.id,
    username: e.node.username,
    fullName: e.node.full_name,
    avatar: e.node.profile_pic_url,
    isVerified: !!e.node.is_verified,
    isPrivate: !!e.node.is_private,
  }));

  const result = {
    items,
    nodes,
    profile: {
      username: user.username,
      fullName: user.full_name,
      avatar: user.profile_pic_url_hd || user.profile_pic_url,
      biography: user.biography,
      followers: user.edge_followed_by?.count ?? 0,
      following: user.edge_follow?.count ?? 0,
      postsCount: user.edge_owner_to_timeline_media?.count ?? 0,
      isVerified: user.is_verified,
      isPrivate: !!user.is_private,
      relatedProfiles,
    },
  };
  cacheSet(cacheKey, result);
  return result;
}

async function resolvePostOwner(shortcode: string, mediaType: string = "post"): Promise<string> {
  const cacheKey = `owner:${shortcode}`;
  const cached = cacheGet<string>(cacheKey);
  if (cached) return cached;

  if (!hasCurl()) {
    throw new Error("Curl is required but not found on this server.");
  }

  const path = pathForType(mediaType);
  const url = `https://www.instagram.com/${path}/${shortcode}/embed/captioned/`;

  const cmd = proxyCmd(`curl -sS --max-time 15 "${url}" \
    -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" \
    -H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
    -H "Accept-Language: en-US,en;q=0.9"`);

  const { stdout } = await execAsync(cmd,
    { timeout: 20000, maxBuffer: 1024 * 1024 * 5, encoding: "utf-8" }
  );

  const excludePaths = ["stories", "p", "reel", "tv", "explore", "accounts", "about", "legal", "developers", "contact"];
  const embedMatches = stdout.matchAll(/instagram\.com\/([a-zA-Z0-9._]+)\/\?utm_source=ig_embed/g);
  for (const m of embedMatches) {
    const name = m[1];
    if (!excludePaths.includes(name)) {
      cacheSet(cacheKey, name);
      return name;
    }
  }

  throw new Error("Could not resolve the post owner from this URL. Try searching by username instead.");
}

export type InstagramInput = { type: string; id: string; username?: string };

export { resolvePostOwner, fetchProfileMedia };

export async function downloadInstagram(input: InstagramInput) {
  const { type, id, username } = input;

  if (type === "profile") {
    const result = await fetchProfileMedia(id);
    return { items: result.items, profile: result.profile, title: `@${result.profile.username}` };
  }

  let ownerUsername = username;
  if (!ownerUsername) {
    ownerUsername = await resolvePostOwner(id, type);
  }

  const result = await fetchProfileMedia(ownerUsername);
  const node = result.nodes.find((n) => n.shortcode === id);

  if (!node) {
    throw new Error(
      `Could not find post "${id}" in @${ownerUsername}'s recent posts. It may be older than the 12 most recent posts. Try searching for the username directly to browse all recent media.`
    );
  }

  const singleItems: MediaItem[] = [];
  const children = node.__typename === "GraphSidecar" ? node.edge_sidecar_to_children?.edges ?? [] : [];
  if (children.length > 0) {
    for (const child of children) {
      const c = child.node;
      singleItems.push({
        type: (c.is_video ? "video" : "image") as "image" | "video",
        thumbnail: c.display_url,
        url: c.video_url || c.display_url,
        label: c.is_video ? "Download Video" : "Download Image",
      });
    }
  } else {
    singleItems.push({
      type: (node.is_video ? "video" : "image") as "image" | "video",
      thumbnail: node.display_url,
      url: node.video_url || node.display_url,
      label: node.is_video ? "Download Video" : "Download Image",
    });
  }

  return { items: singleItems, profile: { ...result.profile, relatedProfiles: [] }, title: `@${result.profile.username}` };
}
