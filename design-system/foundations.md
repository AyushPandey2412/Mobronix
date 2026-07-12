# Foundations

Primitive tokens. Everything else composes from here. Light-first; values mirror
[`tokens/design-tokens.json`](../tokens/design-tokens.json).

---

## 1. Color

### Why this palette
**Trust Blue** carries fintech authority (Razorpay/Stripe). A cool **Slate** neutral keeps surfaces
premium and light (Apple/Linear). **Green** is reserved almost exclusively for *money + success* so
"₹ paid instantly" reads as a reward. Indigo is a sparing accent for gradients only.

### Primary — Trust Blue
| Step | Hex | Use |
|---|---|---|
| 50 | `#EEF4FF` | Selected radio card bg, subtle brand tint |
| 100 | `#D9E6FF` | Hover tint, badge bg |
| 200 | `#BCD3FF` | Borders on tinted surfaces |
| 300 | `#8EB6FF` | Disabled brand, decorative |
| 400 | `#5A8FFF` | Gradient mid, illustration |
| 500 | `#2F6BF6` | Links, focus accents |
| **600** | **`#1A56DB`** | **Primary CTA, brand default** |
| 700 | `#1546B0` | CTA hover |
| 800 | `#163C8C` | CTA active/pressed |
| 900 | `#17356F` | Brand text on light |
| 950 | `#0F2147` | Deep gradient stop |

### Secondary — Indigo (`50→900`, default `#5B45F0`)
Gradients & premium emphasis only. Pair with primary in `bg-brand-gradient` (135°, primary-600 → secondary-600). Never as a second CTA color.

### Success — Green (`50→900`, default `#039855`)
Instant-payment confirmed, "Completed" status, positive quote deltas, trust ticks.

### Warning — Amber (`50→900`, default `#DC6803`)
"Pending inspection / Pickup scheduled" chips, non-blocking notices.

### Error — Red (`50→900`, default `#D92D20`)
Validation errors, "Rejected" status, destructive confirms.

### Neutral — Slate (`0→950`)
`0` surface · `50` app canvas · `100` subtle fill · `200` border · `300` strong border ·
`400` disabled text · `500` tertiary text · `600` secondary text · `700–900` primary text & headings.

### Brand-fixed
WhatsApp `#25D366` (hover `#1EBE5D`) · Apple ink `#1D1D1F`.

### Semantic roles (use these in components)
| Token | Maps to | Contrast on surface |
|---|---|---|
| `surface` | neutral-0 | — |
| `background` | neutral-50 | — |
| `border` / `border-strong` | neutral-200 / 300 | — |
| `text-primary` | neutral-900 | 16.1:1 ✅ |
| `text-secondary` | neutral-600 | 7.2:1 ✅ |
| `text-tertiary` | neutral-500 | 4.6:1 ✅ (AA) |
| `brand` / `hover` / `active` | primary-600/700/800 | white text 5.3:1 ✅ |

> **Rule:** functional color always pairs with an icon or label (`color-not-only`). Green tick + "Paid", red ⚠ + message.

### Usage map
- **CTA buttons** → `brand` fill / `text-on-brand`.
- **Status chips** → `{intent}-50` bg, `{intent}-700` text, `{intent}-200` border.
- **Cards** → `surface` bg, `border`, `shadow-xs/sm`.
- **Forms** → `surface` bg, `border-strong`, focus `brand` + `shadow-focus`; error `error-500` border + `shadow-focus-error`.
- **Admin** → `background` canvas, `surface` rows, `neutral-100` zebra/header.

---

## 2. Typography — Inter

Load Inter via `next/font/google` (`display: "swap"`, weights 400/500/600/700, `--font-sans`).
Headings use **negative tracking** for the premium Apple/Linear feel; body stays at 0.

