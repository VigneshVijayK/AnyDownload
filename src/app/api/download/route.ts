import { NextRequest, NextResponse } from "next/server";
import { downloadInstagram } from "@/lib/platforms/instagram";
import { downloadYouTube } from "@/lib/platforms/youtube";
import { downloadTwitter } from "@/lib/platforms/twitter";
import { downloadFacebook } from "@/lib/platforms/facebook";
import type { Platform } from "@/lib/types";

type InputBody = {
  platform: string;
  type: string;
  id: string;
  username?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body: InputBody = await req.json();
    const { platform, type, id, username } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    let result: any;

    switch (platform) {
      case "instagram":
        result = await downloadInstagram({ type, id, username });
        break;
      case "youtube":
        result = await downloadYouTube({ type, id });
        break;
      case "twitter":
        result = await downloadTwitter({ type, id });
        break;
      case "facebook":
        result = await downloadFacebook({ type, id });
        break;
      default:
        return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
    }

    return NextResponse.json({ ...result, platform });
  } catch (err: any) {
    console.error("API Error:", err.message);
    return NextResponse.json({ error: err.message || "Unknown error" }, { status: 500 });
  }
}
