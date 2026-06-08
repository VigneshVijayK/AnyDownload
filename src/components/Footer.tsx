"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { VERSION } from "@/lib/version";

const UPI_ID = "vigneshvijayk@iob";
const UPI_URL = `upi://pay?pa=${UPI_ID}&pn=Developer&tn=Support+Development&am=1&cu=INR`;

export default function Footer() {
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (showQr && !qrDataUrl) {
      QRCode.toDataURL(UPI_URL, {
        width: 240,
        margin: 2,
        color: { dark: "#1a1a2e", light: "#ffffff" },
      }).then(setQrDataUrl);
    }
  }, [showQr, qrDataUrl]);

  function handleCoffeeClick() {
    setShowQr(true);
  }

  function handleCopyUpiId() {
    navigator.clipboard.writeText(UPI_ID);
    alert("UPI ID copied!");
  }

  return (
    <>
      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setShowQr(false)}
        >
          <div
            className="rounded-2xl p-6 sm:p-8 text-center max-w-[320px] animate-scale-in"
            style={{ background: "var(--bg-primary, #1a1a2e)", border: "2px solid var(--border, #333)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="UPI QR code" className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] rounded-xl" />
              ) : (
                <div className="w-[220px] h-[220px] sm:w-[240px] sm:h-[240px] rounded-xl flex items-center justify-center" style={{ background: "var(--bg-inset)" }}>
                  <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24" style={{ color: "var(--text-muted)" }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm font-bold text-text-primary mb-1">Scan QR or copy UPI ID</p>
            <p className="text-xs font-mono font-semibold text-text-primary break-all mb-3 p-2 rounded-lg" style={{ background: "var(--bg-inset)" }}>{UPI_ID}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleCopyUpiId}
                type="button"
                className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 hover:brightness-125"
                style={{ background: "var(--color-insta-pink, #e1306c)", color: "#fff" }}
              >
                Copy UPI ID
              </button>
              <button
                onClick={() => setShowQr(false)}
                type="button"
                className="px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 hover:brightness-125"
                style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t py-8 sm:py-10 px-4 sm:px-6 text-center" style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}>
        <div className="max-w-[600px] mx-auto">
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-text-primary mb-2 sm:mb-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--color-insta-pink, #e1306c)" }}>
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Any Download
          </div>
          <p className="text-text-muted text-[10px] sm:text-xs leading-relaxed mb-2 px-2 sm:px-0">
            Any Download is a free tool for downloading media from Instagram, YouTube, X/Twitter, and Facebook. We are not affiliated with any of these platforms.
          </p>

          <div className="flex items-center justify-center my-4 sm:my-5">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-text-muted no-underline transition-colors duration-300 hover:text-text-primary"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              Developer
            </a>
          </div>

          <button
            onClick={handleCoffeeClick}
            type="button"
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[12px] sm:text-sm font-semibold no-underline transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 mb-3 sm:mb-4 cursor-pointer border-none"
            style={{
              background: "linear-gradient(135deg, #FF813F 0%, #FFD43A 100%)",
              color: "#1a1a2e",
              boxShadow: "0 4px 15px rgba(255,129,63,0.35)",
            }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.881 8.948c-.773-1.089-2.25-1.305-3.604-1.305H14.17l-.445-1.903-.672-2.874c-.194-.832-1.492-1.057-1.976-1.057h-4.63c-.21 0-.445.053-.613.211-.168.158-.242.405-.194.653l1.488 6.343c-.125.615-.508 1.154-1.086 1.445-.367.188-.773.281-1.18.281H4.567c-.422 0-.844.141-1.148.422-.305.281-.469.668-.399 1.054l.422 1.793c.125.527.574.898 1.125.898h2.676c.199 0 .398.035.586.105.187.07.356.176.494.316.137.141.246.309.317.492.07.183.105.375.105.57 0 .445-.18.867-.492 1.172-.313.305-.738.48-1.188.48H4.777c-.445 0-.867.176-1.18.48-.312.305-.48.727-.48 1.172v.484c0 .445.168.867.48 1.172.313.305.735.48 1.18.48h1.52c.254 0 .492.035.719.105.574.176 1.043.55 1.332 1.066.29.515.38 1.094.27 1.653l-.507 2.867c-.082.445.047.898.351 1.23.305.332.73.504 1.172.504h5.195c.68 0 1.254-.43 1.457-1.078l.191-.598.648-2.117c.082-.258.23-.484.418-.668.188-.184.418-.316.668-.387.25-.07.508-.093.762-.066.254.027.5.117.715.258.214.14.399.324.536.543.137.219.223.465.254.723l.023.117c.059.328.192.637.387.91.195.273.445.504.734.672.29.168.62.277.96.316.34.039.68 0 1.008-.117l4.074-1.363c.493-.164.863-.566.984-1.074l.07-.293c.32-1.328-.504-2.688-1.848-3.043-.07-.02-.144-.035-.219-.05l-5.242-1.254c-.422-.101-.773-.402-.937-.801-.164-.399-.14-.848.07-1.23l.07-.129c.195-.379.543-.655.957-.758l4.488-1.125c.5-.125.93-.45 1.172-.887.242-.438.273-.96.074-1.426z" />
            </svg>
            Buy me a coffee
          </button>

          <p className="text-text-muted text-[10px] sm:text-[11px]">&copy; 2026 Any Download. All rights reserved.</p>
          <p className="text-text-muted text-[9px] sm:text-[10px] mt-1 opacity-60">{VERSION}</p>
        </div>
      </footer>
    </>
  );
}
