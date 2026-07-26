# SEO.md — Search Engine Optimization

Everything that is implemented, where it lives, how to verify it, and what still needs to be done.

---

## What is and isn't indexed

| Page / Route | Indexed? | Why |
|---|---|---|
| `/` (homepage) | ✅ Yes | Primary landing page |
| `/#how` | ✅ Yes | In sitemap |
| `/#faq` | ✅ Yes | In sitemap |
| `/sell/iphone` | ✅ Yes | iPhone category page |
| `/sell/macbook` | ✅ Yes | MacBook category page |
| `/sell/iphone/[slug]` | ✅ Yes | Dynamic iPhone model landing page |
| `/sell/macbook/[slug]` | ✅ Yes | Dynamic MacBook model landing page |
| `/sell/storage` | ❌ noindex | Stateful wizard step (blocked in robots.txt) |
| `/sell/condition` | ❌ noindex | Stateful wizard step |
| `/sell/quote` | ❌ noindex | Personalised output |
| `/sell/photos` | ❌ noindex | Upload flow |
| `/sell/checkout` | ❌ noindex | Personal details |
| `/sell/confirm` | ❌ noindex | Post-submission |
| `/sell/manual` | ❌ noindex | Android manual quote flow (blocked in robots.txt) |
| `/cart` | ❌ noindex | Session state |
| `/track` | ❌ noindex | Private order data |
| `/account` | ❌ noindex | Private user data |
| `/admin/*` | ❌ robots.txt | Internal tooling |
| `/api/*` | ❌ robots.txt | API routes |

---

## 1. Global metadata — `app/layout.tsx`

```ts
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL),   // makes relative OG image URLs absolute
  title: {
    default: "Mobronix — Sell your used iPhone or MacBook in Mumbai, get paid today",
    template: "%s | Mobronix",   // child pages just set title: "Track Your Order"
  },
  description: "Get an instant price for your used iPhone or MacBook, free doorstep pickup...",
  keywords: ["sell used iPhone Mumbai", "iPhone buyback Mumbai", "sell used MacBook Mumbai", ...],
  openGraph: { type, locale, url, siteName, title, description, images },
  twitter:   { card: "summary_large_image", ... },
  alternates: { canonical: APP_URL },
  robots: { index: true, follow: true },
}
```

**To change:** Edit `app/layout.tsx`. The title template means child pages only need to set `title: "Page Name"` and get `"Page Name | Mobronix"` automatically.

**OG image:** `/public/og-default.png` (1200×630). All pages share this until per-page dynamic OG images are added (see section 6).

---

## 2. Structured data (JSON-LD) — `app/page.tsx`

Two JSON-LD blocks are injected via `<script type="application/ld+json">` directly in the homepage JSX (homepage is a server component that renders `HomePageClient` which is client-side, but the LD-JSON is injected during SSR):

### Organization
```json
{
  "@type": "Organization",
  "name": "Mobronix",
  "url": "https://mobronix.in",
  "logo": "https://mobronix.in/icon.png",
  "areaServed": ["Mumbai", "Navi Mumbai", "Thane", "Sangli"],
  "address": { "@type": "PostalAddress", "addressLocality": "Mumbai", ... }
}
```

### FAQPage
Mirrors the 5 FAQs visible on the homepage (`FAQS` array in `app/page.tsx`). Every question and answer automatically appears in the JSON-LD — keep them in sync.

