/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Don't leak the Next.js version in the X-Powered-By response header
  poweredByHeader: false,

  // Tree-shake large icon and animation libraries at build time.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  images: {
    // Product shots rarely change — cache for 1 year
    minimumCacheTTL: 60 * 60 * 24 * 365,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Apple's product image CDN — iPhone + MacBook shots
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
        pathname: "/**",
      },
      // Supabase Storage — public objects (admin-uploaded images) AND the
      // signed/authenticated paths used for the PRIVATE enquiry-photos bucket.
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/authenticated/**",
      },
    ],
  },

  // Retired in-page wizard routes → main flow (home model picker). The SEO
  // landing pages /sell/iphone/[slug] and /sell/macbook/[slug] are unaffected
  // (these sources are exact, not wildcards).
  async redirects() {
    return [
      { source: "/sell/iphone",  destination: "/", permanent: false },
      { source: "/sell/macbook", destination: "/", permanent: false },
    ];
  },

  // ── Security headers ───────────────────────────────────────────────────────
  // Applied to every response. Free, zero-runtime-cost hardening.
  async headers() {
    // Content-Security-Policy. Allows only the origins this app actually needs:
    // Supabase (DB/auth/storage + realtime websocket) and Apple's product-image
    // CDN. script-src keeps 'unsafe-inline'/'unsafe-eval' because Next.js injects
    // inline bootstrap scripts (and dev uses eval) without a nonce setup — tighten
    // to a nonce-based policy later. frame-ancestors 'none' blocks clickjacking.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://store.storeimages.cdn-apple.com https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          // Restrict where scripts, styles, images, and connections can load from
          { key: "Content-Security-Policy",  value: csp },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options",  value: "nosniff" },
          // Block this site from being embedded in iframes (clickjacking)
          { key: "X-Frame-Options",         value: "DENY" },
          // Only send referrer to same origin
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
          // Restrict browser features — no camera/mic/geolocation access from JS
          { key: "Permissions-Policy",      value: "camera=(), microphone=(), geolocation=()" },
          // Force HTTPS for 1 year (only add in production — dev uses http)
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
