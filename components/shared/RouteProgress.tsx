"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Slim top loading bar shown during client-side navigation (YouTube/GitHub style).
 * Starts when an internal link is clicked (or a route change begins) and creeps
 * forward continuously so even slow transitions (e.g. Track, or a dev compile)
 * never look frozen. Completes when the new route mounts.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [width, setWidth] = useState(0);
  const trickle = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const firstRender = useRef(true);

  const stop = useCallback(() => {
    if (trickle.current) { window.clearInterval(trickle.current); trickle.current = null; }
    if (hideTimer.current) { window.clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  const start = useCallback(() => {
    stop();
    setActive(true);
    setWidth(10);
    // Continuously creep toward ~92% so long waits keep showing progress.
    trickle.current = window.setInterval(() => {
      setWidth((w) => (w >= 92 ? w : w + Math.max(0.5, (92 - w) * 0.07)));
    }, 180);
  }, [stop]);

  const done = useCallback(() => {
    stop();
    setWidth(100);
    hideTimer.current = window.setTimeout(() => { setActive(false); setWidth(0); }, 250);
  }, [stop]);

  // Start the bar the instant an internal link is clicked.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = (e.target as HTMLElement)?.closest?.("a");
      if (!el) return;
      const href = el.getAttribute("href");
      if (!href || !href.startsWith("/") || el.target === "_blank") return;
      if (href === pathname) return;
      start();
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [pathname, start]);

  // Complete (and flash to 100%) whenever the route actually changes.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    done();
  }, [pathname, done]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]">
      <div
        className="h-full bg-brand shadow-[0_0_8px_rgba(26,86,219,0.55)] transition-[width] duration-200 ease-out"
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
