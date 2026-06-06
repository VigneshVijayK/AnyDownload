"use client";

import { useEffect, useRef, useState } from "react";

type UseScrollRevealOptions = {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
};

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.08,
  rootMargin = "0px 0px -40px 0px",
  triggerOnce = true,
}: UseScrollRevealOptions = {}) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (triggerOnce && revealed)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          if (triggerOnce) observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, revealed]);

  return { ref, revealed };
}
