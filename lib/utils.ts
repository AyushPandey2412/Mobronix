import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the project's custom fontSize utilities (text-body-md, text-h2, …)
// as font-size classes. Without this, tailwind-merge mistakes them for text
// COLOR classes and silently drops real colors like `text-text-on-brand`,
// leaving sized buttons with no text colour (they inherit the body ink).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl", "display-l", "display-m",
            "h1", "h2", "h3", "h4",
            "body-lg", "body-md", "body-sm",
            "caption", "label", "overline",
          ],
        },
      ],
    },
  },
});

/** Tailwind-aware className merge. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an integer rupee amount as ₹1,23,456 (Indian grouping). */
export function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

/** Format a percentage delta from a multiplier, e.g. 0.85 -> "−15%". */
export function factorLabel(factor: number) {
  const pct = Math.round((factor - 1) * 100);
  if (pct === 0) return "base";
  return pct > 0 ? `+${pct}%` : `${pct}%`;
}

/** Generate a pseudo-unique enquiry id. */
export function makeEnquiryId() {
  return "ENQ" + Math.floor(10000 + Math.random() * 89999);
}

/** Format an ISO date for display, e.g. "21 Jun, 10:12 AM". */
export function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
