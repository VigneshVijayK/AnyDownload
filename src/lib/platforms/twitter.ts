import type { MediaItem } from "@/lib/types";

export type TwitterInput = { type: string; id: string };

export async function downloadTwitter(input: TwitterInput) {
  let { id } = input;

  const tweetMatch = id.match(/(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i);
  if (tweetMatch) {
    id = tweetMatch[1];
  }

  const res = await fetch(`https://api.fxtwitter.com/status/${id}`, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  if (!res.ok) {
    throw new Error(`Twitter API returned ${res.status}. The tweet may not exist or is private.`);
  }

  const data = await res.json();

  if (!data?.tweet) {
    throw new Error("Could not find this tweet. It may have been deleted or is from a private account.");
  }

  const tweet = data.tweet;
  const items: MediaItem[] = [];

  const media = tweet.media || {};
  const photos = media.photos || [];
  const videos = media.videos || [];

  for (const photo of photos) {
    items.push({
      type: "image",
      thumbnail: photo.url,
      url: photo.url,
      label: "Download Image",
    });
  }

  for (const video of videos) {
    const thumbnail = video.thumbnailUrl || "";
    const formats = video.formats || video.variants || [];

    const sorted = [...formats]
      .filter((f: any) => f.url && f.container === "mp4" && f.bitrate > 0)
      .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

    if (sorted.length > 0) {
      for (const f of sorted) {
        const label = f.bitrate
          ? `Video ${f.width && f.width <= 640 ? "SD" : f.width && f.width <= 1280 ? "HD" : "Full HD"} (${Math.round(f.bitrate / 1000)}k)`
          : `Download Video (${Math.round(f.bitrate / 1000)}k)`;
        items.push({
          type: "video",
          thumbnail,
          url: f.url,
          label,
        });
      }
    } else if (video.url) {
      items.push({
        type: "video",
        thumbnail,
        url: video.url,
        label: `Download Video${video.bitrate ? ` (${Math.round(video.bitrate / 1000)}k)` : ""}`,
      });
    }
  }

  if (items.length === 0 && tweet.text) {
    throw new Error("This tweet has no downloadable media (images or videos).");
  }

  if (items.length === 0) {
    throw new Error("Could not find any media in this tweet.");
  }

  return {
    items,
    title: `@${tweet.author?.screen_name || "unknown"} - ${tweet.text?.slice(0, 80) || "Tweet"}`,
  };
}
