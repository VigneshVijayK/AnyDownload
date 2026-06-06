"use client";

import { PLATFORMS } from "@/lib/types";
import type { Platform } from "@/lib/types";

type PlatformPickerProps = {
  selected: Platform;
  onSelect: (platform: Platform) => void;
};

export default function PlatformPicker({ selected, onSelect }: PlatformPickerProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2 sm:px-0">
      {PLATFORMS.map((p) => {
        const isActive = selected === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            type="button"
            className={`group relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer border ${
              isActive
                ? "text-white scale-105"
                : "text-text-secondary hover:text-text-primary border-transparent"
            }`}
            style={{
              background: isActive ? p.color : "var(--bg-card)",
              borderColor: isActive ? p.color : "var(--border)",
              boxShadow: isActive ? `0 4px 24px ${p.color}55` : "none",
            }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d={p.icon} />
            </svg>
            <span className="hidden xs:inline sm:inline">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
