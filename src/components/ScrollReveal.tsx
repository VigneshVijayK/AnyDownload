"use client";

import { ReactNode } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export default function ScrollReveal({ children, className = "", delay = 0 }: ScrollRevealProps) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
