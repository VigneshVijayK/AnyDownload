"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { MediaItem, ProfileInfo, Platform } from "@/lib/types";
import { getPlatformInfo } from "@/lib/types";
import ProfileHeader from "./ProfileHeader";

type ResultsGridProps = {
  items: MediaItem[];
  profile: ProfileInfo | null;
  title?: string;
  platform?: string;
  loading?: boolean;
};

const CATEGORIES = [
  { key: "all", label: "All", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { key: "image", label: "Photos", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "video", label: "Videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
];

export default function ResultsGrid({ items, profile, title, platform, loading }: ResultsGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const hasItems = items.length > 0;
  const hasInitiallyScrolled = useRef(false);

  const info = platform ? getPlatformInfo(platform as Platform) : null;
  const accentColor = info?.color || "#e1306c";

  useEffect(() => {
    if ((profile || hasItems) && !hasInitiallyScrolled.current) {
      hasInitiallyScrolled.current = true;
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [profile, items]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((i) => i.type === activeCategory);
  }, [items, activeCategory]);

  const counts = useMemo(() => {
    const all = items.length;
    const photos = items.filter((i) => i.type === "image").length;
    const videos = items.filter((i) => i.type === "video").length;
    return { all, photos, videos };
  }, [items]);

  const isInstagram = platform === "instagram";

  if (!profile && !hasItems) {
    if (loading) {
      return (
        <section className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full" style={{ background: "var(--bg-card)" }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 sm:h-5 w-48 rounded" style={{ background: "var(--bg-card)" }} />
              <div className="h-3 sm:h-4 w-32 rounded" style={{ background: "var(--bg-card)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl sm:rounded-[16px] overflow-hidden" style={{ background: "var(--bg-card)" }}>
                <div className="aspect-square" style={{ background: "var(--bg-inset)" }} />
                <div className="h-10 sm:h-12" style={{ background: "var(--bg-card)" }} />
              </div>
            ))}
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section ref={sectionRef} className="w-full max-w-[960px] mx-auto px-4 sm:px-6 pb-20">
      {profile && <ProfileHeader profile={profile} accentColor={accentColor} />}

      {hasItems && (
        <>
          {title && !profile && (
            <div className="mb-4 sm:mb-6 mt-6 sm:mt-8">
              <h2 className="text-lg sm:text-[22px] font-bold text-text-primary leading-snug line-clamp-2">{title}</h2>
            </div>
          )}

          {hasItems && (
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-[28px] font-bold text-text-primary">
                  <svg className="inline w-5 h-5 sm:w-6 sm:h-6 mr-2 -mt-0.5 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: accentColor }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {title || "Recent Media"}
                </h2>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    type="button"
                    className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-medium cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                    style={{
                      background: `${accentColor}18`,
                      color: accentColor,
                    }}
                  >
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                    </svg>
                    New Search
                  </button>
                  <span className="text-xs sm:text-sm text-text-muted shrink-0">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 p-1 rounded-[10px] overflow-x-auto" style={{ background: "var(--filter-bg)" }}>
                {CATEGORIES.map((cat) => {
                  const count = counts[cat.key as keyof typeof counts] ?? 0;
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      type="button"
                      className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive ? "shadow-[0_2px_8px_rgba(0,0,0,0.3)]" : "hover:text-text-primary"
                      }`}
                      style={{
                        background: isActive ? `${accentColor}22` : "transparent",
                        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                      }}
                    >
                      <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                      </svg>
                      {cat.label}
                      <span
                        className="ml-1 px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold transition-all duration-500"
                        style={{
                          background: isActive ? accentColor : "var(--bg-card)",
                          color: isActive ? "#fff" : "var(--text-muted)",
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: "var(--text-muted)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No {activeCategory} media found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {filtered.map((item, i) => {
                const isMp3 = item.label.includes("MP3");
                const isVideo = item.type === "video";
                const thumbnailSrc = isInstagram && item.thumbnail
                  ? `/api/proxy?mode=inline&url=${encodeURIComponent(item.thumbnail)}`
                  : (item.thumbnail || "/placeholder.svg");
                const isProxy = isInstagram;
                return (
                  <div
                    key={`${item.url}-${i}`}
                    className="rounded-xl sm:rounded-[16px] overflow-hidden transition-all duration-500 hover:-translate-y-1"
                    style={{
                      background: "var(--bg-card)",
                      border: `1px solid color-mix(in srgb, ${accentColor} 15%, var(--border))`,
                      animation: `fade-in-up 0.5s ease ${i * 0.05}s forwards`,
                      opacity: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = accentColor;
                      e.currentTarget.style.boxShadow = `0 12px 40px ${accentColor}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 15%, var(--border))`;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="relative w-full aspect-square overflow-hidden" style={{ background: "var(--bg-inset)" }}>
                      {isMp3 ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 sm:w-14 sm:h-14 opacity-40" viewBox="0 0 24 24" fill="currentColor" style={{ color: accentColor }}>
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                          </svg>
                        </div>
                      ) : isVideo ? (
                        <video
                          src={item.url}
                          poster={thumbnailSrc}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={thumbnailSrc}
                          alt=""
                          className="w-full h-full object-cover will-change-transform"
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = item.thumbnail; }}
                        />
                      )}
                      <span className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-[rgba(0,0,0,0.7)] backdrop-blur-[10px] rounded-full text-[10px] sm:text-xs flex items-center gap-1 sm:gap-1.5 text-white pointer-events-none">
                        <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {isMp3 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          ) : isVideo ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          )}
                        </svg>
                        {isMp3 ? "Audio" : isVideo ? "Video" : "Photo"}
                      </span>
                    </div>
                    {isProxy ? (
                      <a
                        href={`/api/proxy?mode=download&url=${encodeURIComponent(item.url)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-[14px] text-white no-underline font-semibold text-xs sm:text-sm transition-all duration-500 hover:brightness-110"
                        style={{ background: accentColor }}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {isMp3 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          )}
                        </svg>
                        {item.label}
                      </a>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-[14px] text-white no-underline font-semibold text-xs sm:text-sm transition-all duration-500 hover:brightness-110"
                        style={{ background: accentColor }}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {isMp3 ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          )}
                        </svg>
                        {item.label}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
