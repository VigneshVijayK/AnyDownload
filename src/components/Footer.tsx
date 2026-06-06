export default function Footer() {
  return (
    <footer className="border-t py-8 sm:py-10 px-4 sm:px-6 text-center" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--color-insta-pink, #e1306c)" }}>
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Any Download
        </div>
        <p className="text-text-muted text-[10px] sm:text-xs leading-relaxed mb-2 px-2 sm:px-0">
          Any Download is a free tool for downloading media from Instagram, YouTube, X/Twitter, Facebook, and Threads. We are not affiliated with any of these platforms.
        </p>
        <p className="text-text-muted text-[10px] sm:text-[11px]">&copy; 2026 Any Download. All rights reserved.</p>
      </div>
    </footer>
  );
}
