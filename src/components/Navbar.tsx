"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPlatformInfo } from "@/lib/types";
import type { Platform } from "@/lib/types";

type NavbarProps = {
  platform?: Platform;
};

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute("data-theme") as "dark" | "light" || "dark";
    setTheme(current);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch {}
  }

  if (!mounted) return <div className="w-8 h-8 sm:w-9 sm:h-9" />;

  return (
    <button
      onClick={toggle}
      type="button"
      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border-none rounded-lg bg-bg-card text-text-secondary cursor-pointer hover:text-text-primary hover:bg-bg-card-hover transition-all shrink-0"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar({ platform }: NavbarProps) {
  const info = platform ? getPlatformInfo(platform) : null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[20px] border-b" style={{ background: "var(--nav-bg)", borderColor: "var(--nav-border)" }}>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-3 sm:py-[14px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 no-underline">
          <div
            className="w-8 h-8 sm:w-[38px] sm:h-[38px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center text-white shadow-lg transition-all duration-500"
            style={{
              background: info?.color || "linear-gradient(135deg, #833ab4 0%, #e1306c 40%, #fd1d1d 70%, #fcaa45 100%)",
              boxShadow: info ? `0 4px 20px ${info.color}55` : "0 4px 15px rgba(225,48,108,0.4)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 sm:w-[18px] sm:h-[18px]">
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-base sm:text-xl font-bold tracking-tight text-text-primary">
            Any <span style={{ color: info?.color || "#e1306c" }}>Download</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex gap-2">
            <Link href="/" className="px-3 sm:px-[18px] py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-text-secondary bg-bg-card no-underline transition-colors hover:text-text-primary">
              Home
            </Link>
            <a href="#how" className="px-3 sm:px-[18px] py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-text-secondary no-underline transition-colors hover:text-text-primary">
              How It Works
            </a>
            <a href="#features" className="px-3 sm:px-[18px] py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-text-secondary no-underline transition-colors hover:text-text-primary">
              Features
            </a>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
