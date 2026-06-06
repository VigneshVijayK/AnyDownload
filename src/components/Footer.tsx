export default function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] py-10 px-6 text-center">
      <div className="max-w-[600px] mx-auto">
        <div className="flex items-center justify-center gap-2 text-lg font-bold text-white mb-3">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              className="text-[#e1306c]"
              d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"
            />
          </svg>
          InstaView
        </div>
        <p className="text-[rgba(255,255,255,0.35)] text-xs leading-relaxed mb-2">
          InstaView is a free tool for downloading Instagram content. We are not affiliated with Instagram or Meta.
        </p>
        <p className="text-[rgba(255,255,255,0.35)] text-[11px]">&copy; 2026 InstaView. All rights reserved.</p>
      </div>
    </footer>
  );
}
