"use client";

import { useState, useCallback } from "react";
import { PLATFORMS } from "@/lib/types";
import type { Platform } from "@/lib/types";

type PlatformPickerProps = {
  selected: Platform;
  onSelect: (platform: Platform) => void;
};

export default function PlatformPicker({ selected, onSelect }: PlatformPickerProps) {
  const [clickedId, setClickedId] = useState<string | null>(null);

  const handleClick = useCallback((id: Platform) => {
    if (id === selected) return;
    setClickedId(id);
    onSelect(id);
    setTimeout(() => setClickedId(null), 350);
  }, [selected, onSelect]);

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2 sm:px-0">
      {PLATFORMS.map((p) => {
        const isActive = selected === p.id;
        const isClicked = clickedId === p.id;
        return (
          <button
            key={p.id}
            onClick={() => handleClick(p.id)}
            type="button"
            className={`group relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-pointer outline-none ${
              isClicked ? "animate-bounce-click" : ""
            } ${isActive ? "text-white" : "text-text-secondary"}`}
            style={{
              background: isActive
                ? p.color
                : "var(--bg-card)",
              border: `1px solid ${
                isActive
                  ? p.color
                  : "var(--border)"
              }`,
              boxShadow: isActive
                ? `0 4px 24px ${p.color}55`
                : "none",
              transform: isActive ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--bg-card-hover)";
                e.currentTarget.style.borderColor = `${p.color}44`;
                e.currentTarget.style.transform = "scale(1.03)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = "var(--bg-card)";
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            onMouseDown={(e) => {
              if (!isActive) e.currentTarget.style.transform = "scale(0.93)";
            }}
            onMouseUp={(e) => {
              if (!isActive) e.currentTarget.style.transform = "scale(1.03)";
            }}
          >
            <div className="relative">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                <path d={p.icon} />
              </svg>
            </div>
            <span className="hidden xs:inline sm:inline">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
