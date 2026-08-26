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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mobronix.com";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Mobronix Sell Used Phones, iPhones & MacBooks in Mumbai",
    template: "%s | Mobronix",
  },
  description:
    "Sell your used phone, iPhone or MacBook in Mumbai, Navi Mumbai, Thane and Sangli. Free doorstep pickup, quick inspection and same-day UPI or cash payout.",
  keywords: [
    "sell used iPhone Mumbai",
    "sell second hand iPhone",
    "iPhone buyback Mumbai",
    "sell old iPhone Navi Mumbai",
    "sell iPhone Thane",
    "sell iPhone Sangli",
    "iPhone resale price India",
    "sell iPhone online Mumbai",
    "instant cash for iPhone",
    "sell used MacBook Mumbai",
    "MacBook buyback Mumbai",
    "sell old MacBook online India",
    "instant cash for MacBook",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: APP_URL,
    siteName: "Mobronix",
    title: "Mobronix Sell Used Phones, iPhones & MacBooks in Mumbai",
    description:
      "Sell your used phone, iPhone or MacBook with free doorstep pickup and same-day payout across Mumbai, Navi Mumbai, Thane and Sangli.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Mobronix Sell your device, get paid today",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobronix Sell Used Phones, iPhones & MacBooks in Mumbai",
    description:
      "Sell your used phone, iPhone or MacBook with free doorstep pickup and same-day payout across Mumbai, Navi Mumbai, Thane and Sangli.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
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

