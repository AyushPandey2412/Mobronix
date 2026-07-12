"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll, SSR/SEO/no-JS safe.
 *
 * `shown` defaults to TRUE, so the server-rendered HTML (and any no-JS / non-JS
 * crawler) shows the content immediately — never a blank `opacity-0` section.
 * After hydration, only elements that start BELOW the fold are hidden and then
 * revealed (fade-up) as they scroll into view; anything already on screen stays
 * visible. Pair `shown` with `shown ? "animate-m-fade-up" : "opacity-0"`.
 */
export function useReveal<T extends HTMLElement>(rootMargin = "0px 0px -10% 0px") {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    // Already in view → leave visible (it just keeps its mount animation).
    if (el.getBoundingClientRect().top <= window.innerHeight) return;

    // Below the fold → hide now, reveal on scroll.
    setShown(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, shown };
}
