import type { Config } from "tailwindcss";

/**
 * Unified Tailwind config:
 *   - P1 (SellmyIphone frontend): blue design system — bg-background, bg-surface, text-text-primary, text-brand etc.
 *   - P2 (practice admin): green design system — bg-bg, text-ink, text-accent, border-line etc.
 * Both sets of tokens live here so all pages compile correctly.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "16px", md: "24px", lg: "32px" },
      screens: { "2xl": "1200px" },
    },
    screens: {
      sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1440px",
    },
    extend: {
      colors: {
        // ── P1 palette (blue) ──────────────────────────────────
        primary: {
          50: "#EEF4FF", 100: "#D9E6FF", 200: "#BCD3FF", 300: "#8EB6FF",
          400: "#5A8FFF", 500: "#2F6BF6", 600: "#1A56DB", 700: "#1546B0",
          800: "#163C8C", 900: "#17356F", 950: "#0F2147", DEFAULT: "#1A56DB",
        },
        secondary: {
          50: "#F1F0FF", 100: "#E5E3FF", 200: "#CECBFF", 300: "#ADA6FF",
          400: "#8B7DFF", 500: "#6C5CFF", 600: "#5B45F0", 700: "#4C36CC",
          800: "#3F2EA6", 900: "#352B80", DEFAULT: "#5B45F0",
        },
        success: {
          50: "#ECFDF3", 100: "#D1FADF", 200: "#A6F4C5", 300: "#6CE9A6",
          400: "#32D583", 500: "#12B76A", 600: "#039855", 700: "#027A48",
          800: "#05603A", 900: "#054F31", DEFAULT: "#039855",
        },
        warning: {
          50: "#FFFAEB", 100: "#FEF0C7", 200: "#FEDF89", 300: "#FEC84B",
          400: "#FDB022", 500: "#F79009", 600: "#DC6803", 700: "#B54708",
          800: "#93370D", 900: "#7A2E0E", DEFAULT: "#DC6803",
        },
        error: {
          50: "#FEF3F2", 100: "#FEE4E2", 200: "#FECDCA", 300: "#FDA29B",
          400: "#F97066", 500: "#F04438", 600: "#D92D20", 700: "#B42318",
          800: "#912018", 900: "#7A271A", DEFAULT: "#D92D20",
        },
        neutral: {
          0: "#FFFFFF", 50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0",
          300: "#CBD5E1", 400: "#94A3B8", 500: "#64748B", 600: "#475569",
          700: "#334155", 800: "#1E293B", 900: "#0F172A", 950: "#020617",
        },
        whatsapp: { DEFAULT: "#25D366", hover: "#1EBE5D" },
        // P1 semantic roles (CSS vars)
        background: "var(--background)",
        surface: { DEFAULT: "var(--surface)", subtle: "var(--surface-subtle)", raised: "var(--surface-raised)" },
        border: { DEFAULT: "var(--border)", strong: "var(--border-strong)" },
        text: {
          primary: "var(--text-primary)", secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)", "on-brand": "var(--text-on-brand)", disabled: "var(--text-disabled)",
        },
        brand: {
          DEFAULT: "var(--brand)", hover: "var(--brand-hover)",
          active: "var(--brand-active)", subtle: "var(--brand-subtle)",
        },

        // ── P2 tokens (green admin) ────────────────────────────
        ink:            "#171A21",
        "ink-soft":     "#667085",
        "ink-faint":    "#94A0AF",
        accent:         "#16A34A",
        "accent-deep":  "#0E7C39",
        "accent-soft":  "#E7F7ED",
        "accent-border":"#BFE8CC",
        gold:           "#F59E0B",
        info:           "#2563EB",
        "info-soft":    "#EAF1FF",
        warn:           "#DC2626",
        bg:             "#F6F8F7",
        card:           "#FFFFFF",
        "card-2":       "#101827",
        line:           "#E4E7EB",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "ui-monospace", "Menlo", "Consolas", "monospace"],
      },
      fontSize: {
        "display-xl": ["4rem",    { lineHeight: "4.5rem",  letterSpacing: "-0.022em", fontWeight: "700" }],
        "display-l":  ["3.5rem",  { lineHeight: "4rem",    letterSpacing: "-0.022em", fontWeight: "700" }],
        "display-m":  ["2.75rem", { lineHeight: "3.25rem", letterSpacing: "-0.02em",  fontWeight: "700" }],
        "h1": ["2.25rem", { lineHeight: "2.75rem", letterSpacing: "-0.02em",  fontWeight: "700" }],
        "h2": ["1.875rem",{ lineHeight: "2.375rem",letterSpacing: "-0.015em", fontWeight: "700" }],
        "h3": ["1.5rem",  { lineHeight: "2rem",    letterSpacing: "-0.01em",  fontWeight: "600" }],
        "h4": ["1.25rem", { lineHeight: "1.75rem", letterSpacing: "-0.01em",  fontWeight: "600" }],
        "body-lg": ["1.125rem",{ lineHeight: "1.75rem", fontWeight: "400" }],
        "body-md": ["1rem",    { lineHeight: "1.5rem",  fontWeight: "400" }],
        "body-sm": ["0.875rem",{ lineHeight: "1.25rem", fontWeight: "400" }],
        "caption":  ["0.75rem", { lineHeight: "1rem",    letterSpacing: "0.01em", fontWeight: "500" }],
        "label":    ["0.875rem",{ lineHeight: "1.25rem", letterSpacing: "0.005em",fontWeight: "600" }],
        "overline": ["0.75rem", { lineHeight: "1rem",    letterSpacing: "0.06em", fontWeight: "600" }],
      },
      spacing: {
        "0.5": "2px", "1": "4px", "2": "8px", "3": "12px", "4": "16px",
        "5": "20px",  "6": "24px","8": "32px","10": "40px","12": "48px",
        "16": "64px", "20": "80px","24": "96px","30": "120px",
      },
      borderRadius: {
        xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", "2xl": "32px", full: "9999px",
        DEFAULT: "16px", card: "16px",   // P2 rounded-card
      },
      boxShadow: {
        xs: "0 1px 2px rgba(16,24,40,0.05)",
        sm: "0 1px 3px rgba(16,24,40,0.10), 0 1px 2px rgba(16,24,40,0.06)",
        md: "0 4px 8px -2px rgba(16,24,40,0.10), 0 2px 4px -2px rgba(16,24,40,0.06)",
        lg: "0 12px 16px -4px rgba(16,24,40,0.08), 0 4px 6px -2px rgba(16,24,40,0.03)",
        focus: "0 0 0 4px rgba(26,86,219,0.40)",
        "focus-error": "0 0 0 4px rgba(217,45,32,0.35)",
      },
      maxWidth: { content: "1200px" },
      zIndex: {
        base: "0", raised: "10", sticky: "20", header: "30",
        dropdown: "40", overlay: "100", modal: "110", toast: "200",
      },
      keyframes: {
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // ── CSS replacements for framer-motion (no JS animation runtime) ──
        "m-fade":      { from: { opacity: "0" }, to: { opacity: "1" } },
        "m-fade-up":   { from: { opacity: "0", transform: "translateY(14px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "m-fade-down": { from: { opacity: "0", transform: "translateY(-8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "m-scale-in":  { from: { opacity: "0", transform: "scale(0.94)" },     to: { opacity: "1", transform: "scale(1)" } },
        "m-pop":       { "0%": { transform: "scale(0)" }, "60%": { transform: "scale(1.08)" }, "100%": { transform: "scale(1)" } },
        "m-slide-right": { from: { opacity: "0", transform: "translateX(16px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "m-sheet-up":  { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "m-zoom-in":   { from: { opacity: "0", transform: "translateY(28px) scale(0.98)" }, to: { opacity: "1", transform: "translateY(0) scale(1)" } },
        "m-float":     { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
        "m-toast-out": { from: { opacity: "1", transform: "translateY(0)" }, to: { opacity: "0", transform: "translateY(8px) scale(0.97)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up":   { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
      },
      animation: {
        "fade-in-up":     "fade-in-up 300ms cubic-bezier(0.16,1,0.3,1)",
        "accordion-down": "accordion-down 200ms cubic-bezier(0.4,0,0.2,1)",
        "accordion-up":   "accordion-up 200ms cubic-bezier(0.4,0,0.2,1)",
        shimmer:          "shimmer 1.5s infinite",
        fadeUp:           "fadeUp 0.25s ease",
        // ── framer-motion replacements ──
        // NOTE: fill-mode is `backwards` (not `both`): the element shows the start
        // frame during any stagger delay, but reverts to its NATURAL styles once
        // done — so a held end-frame transform never overrides `:hover`/`active`
        // transform utilities (e.g. card hover-lift) or base transforms (e.g. a
        // resting `-rotate-6`). End state == natural state, so there is no jump.
        "m-fade":        "m-fade 0.3s ease backwards",
        "m-fade-up":     "m-fade-up 0.45s cubic-bezier(0.16,1,0.3,1) backwards",
        "m-fade-down":   "m-fade-down 0.3s cubic-bezier(0.16,1,0.3,1) backwards",
        "m-scale-in":    "m-scale-in 0.35s cubic-bezier(0.16,1,0.3,1) backwards",
        "m-pop":         "m-pop 0.32s cubic-bezier(0.34,1.56,0.64,1) backwards",
        "m-slide-right": "m-slide-right 0.25s cubic-bezier(0.16,1,0.3,1) backwards",
        "m-sheet-up":    "m-sheet-up 0.3s cubic-bezier(0.16,1,0.3,1) backwards",
        "m-zoom-in":     "m-zoom-in 0.32s cubic-bezier(0.16,1,0.3,1) backwards",
        "m-float":       "m-float 4s ease-in-out infinite",
        "m-toast-out":   "m-toast-out 0.28s ease forwards",
      },
    },
  },
  plugins: [],
};

export default config;