| Role | Desktop (px) | Mobile (px) | Weight | Tracking | Use |
|---|---|---|---|---|---|
| Display XL | 64 / 72 | 40 / 46 | 700 | −0.022em | Hero headline (desktop only) |
| Display L | 56 / 64 | 36 / 44 | 700 | −0.022em | Marketing section opener |
| Display M | 44 / 52 | 32 / 40 | 700 | −0.02em | Sub-hero, big stat |
| Heading 1 | 36 / 44 | 28 / 36 | 700 | −0.02em | Page title |
| Heading 2 | 30 / 38 | 24 / 32 | 700 | −0.015em | Section title |
| Heading 3 | 24 / 32 | 20 / 28 | 600 | −0.01em | Card title, step title |
| Heading 4 | 20 / 28 | 18 / 26 | 600 | −0.01em | Sub-card, list header |
| Body Large | 18 / 28 | 17 / 26 | 400 | 0 | Lead paragraph, hero sub |
| **Body Medium** | **16 / 24** | **16 / 24** | 400 | 0 | **Base body (16px floor)** |
| Body Small | 14 / 20 | 14 / 20 | 400 | 0 | Helper text, meta |
| Caption | 12 / 16 | 12 / 16 | 500 | +0.01em | Timestamps, fine print |
| Label | 14 / 20 | 14 / 20 | 600 | +0.005em | Form labels, chips |
| Overline | 12 / 16 | 12 / 16 | 600 | +0.06em | UPPERCASE eyebrow |

**Rules:** body ≥ 16px on mobile (avoids iOS auto-zoom) · line-length 60–75 desktop / 35–60 mobile ·
weight is hierarchy (700 head / 600 label / 400 body) · **prices, IMEI, order IDs, timers use `font-mono` + tabular-nums** (no layout shift).

Tailwind: `text-display-xl`, `text-h2`, `text-body-md`… (responsive sizes via `md:` overrides — desktop values are the defaults; apply mobile values at base and bump up, e.g. `text-h1` already encodes desktop, use `text-[1.75rem] md:text-h1` for the responsive pair, or define a plugin).

---

## 3. Spacing — 8pt grid

4pt sub-steps for fine control; everything else is a multiple of 8.

| Token | px | Typical use |
|---|---|---|
| `space-0.5` | 2 | Hairline nudge |
| `space-1` | 4 | Icon ↔ label |
| `space-2` | 8 | Min touch gap, tight stack |
| `space-3` | 12 | Compact padding |
| `space-4` | 16 | **Default gutter / mobile card padding** |
| `space-5` | 20 | — |
| `space-6` | 24 | Desktop card padding, grid gutter |
| `space-8` | 32 | Sub-section gap |
| `space-10` | 40 | — |
| `space-12` | 48 | Section padding (mobile) |
| `space-16` | 64 | Section padding (tablet) |
| `space-20` | 80 | Section padding (desktop) |
| `space-24` | 96 | Hero rhythm |
| `space-30` | 120 | Max section separation |

**Vertical rhythm tiers:** within card 16/24 · between cards 24 · between sub-sections 32/48 · between page sections 48/64/80.

---

## 4. Border radius

| Token | px | Use |
|---|---|---|
| `radius-xs` | 4 | Chips, tags |
| `radius-sm` | 8 | Inputs, secondary buttons |
| `radius-md` | 12 | Primary buttons, badges |
| `radius-lg` | 16 | Cards, radio cards, dropdowns |
| `radius-xl` | 24 | Hero panels, modals, feature cards |
| `radius-2xl` | 32 | Large promo surfaces |
| `radius-full` | 9999 | Pills, avatars, toggles |

Modern-SaaS feel = generous but consistent. Nested radius: child = parent − padding (e.g. 16 card, 16 padding → 8 inner).

---

## 5. Shadows — very subtle, layered

Ink-tinted `rgba(16,24,40,…)`, never pure black. Two layers for soft realism (Stripe/Linear).

