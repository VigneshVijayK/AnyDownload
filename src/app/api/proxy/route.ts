import { NextRequest, NextResponse } from "next/server";
import { execSync, exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const SEP = "\n---CTSEP---\n";

function hasCurl(): boolean {
  try {
    execSync("curl --version", { stdio: "pipe", encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  heic: "image/heic",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
};

function guessMime(url: string): string {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";
  return MIME_TYPES[ext] || "image/jpeg";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }
  const decoded = decodeURIComponent(url);
  const mode = req.nextUrl.searchParams.get("mode") || "download";

  if (!hasCurl()) {
    return NextResponse.json({ error: "Curl not available on this server" }, { status: 500 });
  }

  try {
    const { stdout } = await execAsync(
      `curl -sS --max-time 30 "${decoded}" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" \
        -H "Accept: image/*,video/*,*/*" \
        -H "Referer: https://www.instagram.com/" \
        -w "${SEP}%{content_type}"`,
      { timeout: 35000, maxBuffer: 50 * 1024 * 1024, encoding: "buffer" }
    );

    const raw = stdout as unknown as Buffer;
    if (!raw || raw.length < 100) {
      throw new Error(`Empty response (${raw?.length || 0} bytes)`);
    }

    const sepBuf = Buffer.from(SEP, "utf-8");
    const sepIdx = raw.indexOf(sepBuf);

    let body: Buffer;
    let contentType: string;

    if (sepIdx >= 0) {
      body = Buffer.from(raw.subarray(0, sepIdx));
      contentType = raw.subarray(sepIdx + sepBuf.length).toString("utf-8").trim();
    } else {
      body = raw;
      contentType = guessMime(decoded);
    }

    if (!contentType || contentType === "application/octet-stream") {
      contentType = guessMime(decoded);
    }

    const filename = decoded.split("/").pop()?.split("?")[0] || "download";
    const ext = contentType.includes("video") ? ".mp4" : "." + (Object.entries(MIME_TYPES).find(([, v]) => v === contentType)?.[0] || "jpg");

    return new NextResponse(new Uint8Array(body), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition":
          mode === "inline"
            ? `inline; filename="${filename}${ext}"`
            : `attachment; filename="${filename}${ext}"`,
        "Content-Length": body.length.toString(),
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("Proxy curl error:", err.message);

    try {
      const res = await fetch(decoded, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "image/*,video/*,*/*",
          Referer: "https://www.instagram.com/",
        },
      });
      if (res.ok) {
        const ct = res.headers.get("content-type") || guessMime(decoded);
        const arr = await res.arrayBuffer();
        const filename = decoded.split("/").pop()?.split("?")[0] || "download";
        const ext = ct.includes("video") ? ".mp4" : ".jpg";
        return new NextResponse(new Uint8Array(arr), {
          headers: {
            "Content-Type": ct,
            "Content-Disposition":
              mode === "inline"
                ? `inline; filename="${filename}${ext}"`
                : `attachment; filename="${filename}${ext}"`,
            "Content-Length": arr.byteLength.toString(),
            "Cache-Control": "public, max-age=86400",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch {}

    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}
