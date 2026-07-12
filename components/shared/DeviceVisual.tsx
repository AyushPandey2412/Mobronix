"use client";

import { cn } from "@/lib/utils";

/**
 * Original, stylised iPhone illustration used as the product hero.
 * Pure SVG so it stays crisp at any size and needs no image assets.
 */
export function DeviceVisual({
  className,
  floating = true,
  tone = "graphite",
}: {
  className?: string;
  floating?: boolean;
  tone?: "graphite" | "blue" | "sand";
}) {
  const screen =
    tone === "blue"
      ? ["#1E3A8A", "#2F6BF6"]
      : tone === "sand"
      ? ["#3F3B33", "#8A7E66"]
      : ["#0B1220", "#28324A"];
  const body = tone === "sand" ? "#C9BCA0" : tone === "blue" ? "#5A8FFF" : "#3A4254";

  return (
    <div className={cn("relative", floating && "animate-m-float", className)}>
      <svg viewBox="0 0 220 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full drop-shadow-2xl">
        <defs>
          <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={screen[0]} />
            <stop offset="1" stopColor={screen[1]} />
          </linearGradient>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={body} stopOpacity="0.95" />
            <stop offset="1" stopColor={body} stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* frame */}
        <rect x="8" y="8" width="204" height="424" rx="46" fill="url(#bodyGrad)" />
        <rect x="8" y="8" width="204" height="424" rx="46" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
        {/* screen */}
        <rect x="18" y="18" width="184" height="404" rx="38" fill="url(#screenGrad)" />
        {/* glare */}
        <rect x="18" y="18" width="184" height="404" rx="38" fill="url(#glare)" />

        {/* dynamic island */}
        <rect x="84" y="34" width="52" height="15" rx="7.5" fill="#05070D" />

        {/* abstract UI hint */}
        <rect x="40" y="92" width="92" height="10" rx="5" fill="#ffffff" fillOpacity="0.85" />
        <rect x="40" y="112" width="140" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.35" />
        <rect x="40" y="126" width="118" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.25" />

        <rect x="40" y="168" width="140" height="64" rx="16" fill="#ffffff" fillOpacity="0.12" />
        <rect x="40" y="248" width="66" height="66" rx="16" fill="#ffffff" fillOpacity="0.12" />
        <rect x="114" y="248" width="66" height="66" rx="16" fill="#ffffff" fillOpacity="0.12" />

        <rect x="40" y="338" width="140" height="44" rx="22" fill="#ffffff" fillOpacity="0.9" />

        {/* side buttons */}
        <rect x="4" y="120" width="4" height="34" rx="2" fill={body} />
        <rect x="4" y="170" width="4" height="34" rx="2" fill={body} />
        <rect x="212" y="150" width="4" height="50" rx="2" fill={body} />
      </svg>
    </div>
  );
}
