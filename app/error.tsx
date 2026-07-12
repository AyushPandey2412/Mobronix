"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      {/* Illustration — cracked screen / broken device feel */}
      <div className="relative mx-auto mb-8 w-52 h-44 select-none" aria-hidden="true">
        <svg viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background blob */}
          <ellipse cx="100" cy="148" rx="82" ry="16" fill="#FFF5EE"/>
          <path d="M15 120C15 120 -3 108 3 98C6 92 17 95 16 86C14 72 2 63 9 53C17 43 36 56 54 46C66 39 85 34 93 46C100 57 86 68 96 77C106 86 118 98 93 110C68 122 42 113 42 113" fill="#FFF0E8"/>

          {/* Phone device */}
          <rect x="48" y="20" width="72" height="120" rx="10" fill="#1E293B"/>
          <rect x="52" y="28" width="64" height="96" rx="6" fill="#0F172A"/>

          {/* Cracked screen — lightning bolt cracks */}
          <path d="M72 38l-8 22h14l-10 30" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M90 52l-5 14h9l-6 18" stroke="#FE881A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
          {/* Glow on cracks */}
          <path d="M72 38l-8 22h14l-10 30" stroke="#FF9F43" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15"/>

          {/* Screen glass shards */}
          <path d="M52 34l12 8-4-14z" fill="#334155" opacity="0.8"/>
          <path d="M100 38l8 12 4-16z" fill="#334155" opacity="0.6"/>

          {/* Error icon on screen */}
          <circle cx="84" cy="72" r="14" fill="#FF9F43" opacity="0.15"/>
          <circle cx="84" cy="72" r="10" fill="#FF9F43"/>
          <text x="84" y="77" textAnchor="middle" fontSize="12" fontWeight="800" fill="white" fontFamily="system-ui">!</text>

          {/* Home button */}
          <circle cx="84" cy="134" r="7" stroke="#334155" strokeWidth="1.5"/>

          {/* Sparks coming off phone */}
          <line x1="130" y1="55" x2="138" y2="48" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round"/>
          <line x1="132" y1="65" x2="142" y2="63" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round"/>
          <line x1="128" y1="75" x2="136" y2="80" stroke="#FE881A" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
          <line x1="35" y1="58" x2="27" y2="52" stroke="#FF9F43" strokeWidth="2" strokeLinecap="round"/>
          <line x1="33" y1="70" x2="24" y2="70" stroke="#FF9F43" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
        </svg>
      </div>

      <h1 className="text-h2 font-extrabold tracking-tight text-text-primary">Something went wrong</h1>
      <p className="mx-auto mt-3 max-w-sm text-body-md text-text-secondary leading-relaxed">
        An unexpected error occurred. Your data is safe — please try again or go back to the homepage.
      </p>

      {error.digest && (
        <p className="mt-2 font-mono text-caption text-text-disabled">Error ID: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body-sm font-semibold text-white hover:bg-brand-hover transition-colors shadow-sm"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-6 text-body-sm font-semibold text-text-primary hover:bg-neutral-50 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
