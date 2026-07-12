# SEO.md — Search Engine Optimization

Everything that is implemented, where it lives, how to verify it, and what still needs to be done.

---

## What is and isn't indexed

| Page / Route | Indexed? | Why |
|---|---|---|
| `/` (homepage) | ✅ Yes | Primary landing page |
| `/#how` | ✅ Yes | In sitemap |
| `/#faq` | ✅ Yes | In sitemap |
| `/sell/storage` | ✅ Yes | Model selection — indexable entry point |
| `/sell/condition` | ❌ noindex | Stateful wizard step |
| `/sell/quote` | ❌ noindex | Personalised output |
| `/sell/photos` | ❌ noindex | Upload flow |
| `/sell/checkout` | ❌ noindex | Personal details |
| `/sell/confirm` | ❌ noindex | Post-submission |
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
    default: "SellMyiPhone — Sell your used iPhone in Mumbai, get paid today",
    template: "%s | SellMyiPhone",   // child pages just set title: "Track Your Order"
  },
  description: "...",
  keywords: ["sell used iPhone Mumbai", "iPhone buyback Mumbai", ...],
  openGraph: { type, locale, url, siteName, title, description, images },
  twitter:   { card: "summary_large_image", ... },
  alternates: { canonical: APP_URL },
  robots: { index: true, follow: true },
}
```

**To change:** Edit `app/layout.tsx`. The title template means child pages only need to set `title: "Page Name"` and get `"Page Name | SellMyiPhone"` automatically.

**OG image:** `/public/og-default.png` (1200×630). All pages share this until per-page dynamic OG images are added (see section 6).

---

## 2. Structured data (JSON-LD) — `app/page.tsx`

Two JSON-LD blocks are injected via `<script type="application/ld+json">` directly in the homepage JSX (homepage is a client component so `export const metadata` cannot include JSON-LD):

### Organization
```json
{
  "@type": "Organization",
  "name": "SellMyiPhone",
  "url": "https://sellmyiphone.in",
  "logo": "https://sellmyiphone.in/icon.png",
  "areaServed": ["Mumbai", "Navi Mumbai", "Thane"],
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
Homepage is `"use client"` so metadata is set in `app/layout.tsx` (default). The page's `<h1>` is: `"Sell your used iPhone. Get paid today."` — carries the primary keyword intent.

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
  title: "Track Your Order",  // → "Track Your Order | SellMyiPhone"
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
Disallow: /account
Disallow: /sell/storage
Disallow: /sell/condition
Disallow: /sell/quote
Disallow: /sell/photos
Disallow: /sell/checkout
Disallow: /sell/confirm
Disallow: /cart
Disallow: /api/
Sitemap: https://sellmyiphone.in/sitemap.xml
```

**To verify:** Visit `https://yourdomain.com/robots.txt` after deploy.

---

## 5. Sitemap — `app/sitemap.ts`

Currently lists 4 static pages:

| URL | Priority | Change frequency |
|-----|----------|-----------------|
| `/` | 1.0 | daily |
| `/#how` | 0.6 | monthly |
| `/#faq` | 0.5 | monthly |
| `/sell/storage` | 0.9 | weekly |

**To verify:** Visit `https://yourdomain.com/sitemap.xml` after deploy. Submit to Google Search Console.

---

## 6. What's missing — priority TODOs

### 🔴 High priority

**Model landing pages** — The biggest SEO gap. There are no indexable per-model pages (e.g. `/sell/iphone-16-pro`). The old P2 project had `app/sell/iphone/[slug]/page.tsx` with server-rendered model pages, but they were removed during the merge because they called Supabase at build time.

To add them back:
1. Create `app/sell/iphone/[slug]/page.tsx`
2. Use `generateStaticParams()` to pre-render one page per model from the `MODELS` array in `lib/data.ts`
3. Use `generateMetadata()` to produce unique titles like `"Sell iPhone 16 Pro — Get Upto ₹90,000 | SellMyiPhone"`
4. Add `Product` + `BreadcrumbList` JSON-LD
5. Add these URLs to `sitemap.ts`

Example structure:
```tsx
// app/sell/iphone/[slug]/page.tsx
import { MODELS } from '@/lib/data'

export function generateStaticParams() {
  return MODELS.map(m => ({ slug: m.id }))
}

export function generateMetadata({ params }) {
  const model = MODELS.find(m => m.id === params.slug)
  const maxPrice = Math.max(...Object.values(model.storages as Record<string, number>))
  return {
    title: `Sell ${model.name} — Get Upto ₹${maxPrice.toLocaleString('en-IN')}`,
    description: `Sell your ${model.name} in Mumbai. Get an instant price, free doorstep pickup, and same-day UPI payment.`,
    alternates: { canonical: `/sell/iphone/${params.slug}` },
  }
}
```

---

**Per-model OG images** — All pages currently share `/og-default.png`. Per-model dynamic images via `next/og` would significantly improve click-through from social/WhatsApp shares.

Create `app/sell/iphone/[slug]/opengraph-image.tsx`:
```tsx
import { ImageResponse } from 'next/og'
export default function Image({ params }) {
  const model = MODELS.find(m => m.id === params.slug)
  return new ImageResponse(<div>Sell {model.name} — Get Upto ₹{maxPrice}</div>)
}
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

**Google Business Profile** — For local SEO in Mumbai/Navi Mumbai/Thane — create or claim a profile and link to the site.

**Schema for LocalBusiness** — Add `LocalBusiness` schema alongside `Organization` on the homepage for better local search visibility.

**Review schema** — The `REVIEWS` array on the homepage is rendered as visible text but not as `AggregateRating` schema. Adding it could trigger star ratings in search results.

```ts
const aggregateRating = {
  "@context": "https://schema.org",
  "@type": "AggregateRating",
  "itemReviewed": { "@type": "Organization", "name": "SellMyiPhone" },
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
  → /admin, /account, /sell/*, /api/ are disallowed
  → sitemap URL is listed

□ https://yourdomain.com/sitemap.xml
  → lists /, /#how, /#faq, /sell/storage
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
