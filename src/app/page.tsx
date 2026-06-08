"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { fetchMedia } from "@/lib/client";
import type { MediaItem, ProfileInfo, Platform } from "@/lib/types";
import { getPlatformInfo } from "@/lib/types";
import Navbar from "@/components/Navbar";
import InputCard from "@/components/InputCard";
import PlatformPicker from "@/components/PlatformPicker";
import ResultsGrid from "@/components/ResultsGrid";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [title, setTitle] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [fadeState, setFadeState] = useState<"visible" | "fading" | "hidden">("visible");
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const info = getPlatformInfo(platform);

  const heroOpacity = fadeState === "visible" ? 1 : 0.35;
  const heroScale = fadeState === "visible" ? 1 : 0.96;

  useEffect(() => {
    function onMove(e: MouseEvent) {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    }
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => { window.removeEventListener("mousemove", onMove); if (fadeTimer.current) clearTimeout(fadeTimer.current); };
  }, []);

  const handlePlatformChange = useCallback((p: Platform) => {
    if (p === platform || fadeState !== "visible") return;
    setFadeState("fading");
    fadeTimer.current = setTimeout(() => {
      setPlatform(p);
      setFadeState("hidden");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFadeState("visible");
        });
      });
    }, 180);
  }, [platform, fadeState]);

  async function handleFetch(plat: Platform, type: string, id: string, username?: string) {
    setLoading(true);
    setError(null);
    setItems([]);
    setProfile(null);
    setTitle("");

    try {
      const result = await fetchMedia(plat, type, id, username);
      setItems(result.items);
      setProfile(result.profile ?? null);
      setTitle(result.title ?? "");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check the link and try again.");
    } finally {
      setLoading(false);
    }
  }

  const heroBadge = `${info.name} Downloader`;
  const heroTitle = (
    <>
      Download From <br className="hidden xs:block sm:hidden" />
      <span style={{ color: info.color }}>{info.name}</span>
    </>
  );
  const heroSubtitle = info.hint
    ? `${info.hint} — paste any link and download in HD quality.`
    : `Paste any ${info.name} link and download in HD quality.`;

  return (
    <>
      <Navbar platform={platform} />

      <section className="min-h-dvh flex items-center justify-center px-4 sm:px-6 pt-[100px] sm:pt-[120px] pb-12 sm:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-[120px] transition-all duration-700 ease-out"
            style={{
              background: info.bgGlow[0],
              left: `${mousePos.x * 100}%`,
              top: `${mousePos.y * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-[100px] transition-all duration-1000 ease-out"
            style={{
              background: info.bgGlow[1],
              left: `${(1 - mousePos.x) * 100}%`,
              top: `${(1 - mousePos.y) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute w-[800px] h-[800px] rounded-full opacity-15 blur-[150px] transition-all duration-500 ease-out"
            style={{
              background: info.bgGlow[2],
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        <div className="relative z-10 w-full max-w-[720px] text-center" style={{ opacity: heroOpacity, transform: `scale(${heroScale})`, transition: "opacity 0.22s ease, transform 0.22s ease" }}>
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 glass rounded-full text-[10px] sm:text-xs font-medium text-text-secondary mb-4 sm:mb-6">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: info.color, transition: "color 0.5s ease" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {heroBadge}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.08}>
            <h1 className="text-[clamp(28px,5vw,48px)] sm:text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.12] tracking-[-1px] sm:tracking-[-2px] text-text-primary mb-3 sm:mb-4">
              {heroTitle}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.16}>
            <p className="text-sm sm:text-lg text-text-secondary max-w-[520px] sm:max-w-[560px] mx-auto mb-6 sm:mb-9 leading-relaxed px-2 sm:px-0">
              {heroSubtitle}
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.24}>
            <PlatformPicker selected={platform} onSelect={handlePlatformChange} />
          </ScrollReveal>

          <ScrollReveal delay={0.32}>
            <InputCard onFetch={handleFetch} loading={loading} error={error} platform={platform} />
          </ScrollReveal>
        </div>
      </section>

      <ScrollReveal>
        <ResultsGrid items={items} profile={profile} title={title} platform={platform} loading={loading} />
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <HowItWorks platform={platform} />
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <Features platform={platform} />
      </ScrollReveal>

      <Footer />
    </>
  );
}
