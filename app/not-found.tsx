import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 py-16 text-center">
      {/* Illustration — matches SVG style: blue/orange, folder + search */}
      <div className="relative mx-auto mb-8 w-56 h-48 select-none" aria-hidden="true">
        <svg viewBox="0 0 220 190" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Cloud/blob background */}
          <ellipse cx="110" cy="155" rx="90" ry="18" fill="#EEF4FF" />
          <path d="M18 130C18 130 -2 118 4 107C7 101 20 103 18 93C16 79 2 70 10 59C19 47 40 62 60 50C73 42 95 37 103 50C111 63 95 76 107 85C119 94 132 107 104 120C76 133 52 122 52 122" fill="#EEF4FF"/>

          {/* Folder body */}
          <rect x="32" y="72" width="98" height="72" rx="5" fill="white" stroke="#E2E8F0" strokeWidth="1.5"/>
          <path d="M32 84h98" stroke="#E2E8F0" strokeWidth="1.5"/>
          <path d="M32 78c0-3.3 2.7-6 6-6h18l6 8H32z" fill="#C7D7FF"/>

          {/* Papers in folder */}
          <rect x="44" y="92" width="74" height="6" rx="3" fill="#EEF4FF"/>
          <rect x="44" y="104" width="60" height="5" rx="2.5" fill="#EEF4FF"/>
          <rect x="44" y="115" width="48" height="5" rx="2.5" fill="#EEF4FF"/>

          {/* Magnifier */}
          <circle cx="138" cy="108" r="28" fill="#FFF5ED" stroke="#FF9F43" strokeWidth="2.5"/>
          <circle cx="138" cy="108" r="19" fill="white" stroke="#FF9F43" strokeWidth="2"/>
          {/* glass shine */}
          <path d="M128 99c3-3 7-5 11-5" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          {/* handle */}
          <line x1="153" y1="123" x2="165" y2="136" stroke="#FF9F43" strokeWidth="5" strokeLinecap="round"/>

          {/* 404 small text */}
          <text x="122" y="113" textAnchor="middle" fontSize="13" fontWeight="700" fill="#FF9F43" fontFamily="system-ui">404</text>
        </svg>
      </div>

      <h1 className="text-h2 font-extrabold tracking-tight text-text-primary">Page not found</h1>
      <p className="mx-auto mt-3 max-w-sm text-body-md text-text-secondary leading-relaxed">
        We looked everywhere but couldn&apos;t find this page. It may have moved or the link might be wrong.
      </p>

      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-body-sm font-semibold text-white hover:bg-brand-hover transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Back to home
        </Link>
        <Link
          href="/#models"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-border bg-surface px-6 text-body-sm font-semibold text-text-primary hover:bg-neutral-50 transition-colors"
        >
          Get a quote
        </Link>
      </div>
    </div>
  );
}
