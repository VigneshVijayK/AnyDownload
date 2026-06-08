"use client";

import type { Platform } from "@/lib/types";
import { getPlatformInfo } from "@/lib/types";
import ScrollReveal from "@/components/ScrollReveal";

const features = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
    title: "Videos & Reels",
    desc: "Download videos and reels from Instagram and X/Twitter",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    title: "Carousel Posts",
    desc: "Save entire carousel posts — every single image and video",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    ),
    title: "Profile Pictures",
    desc: "Download profile pictures in full HD resolution",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    ),
    title: "Multi-Platform",
    desc: "Instagram and X/Twitter — all in one place",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    ),
    title: "Unlimited Downloads",
    desc: "No daily limits or restrictions on downloads",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
    title: "100% Free & Safe",
    desc: "No login required, your privacy is fully protected",
  },
];

type FeaturesProps = {
  platform?: Platform;
};

export default function Features({ platform }: FeaturesProps) {
  const info = platform ? getPlatformInfo(platform) : null;
  const accentColor = info?.color || "#e1306c";

  return (
    <section id="features" className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <ScrollReveal>
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-text-primary mb-2 sm:mb-3 tracking-tight">
            Premium <span style={{ color: accentColor }}>Features</span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-[17px]">
            Everything you need to save content from any platform
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
        {features.map((f, i) => (
          <ScrollReveal key={f.title} delay={i * 0.06}>
            <div
              className="p-5 sm:p-6 lg:p-8 rounded-[12px] sm:rounded-[16px] transition-all duration-500 hover:-translate-y-[2px] sm:hover:-translate-y-[3px]"
              style={{
                background: "var(--bg-card)",
                border: `1px solid color-mix(in srgb, ${accentColor} 10%, var(--border))`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.boxShadow = `0 12px 40px ${accentColor}18`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 10%, var(--border))`;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-[8px] sm:rounded-[10px] flex items-center justify-center text-white mb-3 sm:mb-[18px] transition-all duration-500"
                style={{
                  background: accentColor,
                  boxShadow: `0 6px 20px ${accentColor}44`,
                }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {f.icon}
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1 sm:mb-2">{f.title}</h3>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{f.desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
