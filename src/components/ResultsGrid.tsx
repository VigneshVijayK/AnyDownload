"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { MediaItem, ProfileInfo } from "@/lib/instagram";
import ProfileHeader from "./ProfileHeader";

type ResultsGridProps = {
  items: MediaItem[];
  profile: ProfileInfo | null;
  singlePost?: boolean;
};

const CATEGORIES = [
  { key: "all", label: "All", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
  { key: "image", label: "Photos", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { key: "video", label: "Videos", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" },
];

export default function ResultsGrid({ items, profile, singlePost }: ResultsGridProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (profile || items.length > 0) {
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

  if (!profile && items.length === 0) return null;

  return (
    <section ref={sectionRef} className="max-w-[960px] mx-auto px-6 pb-20">
      {profile && <ProfileHeader profile={profile} />}

      {items.length > 0 && (
        <>
          {!singlePost && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[28px] font-bold text-white">
                  <svg className="inline w-6 h-6 mr-2.5 text-[#e1306c] -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Recent Media
                </h2>
                <span className="text-sm text-[rgba(255,255,255,0.45)]">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex gap-1.5 p-1 bg-[#0a0a0f] rounded-[10px] overflow-x-auto">
                {CATEGORIES.map((cat) => {
                  const count = counts[cat.key as keyof typeof counts] ?? 0;
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      type="button"
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? "bg-[rgba(255,255,255,0.1)] text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                          : "text-[rgba(255,255,255,0.5)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} />
                      </svg>
                      {cat.label}
                      <span className={`ml-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        isActive
                          ? "bg-[#e1306c] text-white"
                          : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!singlePost && filtered.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-12 h-12 mx-auto mb-3 text-[rgba(255,255,255,0.15)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-[rgba(255,255,255,0.4)]">No {activeCategory} media in recent posts</p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
              {(singlePost ? items : filtered).map((item, i) => {
                const thumbnailSrc = item.thumbnail
                  ? `/api/proxy?mode=inline&url=${encodeURIComponent(item.thumbnail)}`
                  : "/placeholder.svg";
                const downloadSrc = `/api/proxy?mode=download&url=${encodeURIComponent(item.url)}`;
                return (
                  <div
                    key={`${item.url}-${i}`}
                    className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[#e1306c] hover:shadow-[0_12px_40px_rgba(225,48,108,0.2)]"
                    style={{ animation: `fade-in-up 0.5s ease ${i * 0.05}s forwards`, opacity: 0 }}
                  >
                    <div className="relative w-full aspect-square bg-[#0a0a0f] overflow-hidden">
                      <img
                        src={thumbnailSrc}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = item.thumbnail;
                        }}
                      />
                      <span className="absolute top-2.5 left-2.5 px-3 py-1 bg-[rgba(0,0,0,0.7)] backdrop-blur-[10px] rounded-full text-xs flex items-center gap-1.5 text-white">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {item.type === "video" ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          )}
                        </svg>
                        {item.type === "video" ? "Video" : "Photo"}
                      </span>
                    </div>
                    <a
                      href={downloadSrc}
                      download
                      className="flex items-center justify-center gap-2 py-[14px] text-white no-underline font-semibold text-sm insta-gradient hover:brightness-110 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {item.type === "video" ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        )}
                      </svg>
                      {item.label}
                    </a>
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
