"use client";

import { cn } from "@/lib/utils";
import { useReveal } from "@/lib/useReveal";

/* ── Small 4-point sparkle ─────────────────────────────────────────────── */
function Spark({ x, y, s = 5, c = "#5A8FFF" }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <path
      d={`M${x} ${y - s} C ${x} ${y - s * 0.3}, ${x + s * 0.3} ${y}, ${x + s} ${y}
          C ${x + s * 0.3} ${y}, ${x} ${y + s * 0.3}, ${x} ${y + s}
          C ${x} ${y + s * 0.3}, ${x - s * 0.3} ${y}, ${x - s} ${y}
          C ${x - s * 0.3} ${y}, ${x} ${y - s * 0.3}, ${x} ${y - s} Z`}
      fill={c}
    />
  );
}


/* ── 1. Get a Quote — phone + price tag ────────────────────────────────── */
function QuoteArt() {
  return (
    <svg viewBox="0 0 150 150" className="h-24 w-24 md:h-36 md:w-36">
      <Spark x={26} y={50} />
      <Spark x={122} y={36} s={6} />
      <Spark x={126} y={94} s={4} />
      {/* phone */}
      <rect x="46" y="26" width="54" height="96" rx="12" fill="#fff" stroke="#1546B0" strokeWidth="3" />
      <rect x="52" y="34" width="42" height="72" rx="5" fill="#EEF4FF" />
      <circle cx="73" cy="64" r="14" fill="#D9E6FF" />
      <text x="73" y="70" textAnchor="middle" fontSize="18" fontWeight="700" fill="#1546B0" fontFamily="system-ui">₹</text>
      <rect x="65" y="112" width="16" height="3.5" rx="1.75" fill="#BCD3FF" />
      {/* price tag */}
      <g transform="rotate(20 98 106)">
        <rect x="80" y="92" width="38" height="28" rx="7" fill="#1A56DB" />
        <circle cx="88" cy="106" r="4" fill="#EEF4FF" />
        <text x="102" y="111" textAnchor="middle" fontSize="14" fontWeight="800" fill="#fff" fontFamily="system-ui">₹</text>
      </g>
    </svg>
  );
}

/* ── 2. Schedule Pickup — calendar + van ───────────────────────────────── */
function PickupArt() {
  return (
    <svg viewBox="0 0 150 150" className="h-24 w-24 md:h-36 md:w-36">
      <Spark x={120} y={40} />
      <Spark x={28} y={60} s={4} />
      {/* calendar */}
      <rect x="40" y="26" width="64" height="52" rx="7" fill="#fff" stroke="#1546B0" strokeWidth="2.5" />
      <path d="M40 41 a7 7 0 0 1 7-7 h50 a7 7 0 0 1 7 7 v1 H40 Z" fill="#1A56DB" />
      <rect x="53" y="21" width="4.5" height="13" rx="2.25" fill="#1546B0" />
      <rect x="87" y="21" width="4.5" height="13" rx="2.25" fill="#1546B0" />
      {[0, 1, 2, 3].map((c) =>
        [0, 1].map((r) => (
          <rect key={`${c}-${r}`} x={48 + c * 13} y={49 + r * 11} width="7" height="6.5" rx="1.5" fill="#D9E6FF" />
        ))
      )}
      {/* approved check */}
      <circle cx="92" cy="66" r="11" fill="#1A56DB" />
      <path d="M87 66 l3.6 3.6 L97 62" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* van */}
      <rect x="24" y="92" width="58" height="26" rx="6" fill="#1A56DB" />
      <path d="M82 98 h13 l14 12 v8 h-27 Z" fill="#1546B0" />
      <rect x="91" y="101" width="14" height="9" rx="2" fill="#D9E6FF" />
      <rect x="18" y="119" width="104" height="4" rx="2" fill="#BCD3FF" />
      <circle cx="44" cy="119" r="8" fill="#17356F" />
      <circle cx="44" cy="119" r="3.5" fill="#fff" />
      <circle cx="100" cy="119" r="8" fill="#17356F" />
      <circle cx="100" cy="119" r="3.5" fill="#fff" />
    </svg>
  );
}

