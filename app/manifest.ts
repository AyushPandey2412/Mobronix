import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.mobronix.com";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mobronix",
    short_name: "Mobronix",
    description: "Sell used phones, iPhones and MacBooks with free doorstep pickup and quick payout.",
    start_url: APP_URL,
    scope: APP_URL,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1A56DB",
    icons: [
      { src: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/favicon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