**To verify:** Paste the homepage URL into [Google Rich Results Test](https://search.google.com/test/rich-results). You should see `Organization` and `FAQPage` detected.

**To add more schemas** (e.g. `LocalBusiness`, `Service`): add another `const xyzJsonLd = { ... }` in `app/page.tsx` and inject another `<script>` tag alongside the existing two.

---

## 3. Page-level metadata

### Homepage — `app/page.tsx`
Homepage metadata sets title and description focusing on both iPhones and MacBooks. The page's primary `<h1>` elements carry keyword intent: "Honest Deals. Trusted Buyback."

### Sell flow pages — all `"use client"` with noindex
```ts
// At top of each sell flow page file
export const metadata = {
  robots: { index: false, follow: false },
}
```
Applied to: `/sell/storage`, `/sell/condition`, `/sell/quote`, `/sell/photos`, `/sell/checkout`, `/sell/confirm`.

### Track page — `app/track/page.tsx`
```ts
export const metadata = {
  title: "Track Your Order",  // → "Track Your Order | Mobronix"
  robots: { index: false, follow: false },
}
```

### Account page — `app/account/page.tsx`
```ts
export const metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
}
```

### Admin pages — `app/admin/layout.tsx`
Protected by middleware + not in sitemap. Robots.txt disallows `/admin`.

---

## 4. robots.txt — `app/robots.ts`

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /account
Disallow: /sell/storage
Disallow: /sell/condition
Disallow: /sell/quote
Disallow: /sell/photos
Disallow: /sell/checkout
Disallow: /sell/confirm
Disallow: /sell/manual
Disallow: /track
Disallow: /cart
Disallow: /api/
Sitemap: https://mobronix.in/sitemap.xml
```

**To verify:** Visit `https://yourdomain.com/robots.txt` after deploy.

---

## 5. Sitemap — `app/sitemap.ts`

Dynamically lists static category routes, legal pages, and all individual active iPhone and MacBook model landing pages:

| URL | Priority | Change frequency |
|-----|----------|-----------------|
| `/` | 1.0 | daily |
| `/#how` | 0.6 | monthly |
| `/#faq` | 0.5 | monthly |
| `/sell/iphone` | 0.9 | weekly |
| `/sell/macbook` | 0.9 | weekly |
| `/sell/iphone/[slug]` | 0.8 | weekly |
| `/sell/macbook/[slug]` | 0.8 | weekly |
| `/legal/*` | 0.3 | yearly |

**To verify:** Visit `https://yourdomain.com/sitemap.xml` after deploy. Submit to Google Search Console.

---

## 6. What's missing — priority TODOs

### 🔴 High priority

**Per-model OG images** — All pages currently share `/og-default.png`. Per-model dynamic images via `next/og` would significantly improve click-through from social/WhatsApp shares.

Create `app/sell/iphone/[slug]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og'
// ... fetch model and dynamically generate image card response
```

---

### 🟡 Medium priority

**`lang` attribute** — `app/layout.tsx` sets `<html lang="en">`. If adding Hindi content, set `lang="en-IN"` or add `hreflang` alternates.

**Canonical tags on homepage** — Currently set to `APP_URL` via `alternates.canonical`. Make sure `NEXT_PUBLIC_APP_URL` is set correctly in production (no trailing slash, correct protocol).

**Image alt text** — The DeviceVisual component renders SVG shapes with no alt. When real product photos are added, ensure `<Image alt="iPhone 15 Pro — front view" />` descriptive alt text.

**Page speed / Core Web Vitals** — Framer Motion adds runtime JS. Check LCP (hero image), CLS (font swap), INP (button interactions) in PageSpeed Insights after deploy.

---

### 🟢 Nice to have

**Google Search Console** — After deploy, add property, submit sitemap, monitor for crawl errors.

**Google Business Profile** — For local SEO in Mumbai/Navi Mumbai/Thane/Sangli — create or claim a profile and link to the site.

**Schema for LocalBusiness** — Add `LocalBusiness` schema alongside `Organization` on the homepage for better local search visibility.

**Review schema** — The `REVIEWS` array on the homepage is rendered as visible text. Adding it as `AggregateRating` schema could trigger star ratings in search results.

```ts
const aggregateRating = {
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "itemReviewed": { "@type": "Organization", "name": "Mobronix" },
  "ratingValue": "4.8",
  "reviewCount": "12400",
  "bestRating": "5",
}
```

---

## 7. Verification checklist

After deploying to production, check each of these:

```
□ https://yourdomain.com/robots.txt
  → /admin, /account, /sell/storage, /sell/manual, /api/ are disallowed
  → sitemap URL is listed

□ https://yourdomain.com/sitemap.xml
  → lists /, /#how, /#faq, /sell/iphone, /sell/macbook, and all per-model landing pages
  → submit URL to Google Search Console → Sitemaps

□ Google Rich Results Test — paste homepage URL
  → Organization detected
  → FAQPage detected (5 questions)

□ View source on /track and /account
  → <meta name="robots" content="noindex, nofollow"> present

□ View source on /sell/condition (or any sell step)
  → <meta name="robots" content="noindex, nofollow"> present

□ View source on homepage
  → <meta name="description"> present
  → <meta property="og:image"> present (1200×630)
  → <meta name="twitter:card" content="summary_large_image">
  → two <script type="application/ld+json"> blocks

□ PageSpeed Insights — paste homepage URL
  → LCP < 2.5s
  → CLS < 0.1
  → INP < 200ms
```

---

## 8. Files to edit for SEO changes

| Change | File |
|--------|------|
| Site-wide title, description, OG image | `app/layout.tsx` |
| Homepage keywords | `app/layout.tsx` → `keywords` array |
| JSON-LD schemas (Organization, FAQPage) | `app/page.tsx` → `orgJsonLd`, `faqJsonLd` |
| FAQ content (synced to JSON-LD automatically) | `app/page.tsx` → `FAQS` array |
| Which pages are disallowed from crawling | `app/robots.ts` |
| Which pages are in the sitemap | `app/sitemap.ts` |
| OG image | `public/og-default.png` (replace with 1200×630 image) |
| App URL (affects all absolute URLs in OG/sitemap) | `.env.local` → `NEXT_PUBLIC_APP_URL` |
