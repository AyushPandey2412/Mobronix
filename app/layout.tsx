import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { AppChrome } from "@/components/shared/AppChrome";
import { RouteProgress } from "@/components/shared/RouteProgress";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jbmono",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Mobronix — Sell your used device in Mumbai, get paid today",
    template: "%s | Mobronix",
  },
  description:
    "Get an instant price for your used device, free doorstep pickup, and same-day payout via UPI or cash. Serving Mumbai, Navi Mumbai & Thane.",
  keywords: [
    "sell used iPhone Mumbai",
    "sell second hand iPhone",
    "iPhone buyback Mumbai",
    "sell old iPhone Navi Mumbai",
    "sell iPhone Thane",
    "iPhone resale price India",
    "sell iPhone online Mumbai",
    "instant cash for iPhone",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "Mobronix",
    title: "Mobronix — Sell your used device in Mumbai, get paid today",
    description:
      "Instant price, free doorstep pickup, same-day UPI payment. Trusted by 12,400+ sellers across Mumbai, Navi Mumbai & Thane.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Mobronix — Sell your device, get paid today",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobronix — Sell your used device in Mumbai, get paid today",
    description:
      "Instant price, free doorstep pickup, same-day UPI payment across Mumbai, Navi Mumbai & Thane.",
    images: ["/og-default.png"],
  },
  alternates: {
    canonical: APP_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A56DB",
};

// Origin of the Supabase project, for an early connection hint (browser talks to
// Supabase directly for auth + live queries). Pure perf, no visual effect.
const SUPABASE_ORIGIN = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "").origin; } catch { return ""; }
})();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // <html lang="en" className={`${inter.variable} ${jbMono.variable}`}>
    <html
  lang="en"
  className={`${inter.variable} ${jbMono.variable}`}
  suppressHydrationWarning
>
      <head>
        {SUPABASE_ORIGIN && <link rel="preconnect" href={SUPABASE_ORIGIN} crossOrigin="anonymous" />}
        {SUPABASE_ORIGIN && <link rel="dns-prefetch" href={SUPABASE_ORIGIN} />}
      </head>
      {/* <body className="min-h-screen bg-background antialiased"> */}
      <body
  suppressHydrationWarning
  className="min-h-screen bg-background antialiased"
>
        <Providers>
          <RouteProgress />
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
