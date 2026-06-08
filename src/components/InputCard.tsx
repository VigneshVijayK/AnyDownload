"use client";

import { useState, useRef, useEffect } from "react";
import { parseInstagramUrl, parseUsername } from "@/lib/instagram";
import { parseTwitterUrl } from "@/lib/twitter";
import { PLATFORMS } from "@/lib/types";
import type { Platform } from "@/lib/types";

type InputCardProps = {
  onFetch: (platform: Platform, type: string, id: string, username?: string) => void;
  loading: boolean;
  error: string | null;
  platform: Platform;
};

export default function InputCard({ onFetch, loading, error, platform }: InputCardProps) {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"url" | "username">("url");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;
  const platformInfo = PLATFORMS.find((p) => p.id === platform)!;

  useEffect(() => {
    setUrl("");
    setUsername("");
    setLocalError(null);
    setInputMode("url");
  }, [platform]);

  function detectPlatform(input: string): { platform: Platform; type: string; id: string; username?: string } | null {
    const ig = parseInstagramUrl(input);
    if (ig) return { platform: "instagram", ...ig };

    const tw = parseTwitterUrl(input);
    if (tw) return { platform: "twitter", ...tw };

    return null;
  }

  function handleSubmit() {
    setLocalError(null);

    if (inputMode === "url") {
      if (!url.trim()) {
        setLocalError(`Please paste a ${platformInfo.name} link.`);
        inputRef.current?.focus();
        return;
      }

      if (platform === "instagram") {
        const parsed = parseInstagramUrl(url.trim());
        if (!parsed) {
          setLocalError("Invalid Instagram URL. Paste a valid post, reel, or profile link.");
          return;
        }
        onFetch("instagram", parsed.type, parsed.id, parsed.type !== "profile" ? parsed.username : undefined);
      } else {
        const detected = detectPlatform(url.trim());
        if (!detected || detected.platform !== platform) {
          setLocalError(`That doesn't look like a valid ${platformInfo.name} URL.`);
          return;
        }
        onFetch(detected.platform, detected.type, detected.id, detected.username);
      }
    } else {
      if (!username.trim()) {
        setLocalError("Please enter a username.");
        inputRef.current?.focus();
        return;
      }
      const clean = parseUsername(username.trim());
      if (!clean) {
        setLocalError("Invalid username. Use letters, numbers, dots, and underscores only.");
        return;
      }
      onFetch("instagram", "profile", clean);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  const accentColor = platformInfo.color;

  return (
    <div
      className="glass rounded-2xl p-5 sm:p-7 mb-5 min-h-[280px] flex flex-col"
      style={{
        borderColor: displayError ? "#ff6b6b" : `color-mix(in srgb, ${accentColor} 25%, var(--glass-border))`,
      }}
    >
      <div className="flex-1">
        {platform === "instagram" && (
        <div className="flex gap-2 mb-4 sm:mb-5 rounded-[10px]" style={{ background: "var(--filter-bg)", padding: 4 }}>
          <button
            onClick={() => setInputMode("url")}
            type="button"
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer"
            style={{
              background: inputMode === "url" ? "var(--bg-card-hover)" : "transparent",
              color: inputMode === "url" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <svg className="inline w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Post / Reel URL
          </button>
          <button
            onClick={() => setInputMode("username")}
            type="button"
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-all cursor-pointer"
            style={{
              background: inputMode === "username" ? "var(--bg-card-hover)" : "transparent",
              color: inputMode === "username" ? "var(--text-primary)" : "var(--text-secondary)",
            }}
          >
            <svg className="inline w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Username
          </button>
        </div>
      )}

      {inputMode === "url" ? (
        <div
          className="flex items-center border rounded-[10px] pl-3 sm:pl-4 pr-1 sm:pr-1.5"
          style={{ background: "var(--bg-inset)", borderColor: displayError ? "#ff6b6b55" : `color-mix(in srgb, ${accentColor} 15%, var(--border))` }}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 transition-colors duration-500" viewBox="0 0 24 24" fill="currentColor" style={{ color: accentColor }}>
            <path d={platformInfo.icon} />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={platformInfo.placeholder}
            className="flex-1 bg-transparent border-none outline-none text-text-primary text-[13px] sm:text-[15px] px-2 sm:px-3 py-3 sm:py-4 placeholder:text-text-muted min-w-0"
            autoComplete="off"
          />
          {url && (
            <button
              onClick={() => { setUrl(""); inputRef.current?.focus(); }}
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border-none rounded-lg text-text-muted cursor-pointer hover:text-text-primary transition-all shrink-0"
              style={{ background: "var(--bg-card)" }}
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div
          className="flex items-center border rounded-[10px] pl-3 sm:pl-4 pr-1 sm:pr-1.5"
          style={{ background: "var(--bg-inset)", borderColor: displayError ? "#ff6b6b55" : "var(--border)" }}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter Instagram username..."
            className="flex-1 bg-transparent border-none outline-none text-text-primary text-[13px] sm:text-[15px] px-2 sm:px-3 py-3 sm:py-4 placeholder:text-text-muted min-w-0"
            autoComplete="off"
          />
          {username && (
            <button
              onClick={() => { setUsername(""); inputRef.current?.focus(); }}
              type="button"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border-none rounded-lg text-text-muted cursor-pointer hover:text-text-primary transition-all shrink-0"
              style={{ background: "var(--bg-card)" }}
            >
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {inputMode === "username" && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Profile must be public
        </div>
      )}

      {inputMode === "url" && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 sm:mt-[18px]">
          <span className="text-[10px] sm:text-xs text-text-muted">Supported:</span>
          <span
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 border rounded-full text-[10px] sm:text-xs transition-colors duration-500"
            style={{
              background: "var(--bg-inset)",
              borderColor: `color-mix(in srgb, ${accentColor} 30%, var(--border))`,
              color: `color-mix(in srgb, ${accentColor} 70%, var(--text-primary))`,
            }}
          >
            <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
            </svg>
            {platformInfo.hint}
          </span>
        </div>
      )}

      {displayError && (
        <div className="flex items-center gap-2 p-3 sm:p-3.5 mt-3 sm:mt-4 bg-[rgba(253,29,29,0.1)] border border-[rgba(253,29,29,0.3)] rounded-[10px] text-xs sm:text-sm text-[#ff6b6b]">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {displayError}
        </div>
      )}

      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        type="button"
        className="relative overflow-hidden w-full mt-4 sm:mt-5 inline-flex items-center justify-center gap-2 px-6 sm:px-12 py-3 sm:py-[18px] border-none rounded-full text-white text-sm sm:text-[17px] font-semibold cursor-pointer transition-all duration-500 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
        style={{
          background: loading ? "linear-gradient(135deg, #833ab4 0%, #e1306c 40%, #fd1d1d 70%, #fcaa45 100%)" : accentColor,
          boxShadow: `0 6px 30px ${accentColor}55`,
        }}
      >
        <span className={loading ? "hidden" : "inline-flex items-center gap-1.5 sm:gap-2"}>
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="hidden xs:inline sm:inline">{`Get ${platformInfo.name} Media`}</span>
          <span className="xs:hidden sm:hidden">Download</span>
        </span>
        <span className={loading ? "inline-flex items-center gap-2" : "hidden"}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="hidden xs:inline">Fetching...</span>
        </span>
      </button>
    </div>
  );
}
