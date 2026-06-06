"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[20px] bg-[rgba(10,10,15,0.7)] border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-[1200px] mx-auto px-6 py-[14px] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-[38px] h-[38px] rounded-[10px] insta-gradient flex items-center justify-center text-white text-lg shadow-[0_4px_15px_rgba(225,48,108,0.4)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Insta<span className="insta-gradient-text">View</span>
          </span>
        </Link>

        <div className="hidden sm:flex gap-2">
          <Link href="/" className="px-[18px] py-2 rounded-full text-sm font-medium text-white bg-[rgba(255,255,255,0.08)] no-underline transition-colors">
            Home
          </Link>
          <a href="#how" className="px-[18px] py-2 rounded-full text-sm font-medium text-[rgba(255,255,255,0.65)] no-underline hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#features" className="px-[18px] py-2 rounded-full text-sm font-medium text-[rgba(255,255,255,0.65)] no-underline hover:text-white transition-colors">
            Features
          </a>
        </div>
      </div>
    </nav>
  );
}
