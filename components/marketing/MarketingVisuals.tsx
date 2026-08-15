import { ShieldCheck, Truck, Zap } from "lucide-react";

export const TRUST = [
  { icon: ShieldCheck, title: "100% Secure & Safe", mobileTitle: "Best Prices Guaranteed" },
  { icon: Truck, title: "Free Pickup Across City", mobileTitle: "100% Safe & Secure" },
  { icon: Zap, title: "Instant Payment", mobileTitle: "Doorstep Pickup" },
];

export function PriceTagArt({ className = "h-20 w-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 52" className={className} aria-hidden>
      <g transform="rotate(16 34 30)">
        <rect x="10" y="10" width="44" height="34" rx="9" fill="var(--brand)" />
        <circle cx="20" cy="27" r="4.5" fill="var(--brand-subtle)" />
        <text
          x="37"
          y="34"
          textAnchor="middle"
          fontSize="24"
          fontWeight="800"
          fill="var(--text-on-brand)"
          fontFamily="system-ui"
        >
          ₹
        </text>
      </g>
    </svg>
  );
}
