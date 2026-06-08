"use client";

import { Fragment } from "react";
import type { Platform } from "@/lib/types";
import { getPlatformInfo } from "@/lib/types";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  {
    number: "01",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    ),
    title: "Choose Platform",
    desc: "Select Instagram or X/Twitter",
  },
  {
    number: "02",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    ),
    title: "Paste Link",
    desc: "Paste the link or enter the username above",
  },
  {
    number: "03",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
    title: "Download",
    desc: "Preview and download in HD quality instantly",
  },
];

type HowItWorksProps = {
  platform?: Platform;
};

export default function HowItWorks({ platform }: HowItWorksProps) {
  const info = platform ? getPlatformInfo(platform) : null;
  const accentColor = info?.color || "#e1306c";

  return (
    <section id="how" className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <ScrollReveal>
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-text-primary mb-2 sm:mb-3 tracking-tight">
            How It <span style={{ color: accentColor }}>Works</span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-[17px] px-2 sm:px-0">
            Three simple steps to download media from any platform
          </p>
        </div>
      </ScrollReveal>

      <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6">
        {steps.map((step, i) => (
          <Fragment key={i}>
            {i > 0 && (
              <div className="hidden md:block shrink-0 transition-colors duration-500 rotate-90 md:rotate-0" style={{ color: accentColor }}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
            <ScrollReveal delay={i * 0.12}>
              <div
                className="w-full sm:w-auto flex-1 min-w-0 max-w-[320px] sm:max-w-[280px] text-center p-6 sm:p-9 rounded-2xl relative transition-all duration-500 hover:-translate-y-1"
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid color-mix(in srgb, ${accentColor} 15%, var(--border))`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accentColor;
                  e.currentTarget.style.boxShadow = `0 12px 40px ${accentColor}22`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `color-mix(in srgb, ${accentColor} 15%, var(--border))`;
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <span className="absolute top-2 sm:top-3.5 right-3 sm:right-[18px] text-3xl sm:text-[42px] font-extrabold leading-none select-none" style={{ color: "var(--text-muted)", opacity: 0.08 }}>
                  {step.number}
                </span>
                <div
                  className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] mx-auto mb-3 sm:mb-[18px] rounded-[12px] sm:rounded-[16px] flex items-center justify-center text-white text-lg sm:text-[22px] transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: accentColor,
                    boxShadow: `0 8px 30px ${accentColor}44`,
                  }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {step.icon}
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">{step.desc}</p>
              </div>
            </ScrollReveal>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
