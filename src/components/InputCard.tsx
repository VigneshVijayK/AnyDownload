"use client";

import { useState, useRef } from "react";
import { parseInstagramUrl, parseUsername } from "@/lib/instagram";

type InputCardProps = {
  onFetch: (type: string, id: string, username?: string) => void;
  loading: boolean;
  error: string | null;
};

type Tab = "url" | "username";

const chips = [
  { label: "Posts" },
  { label: "Reels" },
  { label: "Stories" },
  { label: "Highlights" },
  { label: "Profiles" },
];

const chipIcons: Record<string, string> = {
  Posts: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  Reels: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  Stories: "M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z",
  Highlights: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
  Profiles: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
};

export default function InputCard({ onFetch, loading, error }: InputCardProps) {
  const [tab, setTab] = useState<Tab>("url");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const userRef = useRef<HTMLInputElement>(null);

  const displayError = error || localError;

  function handleSubmit() {
    setLocalError(null);

    if (tab === "url") {
      if (!url.trim()) {
        setLocalError("Please paste an Instagram link.");
        urlRef.current?.focus();
        return;
      }
      const parsed = parseInstagramUrl(url.trim());
      if (!parsed) {
        setLocalError("Invalid Instagram URL. Paste a valid post, reel, or profile link.");
        return;
      }
      onFetch(parsed.type, parsed.id, parsed.type !== "profile" ? parsed.username : undefined);
    } else {
      if (!username.trim()) {
        setLocalError("Please enter an Instagram username.");
        userRef.current?.focus();
        return;
      }
      const clean = parseUsername(username.trim());
      if (!clean) {
        setLocalError("Invalid username. Use letters, numbers, dots, and underscores only.");
        return;
      }
      onFetch("profile", clean);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className="glass rounded-2xl p-7 mb-5 transition-all duration-300 focus-within:border-[rgba(225,48,108,0.5)] focus-within:shadow-[0_0_40px_rgba(225,48,108,0.25)]">
      {/* Tabs */}
      <div className="flex gap-2 mb-5 bg-[#0a0a0f] p-1 rounded-[10px]">
        <button
          onClick={() => setTab("url")}
          type="button"
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === "url"
              ? "bg-[rgba(255,255,255,0.08)] text-white"
              : "text-[rgba(255,255,255,0.65)] hover:text-white"
          }`}
        >
          <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Post / Reel URL
        </button>
        <button
          onClick={() => setTab("username")}
          type="button"
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            tab === "username"
              ? "bg-[rgba(255,255,255,0.08)] text-white"
              : "text-[rgba(255,255,255,0.65)] hover:text-white"
          }`}
        >
          <svg className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Username / Profile
        </button>
      </div>

      {/* URL Input */}
      <div className={tab === "url" ? "block" : "hidden"}>
        <div className="flex items-center bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] rounded-[10px] pl-4 pr-1.5 transition-all focus-within:border-[#e1306c] focus-within:shadow-[0_0_20px_rgba(225,48,108,0.25)]">
          <svg className="w-4 h-4 text-[rgba(255,255,255,0.35)] shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z" />
          </svg>
          <input
            ref={urlRef}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste Instagram link here... (e.g. https://www.instagram.com/p/...)"
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] px-3 py-4 placeholder:text-[rgba(255,255,255,0.35)]"
            autoComplete="off"
          />
          {url && (
            <button
              onClick={() => { setUrl(""); urlRef.current?.focus(); }}
              type="button"
              className="w-9 h-9 flex items-center justify-center border-none rounded-lg bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.35)] cursor-pointer hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all shrink-0"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Username Input */}
      <div className={tab === "username" ? "block" : "hidden"}>
        <div className="flex items-center bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] rounded-[10px] pl-4 pr-1.5 transition-all focus-within:border-[#e1306c] focus-within:shadow-[0_0_20px_rgba(225,48,108,0.25)]">
          <svg className="w-4 h-4 text-[rgba(255,255,255,0.35)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            ref={userRef}
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter Instagram username... (e.g. natgeo)"
            className="flex-1 bg-transparent border-none outline-none text-white text-[15px] px-3 py-4 placeholder:text-[rgba(255,255,255,0.35)]"
            autoComplete="off"
          />
          {username && (
            <button
              onClick={() => { setUsername(""); userRef.current?.focus(); }}
              type="button"
              className="w-9 h-9 flex items-center justify-center border-none rounded-lg bg-[rgba(255,255,255,0.04)] text-[rgba(255,255,255,0.35)] cursor-pointer hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all shrink-0"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-[rgba(255,255,255,0.35)]">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Profile must be public or shared with you
        </div>
      </div>

      {/* Supported chips */}
      <div className="flex flex-wrap items-center gap-2 mt-[18px]">
        <span className="text-xs text-[rgba(255,255,255,0.35)]">Supported:</span>
        {chips.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] rounded-full text-xs text-[rgba(255,255,255,0.65)] hover:border-[#e1306c] hover:text-white transition-all"
          >
            <svg className="w-3 h-3 text-[#e1306c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={chipIcons[chip.label]} />
            </svg>
            {chip.label}
          </span>
        ))}
      </div>

      {/* Error */}
      {displayError && (
        <div className="flex items-center gap-2.5 p-3.5 mt-4 bg-[rgba(253,29,29,0.1)] border border-[rgba(253,29,29,0.3)] rounded-[10px] text-sm text-[#ff6b6b]">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {displayError}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        type="button"
        className="relative overflow-hidden w-full mt-5 inline-flex items-center justify-center gap-2.5 px-12 py-[18px] border-none rounded-full text-white text-[17px] font-semibold cursor-pointer transition-all duration-300 insta-gradient bg-[length:200%_200%] animate-[gradient-shift_4s_ease_infinite] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_8px_40px_rgba(225,48,108,0.55)] active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:translate-y-0"
      >
        <span className={loading ? "hidden" : "inline-flex items-center gap-2"}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Fetch & Download
        </span>
        <span className={loading ? "inline-flex items-center gap-2" : "hidden"}>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Fetching...
        </span>
      </button>
    </div>
  );
}