/* ── 3. Get Paid — wallet + UPI ────────────────────────────────────────── */
function PaidArt() {
  return (
    <svg viewBox="0 0 150 150" className="h-24 w-24 md:h-36 md:w-36">
      <Spark x={34} y={46} />
      <Spark x={116} y={50} s={4} />
      {/* cash */}
      <rect x="52" y="32" width="48" height="30" rx="4" fill="#D9E6FF" stroke="#1546B0" strokeWidth="2" />
      <circle cx="76" cy="47" r="7" fill="#8EB6FF" />
      {/* wallet */}
      <rect x="34" y="50" width="82" height="56" rx="11" fill="#1A56DB" />
      <path d="M34 65 h82 v30 a11 11 0 0 1-11 11 H45 a11 11 0 0 1-11-11 Z" fill="#1546B0" />
      <rect x="86" y="73" width="30" height="17" rx="8.5" fill="#163C8C" />
      <circle cx="101" cy="81.5" r="4.5" fill="#BCD3FF" />
      {/* UPI badge */}
      <rect x="84" y="96" width="48" height="30" rx="7" fill="#fff" stroke="#E2E8F0" strokeWidth="1.5" />
      <text x="96" y="115" fontSize="12" fontWeight="800" fill="#1546B0" fontFamily="system-ui">UPI</text>
      <path d="M119 106 l7 6 l-7 6" stroke="#F79009" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* paid check */}
      <circle cx="126" cy="120" r="11" fill="#1A56DB" stroke="#fff" strokeWidth="2.5" />
      <path d="M121 120 l3.6 3.6 L131 116" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  {
    n: 1,
    title: "Get a Quote",
    desc: "Tell us about your iPhone and its condition. Get an instant, best market price in seconds.",
    Art: QuoteArt,
  },
  {
    n: 2,
    title: "Schedule Pickup",
    desc: "Choose a convenient date and time. Our executive will pickup your device from your doorstep — for free.",
    Art: PickupArt,
  },
  {
    n: 3,
    title: "Get Paid",
    desc: "We inspect your iPhone and make payment instantly via UPI or bank transfer. No waiting, no hassle.",
    Art: PaidArt,
  },
];

export function HowItWorks() {
  const { ref, shown } = useReveal<HTMLDivElement>();
  return (
    <section id="how" className="scroll-mt-24 bg-surface pt-6 pb-10 md:pt-12 md:pb-24">
      <div className="container-app">
        {/* Heading */}
        <div className="text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand md:text-overline">How it works</span>
          <h2 className="mt-2 bg-gradient-to-br from-primary-900 to-primary-600 bg-clip-text text-[1.4rem] font-extrabold leading-tight tracking-[-0.02em] text-transparent md:text-h2">
            Simple, Fast &amp; Hassle-Free
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[13px] text-text-secondary md:text-body-md">
            Selling your Phone is as easy as 1, 2, 3.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={ref}
          className="relative mt-10 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-6"
        >
          {/* dashed connector (desktop) — sits behind the illustration circles */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[18%] right-[18%] top-[144px] hidden border-t-2 border-dashed border-primary-300 md:block"
          />

          {STEPS.map((s, i) => (
            <div
              key={s.n}
              style={shown ? { animationDelay: `${i * 100}ms` } : undefined}
              className={cn(
                shown ? "animate-m-fade-up" : "opacity-0",
                "relative z-10 flex flex-col items-center text-center"
              )}
            >
              {/* number badge */}
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-body-sm font-extrabold text-white shadow-sm ring-4 ring-primary-100">
                {s.n}
              </span>

              {/* illustration */}
              <div className="mt-4 grid h-28 w-28 place-items-center rounded-full bg-primary-50 md:mt-5 md:h-44 md:w-44">
                <s.Art />
              </div>

              {/* title + underline */}
              <h3 className="mt-4 text-h4 font-bold text-text-primary md:mt-6">{s.title}</h3>
              <span className="mt-2 block h-1 w-10 rounded-full bg-brand md:mt-2.5" />

              {/* description */}
              <p className="mt-3 max-w-xs text-body-sm leading-relaxed text-text-secondary md:mt-4">{s.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
