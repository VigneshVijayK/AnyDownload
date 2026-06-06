"use client";

import { useState } from "react";
import { fetchMedia } from "@/lib/instagram";
import type { MediaItem, ProfileInfo } from "@/lib/instagram";
import Navbar from "@/components/Navbar";
import InputCard from "@/components/InputCard";
import ResultsGrid from "@/components/ResultsGrid";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [singlePost, setSinglePost] = useState(false);

  async function handleFetch(type: string, id: string, username?: string) {
    setLoading(true);
    setError(null);
    setItems([]);
    setProfile(null);
    setSinglePost(type !== "profile");

    try {
      const result = await fetchMedia(type, id, username);
      setItems(result.items);
      setProfile(result.profile ?? null);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check the link and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <section className="min-h-screen flex items-center justify-center px-6 pt-[120px] pb-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute w-[600px] h-[600px] rounded-full bg-[#833ab4] opacity-40 blur-[120px] top-[-15%] left-[-10%] animate-[float_20s_ease-in-out_infinite]" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-[#e1306c] opacity-40 blur-[120px] bottom-[-10%] right-[-10%] animate-[float_20s_ease-in-out_infinite_7s]" />
          <div className="absolute w-[400px] h-[400px] rounded-full bg-[#fd1d1d] opacity-30 blur-[120px] top-[40%] left-1/2 -translate-x-1/2 animate-[float_20s_ease-in-out_infinite_14s]" />
        </div>

        <div className="relative z-10 max-w-[720px] w-full text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 glass rounded-full text-xs font-medium text-[rgba(255,255,255,0.65)] mb-6">
            <svg className="w-3.5 h-3.5 text-[#e1306c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instagram Downloader
          </div>

          <h1 className="text-[clamp(36px,6vw,64px)] font-extrabold leading-[1.12] tracking-[-2px] text-white mb-4">
            Download Anything From<br />
            <span className="insta-gradient-text">Instagram</span>
          </h1>

          <p className="text-lg text-[rgba(255,255,255,0.65)] max-w-[560px] mx-auto mb-9 leading-relaxed">
            Posts, Reels, Stories, Highlights, Profiles — paste any Instagram link or username and download in HD quality.
          </p>

          <InputCard onFetch={handleFetch} loading={loading} error={error} />
        </div>
      </section>

      <ResultsGrid items={items} profile={profile} singlePost={singlePost} />

      <HowItWorks />
      <Features />
      <Footer />
    </>
  );
}