| Token | Value | Use |
|---|---|---|
| `shadow-xs` | `0 1px 2px /05` | Resting cards, inputs |
| `shadow-sm` | `0 1px 3px /10, 0 1px 2px /06` | Cards on hover, chips |
| `shadow-md` | `0 4px 8px -2px /10, 0 2px 4px -2px /06` | Dropdowns, popovers, sticky bars |
| `shadow-lg` | `0 12px 16px -4px /08, 0 4px 6px -2px /03` | Modals, floating quote card |
| `shadow-focus` | `0 0 0 4px rgba(26,86,219,.40)` | Focus ring |
| `shadow-focus-error` | `0 0 0 4px rgba(217,45,32,.35)` | Error focus ring |

> Avoid heavy/dark shadows — they read cheap. Prefer borders + `xs`/`sm` for most surfaces. Elevation is consistent: card < dropdown < modal.

---

## 6. Iconography — Lucide React

One family, **stroke 1.5** (use 2 at ≤16px), outline style throughout. Never emoji as icons.

| Token | px | Use |
|---|---|---|
| `icon-xs` | 16 | Inline with body-sm, dense chips |
| `icon-sm` | 20 | **Default inside buttons & inputs** |
| `icon-md` | 24 | Standalone, nav, list items |
| `icon-lg` | 32 | Feature cards, empty states |
| `icon-xl` | 40 | Hero/marketing accents |

**Core set & meaning:** `Smartphone`/`Phone` device · `BatteryFull` battery health · `ShieldCheck` trust/secure ·
`Wallet`/`IndianRupee` payment · `CheckCircle2` confirmed · `Truck` pickup · `MapPin` location ·
`Star` reviews · `Camera` photo upload · `Clock` time/ETA · `Search` model search · `Package` order/track.

Rules: align to text baseline, consistent padding, ≥44px hit area (use padding/`hitSlop`), contrast ≥3:1. Icon color inherits `currentColor` — tint via text color token.

---

## 7. Grid & responsive

Never disable zoom. `<meta name="viewport" content="width=device-width, initial-scale=1">`.

| Breakpoint | Min width | Columns | Gutter | Container padding |
|---|---|---|---|---|
| Mobile | 390 (base) | 4 | 16 | 16 |
| `sm` | 640 | 4 | 16 | 16 |
| `md` Tablet | 768 | 8 | 24 | 24 |
| `lg` Desktop | 1024 | 12 | 24 | 32 |
| `xl` | 1280 | 12 | 24 | 32 |
| `2xl` Frame | 1440 | 12 | 24 | 32 (content max **1200**) |

Content max-width **1200px** centered within a 1440 frame. Long-form text capped ~680px for readability.
Use `.container-app` (in `globals.css`) or Tailwind `container`.

---

## 8. Motion

Restraint over spectacle — animate 1–2 elements per view. Framer Motion friendly.

| Duration | Token | Use |
|---|---|---|
| 100ms | `instant` | Press feedback, color/opacity |
| 200ms | `fast` | Hover, focus, small reveal |
| 300ms | `base` | Accordion, step change, modal enter |
| 180ms | `exit` | Exits (~60% of enter — feels snappy) |

**Easing:** enter `cubic-bezier(0.16,1,0.3,1)` (ease-out) · exit `cubic-bezier(0.4,0,1,1)` (ease-in) · standard `cubic-bezier(0.4,0,0.2,1)`.
**Spring (Framer):** soft `{stiffness:260,damping:24}` (cards/sheets) · snappy `{stiffness:400,damping:30}` (buttons/toggles).

**Micro-interactions**
- Button hover → bg shift 100ms + `shadow-sm`; press → `scale(0.97)`.
- Card hover → `translateY(-2px)` + `shadow-sm`, 200ms (transform/opacity only — no layout shift).
- Form success → green check fades+scales in 300ms, `aria-live` announces.
- Step progress → bar width + check fill, 300ms; respect reduced-motion.

**Rules:** animate `transform`/`opacity` only · never block input · interruptible · always honor `prefers-reduced-motion` (global reset already in `globals.css`).
