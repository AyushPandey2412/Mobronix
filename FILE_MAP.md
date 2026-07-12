# FILE_MAP.md — Every file in this project, what it does, and when to touch it

> **Legend**
> `[P1]` = came from SellmyIphone (Figma frontend, blue design system, Zustand)
> `[P2]` = came from practice (Supabase backend, admin panel)
> `[MERGED]` = created during merge to bridge both

---

## Index

- [Quick-reference table](#quick-reference-i-want-to-change) — 30 common "I want to change X" lookups
- [app/page.tsx — Homepage in detail](#appagetsx--homepage-in-detail-p1) — all sections, content arrays, hero, how-it-works, FAQs
- [Root config files](#root-config-files) — Next.js, Tailwind, TypeScript, middleware
- [app/ — Pages](#app--pages)
  - [Public pages](#public-pages)
  - [Sell flow pages](#sell-flow-pages--all-p1-all-noindex)
  - [Account pages](#account-pages--all-p1-all-noindex)
  - [Admin panel](#admin-panel--all-p2)
  - [API routes](#api-routes)
  - [Legal pages](#legal-pages)
- [components/ — UI components](#components--ui-components)
  - [shared/ — Layout chrome](#componentssharedd--layout-chrome-p1)
  - [marketing/ — Homepage](#componentsmarketing--homepage-p1)
  - [sell/ — Sell flow](#componentssell--sell-flow-p1)
  - [track/](#componentstrack-p1)
  - [ui/ — UI kit](#componentsui--ui-kit)
- [lib/ — Business logic](#lib--business-logic)
- [supabase/ — Database](#supabase--database)
- [tokens/ and design-system/](#tokens-and-design-system)
- [Documentation files](#documentation-files)

---

## Related documentation

| Document | What it covers |
|----------|---------------|
| `MIGRATIONS.md` | How to run database migrations, what each migration does, SQL snippets for common DB tasks |
| `BACKEND.md` | Supabase clients, auth flow, API routes, RLS, rate limiting, email, storage, env vars |
| `STATE.md` | Zustand store (all fields + actions), TanStack Query (keys, mutations, cache invalidation), data flow |
| `SETUP.md` | Install, env vars, first-run checklist |
| `SEO.md` | What is indexed, JSON-LD schemas, sitemap |

---

## Quick-reference: "I want to change…"

| What you want to change | File(s) to edit |
|-------------------------|-----------------|
| Hero headline / subheading / badge text | `app/page.tsx` → `<h1>`, `<motion.p>`, `<motion.span>` (first ~30 lines of `return`) |
| Hero CTA buttons ("Get my price", "WhatsApp us") | `app/page.tsx` → `<motion.div className="mt-7 flex flex-wrap gap-3">` |
| Hero stats (12,400+, 4.8/5, Same-day) | `app/page.tsx` → `const STATS = [...]` |
| Hero floating badges ("Paid in 24 min", "IMEI verified") | `app/page.tsx` → two `<motion.div className="absolute..."` inside the device visual column |
| Hero device illustration | `components/shared/DeviceVisual.tsx` — pure SVG |
| "How it works" steps (4 cards) | `app/page.tsx` → `const STEPS = [...]` |
| "Why us" items (4 icon cards) | `app/page.tsx` → `const WHY = [...]` |
| "Pro tips" items (4 numbered cards) | `app/page.tsx` → `const TIPS = [...]` |
| FAQ questions and answers | `app/page.tsx` → `const FAQS = [...]` — also updates JSON-LD automatically |
| Customer reviews | `lib/data.ts` → `export const REVIEWS: Review[]` |
| Bottom CTA section text | `app/page.tsx` → `<section className="container-app py-14">` at the bottom |
| Section headings (eyebrow, title, subtitle) | Edit the `<SectionHeading eyebrow="..." title="..." subtitle="..."/>` at each section |
| Condition questions (sell flow) | `lib/data.ts` → `export const QUESTIONS` (iPhone) or `export const MAC_QUESTIONS` (MacBook) |
| iPhone buyback prices | `lib/data.ts` → `export const MODELS` |
| MacBook buyback prices | `lib/data.ts` → `export const MACBOOK_MODELS` |
| Add a new iPhone model | `lib/data.ts` → add an entry to `MODELS` |
| Add a new MacBook model | `lib/data.ts` → add an entry to `MACBOOK_MODELS` |
| iPhone series filter pills | `lib/data.ts` → `export const SERIES` |
| MacBook series filter pills | `lib/data.ts` → `export const MAC_SERIES` |
| Pickup time slots | `lib/data.ts` → `export const SLOTS` |
| Tracking step labels | `lib/data.ts` → `export const TRACK_STEPS` |
| Site header nav links | `components/shared/SiteHeader.tsx` → `const NAV = [...]` |
| Footer content / contact | `components/shared/Footer.tsx` |
| Login page copy or perks | `app/login/page.tsx` → `const PERKS = [...]` and the form panel |
| Admin order WhatsApp templates | `app/admin/orders/[id]/OrderDetail.tsx` → `waMessages` array |
| Demo admin credentials | `lib/store.ts` → `login()` function (checks `id === "admin" && pwd === "admin123"`) |

---

## `app/page.tsx` — Homepage in detail `[P1]`

This is one file that controls the entire public-facing homepage. Everything is in arrays at the top — edit the arrays, not the JSX below.

### Sections and where they live

```
app/page.tsx
│
├── const STEPS = [...]           ← "How it works" — 4 step cards
├── const WHY   = [...]           ← "Why us" — 4 icon cards
├── const TIPS  = [...]           ← "Pro tips" — 4 numbered tip cards
├── const FAQS  = [...]           ← FAQ accordion + JSON-LD schema (synced)
├── const STATS = [...]           ← 3 hero stat numbers
│
├── <section bg-mesh>             ← HERO
│   ├── <motion.span>             ← Green dot badge "Hi there · Live in Mumbai..."
│   ├── <motion.h1>               ← Main headline
│   ├── <motion.p>                ← Subheading paragraph
│   ├── <motion.div mt-7>         ← CTA buttons
│   ├── <motion.div mt-9>         ← STATS grid (3 numbers)
│   └── device column             ← Floating phone + two tooltip badges
│
├── {resume && ...}               ← Resume-quote banner (auto, don't edit)
│
├── <section id="models">         ← Model selector (iPhone / MacBook tabs)
│
├── <section id="how">            ← HOW IT WORKS — renders STEPS
│
├── <section WHY>                 ← WHY US — renders WHY
│
├── <section TIPS>                ← PRO TIPS — renders TIPS
│
├── <section REVIEWS>             ← REVIEWS — from lib/data.ts REVIEWS
│
├── <section id="faq">            ← FAQ — renders FAQS via <Accordion>
│
└── <section CTA>                 ← Bottom CTA banner
```

### How to change "How it works"

The 4 steps are in `const STEPS` at the top of `app/page.tsx`. Each step has:
- `icon` — a Lucide icon component (import it at the top)
- `title` — bold card heading
- `text` — description paragraph

```ts
// app/page.tsx — find this near the top
const STEPS = [
  { icon: BadgeIndianRupee, title: "Check your price", text: "Select your model..." },
  { icon: PhoneCall, title: "We call to confirm",  text: "Our spokesperson..." },
  { icon: Truck,            title: "We come to you",   text: "An executive visits..." },
  { icon: PackageCheck,     title: "Get paid instantly", text: "Receive payment..." },
];
```

To change the number of steps, add or remove objects from the array. The JSX renders them in a grid automatically — up to 4 looks best (`lg:grid-cols-4`).

**Available Lucide icons already imported:** `BadgeIndianRupee`, `PhoneCall`, `Truck`, `PackageCheck`, `ShieldCheck`, `Wallet`, `ScanLine`, `MessageCircle`, `ArrowRight`, `Sparkles`, `ChevronRight`.

To use a different icon: add it to the import list at the top of the file:
```ts
import { Zap } from "lucide-react"; // example
```
Then use `icon: Zap` in the array.

### How to change "Why us"

Same pattern, same file:

```ts
const WHY = [
  { icon: BadgeIndianRupee, title: "Best price",      text: "Highest market value, guaranteed." },
  { icon: Truck,            title: "Free pickup",      text: "Doorstep pickup, no charges." },
  { icon: Wallet,           title: "Instant payment",  text: "UPI or cash, paid on the spot." },
  { icon: ScanLine,         title: "IMEI checked",     text: "Safe & verified transactions." },
];
```

Each renders as a centred card with a green icon circle at the top. You can add more — they'll wrap to a second row.

### How to change the hero section

The hero is at the start of the JSX `return`. Key parts:

**Badge (green dot, top):**
```tsx
<motion.span className="inline-flex items-center gap-2 rounded-full ...">
  <span className="relative flex h-2 w-2">...</span>
  Hi {user ? user.name.split(" ")[0] : "there"} · Live in Mumbai, Navi Mumbai & Thane
</motion.span>
```
Change the text after the dot.

**Headline:**
```tsx
<motion.h1 className="mt-5 text-[2.4rem] ...">
  Sell your used iPhone.{" "}
  <span className="text-brand">Get paid today.</span>
</motion.h1>
```
The `text-brand` span renders in blue. Anything outside it is black.

**Subheading:**
```tsx
<motion.p className="mt-4 max-w-md text-body-lg text-text-secondary">
  Free doorstep pickup, an instant price estimate...
</motion.p>
```

**Stats (3 numbers below the buttons):**
```ts
const STATS = [
  { value: "12,400+", label: "Devices purchased" },
  { value: "4.8 / 5", label: "Average rating" },
  { value: "Same-day", label: "Instant payout" },
];
```
Change `value` and `label`. Keep to 3 items for the 3-column grid to work cleanly.

**Floating tooltip badges (desktop only):**
These are the "Paid in 24 min" and "IMEI verified" badges that float over the phone image. Find them by searching `absolute -left-16` and `absolute -right-12`:
```tsx
<motion.div className="absolute -left-16 top-12 ...">
  <Wallet className="h-4 w-4" />
  <div className="text-caption font-bold">Paid in 24 min</div>
  <div className="text-[10px] text-text-tertiary">via UPI</div>
</motion.div>
```

### How to change FAQs

```ts
const FAQS = [
  { q: "How do you decide the price?", a: "We calculate..." },
  ...
];
```

FAQs feed both the `<Accordion>` on the page and the `faqJsonLd` JSON-LD schema — they stay in sync automatically. Do not edit the JSON-LD block directly.

---

## `components/shared/DeviceVisual.tsx` — Hero phone illustration `[P1]`

Pure SVG iPhone illustration. No image file needed.

**Props:**
- `tone` — `"graphite"` (dark, used on storage page) · `"blue"` (used in hero) · `"sand"` (unused)
- `floating` — `true` by default — adds a slow floating animation
- `className` — controls size (`h-72 w-40` etc.)

**To replace** with a real photo: swap `<DeviceVisual />` in the hero JSX with `<Image src="..." alt="..." />` from `next/image`.

---

## `components/shared/SectionHeading.tsx` — Reusable section heading `[P1]`

Used above every homepage section. Props:
- `eyebrow` — small uppercase text in brand blue above the title (e.g. `"How it works"`)
- `title` — main `<h2>` text
- `subtitle` — optional paragraph below
- `center` — centres all text

```tsx
// Usage example from the hero section:
<SectionHeading
  eyebrow="Get started"
  title="Choose your device"
  subtitle="Search or pick your iPhone or MacBook to get an instant price estimate."
/>
```

---

## `components/ui/Accordion.tsx` — FAQ accordion `[P1]`

Used on the homepage FAQ section. Props:
- `items` — array of `{ q: string; a: string }` — same shape as `FAQS` in `app/page.tsx`

First item is open by default (`useState<number | null>(0)`). Click a question to open/close — only one open at a time.

**To change the open/close animation speed:** find `transition={{ duration: 0.25 }}` and adjust the number.

---

## `components/ui/Card.tsx` — Content card `[P1]`

Used for "How it works" step cards and review cards.

Props:
- `padded` — adds `p-5` padding (default `true`)
- `interactive` — adds hover lift animation and stronger border on hover

---

## `components/sell/QuestionBody.tsx` — Condition question UI `[P1]`

Renders the question UI inside `/sell/condition`. Handles three question types:

**`single`** — renders a list of `<OptionCard>` buttons. Tap one to select.

**`multi`** — same as single but multiple can be selected. One option can be marked `exclusive` (selecting it clears all others). Edit `exclusive` in `lib/data.ts` per question.

**`matrix`** — renders a two-column grid of rows, each with Yes / No buttons. Used for the device functions check (WiFi, Bluetooth, Face ID etc.).

**To change the question UI style:** edit `OptionCard` in `components/ui/Selectable.tsx`. The selected state uses `border-brand bg-primary-50 text-primary-800` (blue).

**To add a new question type:** add a new `type` to `lib/types.ts` and add a new branch in `QuestionBody.tsx`.

---

## `components/ui/Selectable.tsx` — Option cards and filter pills `[P1]`

Two components:

**`<OptionCard>`** — large tappable option row used in condition questions.
- Selected state: blue border + blue background + check circle
- Unselected: neutral border, hover darkens border
- To change the selection colour: find `"border-brand bg-primary-50 text-primary-800"` and update

**`<Pill>`** — small filter chip used in ModelSelector series pills.
- Active: `bg-brand text-white`
- Inactive: `bg-surface border-border text-text-secondary`
- To change active colour: find `active ? "bg-brand text-white"` and update

---

## Root config files

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `package.json` | MERGED | All dependencies | Adding/removing npm packages |
| `tailwind.config.ts` | MERGED | **Unified design tokens** — blue system (`bg-surface`, `text-brand`, `border-border`) + green admin system (`text-ink`, `accent`, `bg-bg`) | Adding new colour tokens |
| `next.config.mjs` | P1 | Next.js config | Adding image domains, redirects |
| `postcss.config.mjs` | P1 | PostCSS with Tailwind + Autoprefixer | Rarely |
| `tsconfig.json` | P1 | TypeScript config, `@/` path alias | Adding new path aliases |
| `middleware.ts` | MERGED | Refreshes Supabase session cookie for `/admin/*`. No hard redirects — auth is client-side in `AdminAuthGate` | If adding server-side route protection |
| `.env.local` | P2 | All secrets | When changing Supabase project or adding email/OAuth |

---

## `app/` — Pages

### Public pages

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `app/layout.tsx` | P1 | Root layout — Inter + JetBrains Mono fonts, `metadataBase`, title template, OG/Twitter, keywords, `<AppChrome>` | Changing fonts, SEO metadata, global providers |
| `app/globals.css` | MERGED | CSS variables (blue tokens), `container-app`, `bg-mesh`, `bg-brand-gradient`, `.fade-in` | Adding global styles or CSS variables |
| `app/page.tsx` | P1 | **Full homepage** — all sections, all content arrays (`STEPS`, `WHY`, `TIPS`, `FAQS`, `STATS`), JSON-LD | Any homepage content change |
| `app/template.tsx` | P1 | Page transition wrapper (framer-motion fade) | Changing route transition |
| `app/login/page.tsx` | MERGED | Single unified login — Supabase email first (real admin), Zustand fallback (sellers + demo admin). Routes admin → `/admin`, seller → home/sell | Login copy, OAuth, credential changes |
| `app/robots.ts` | P2 | robots.txt — disallows all sell steps, admin, account, api | Changing crawl rules |
| `app/sitemap.ts` | MERGED | Static sitemap — home, `/#how`, `/#faq`, `/sell/storage` | Adding new indexable pages |

### Sell flow pages — all `[P1]`, all `noindex`

State flows: model select → storage → condition → quote → photos → checkout → confirm

| File | What it does | Change when |
|------|-------------|-------------|
| `app/sell/layout.tsx` | Wraps sell pages in `container-app` with padding | Changing sell flow container |
| `app/sell/storage/page.tsx` | Pick storage (iPhone flat) or chip + storage (MacBook nested). Shows animated price. Guards: `!model` → home | Adding chip selector options, changing price display layout |
| `app/sell/condition/page.tsx` | Animated question-by-question flow with progress bar. Uses `QUESTIONS` for iPhones, `MAC_QUESTIONS` for MacBooks. Each question renders via `<QuestionBody>` | Changing question flow UI or progress bar |
| `app/sell/quote/page.tsx` | Shows final quote with grade badge, deduction breakdown. Add-another-device option | Changing quote display |
| `app/sell/photos/page.tsx` | 5 photo slots. Button is always enabled — says "Skip photos & continue" if not all uploaded | Changing photo requirements |
| `app/sell/checkout/page.tsx` | Address, pincode, slot picker (Sheet), payment mode (Sheet). Guards: `!user` → login, `!model || !quote` → home | Adding checkout fields, changing slot/payment UI |
| `app/sell/confirm/page.tsx` | Success screen with animated check, executive name, OrderCard | Changing confirmation copy |

### Account pages — all `[P1]`, all `noindex`

| File | What it does | Change when |
|------|-------------|-------------|
| `app/account/layout.tsx` | Wraps account with `<AuthGate>` | Changing account layout |
| `app/account/page.tsx` | User profile — name, mobile, logout | Changing profile UI |
| `app/account/settings/page.tsx` | Notifications + language preferences (Zustand) | Adding settings |
| `app/account/referral/page.tsx` | Referral code display | Changing referral program |

### Track page — `[P1]`, `noindex`

`app/track/page.tsx` — wrapped in `<AuthGate>`. Search by enquiry ID or mobile. Shows `OrderCard` + `StatusTimeline`. Advance/cancel/rate actions. Demo result when search has no match.

### Admin panel — all `[P2]`

Auth handled by `AdminAuthGate` — checks Zustand demo admin OR Supabase real admin.

| File | What it does | Change when |
|------|-------------|-------------|
| `app/admin/layout.tsx` | Sidebar layout wrapping `AdminAuthGate` | Changing admin sidebar |
| `app/admin/AdminAuthGate.tsx` | Dual auth gate — Zustand demo admin or Supabase `profiles.role = 'admin'`. Redirects to `/login` if neither | Changing admin auth logic |
| `app/admin/AdminNav.tsx` | Sidebar nav (Dashboard, Orders, Products, Questions) + sign out. Horizontal mobile variant | Adding nav items |
| `app/admin/page.tsx` | Dashboard — tries Supabase; falls back to Zustand seed enquiries (demo mode) | Changing dashboard data source |
| `app/admin/Dashboard.tsx` | Stat cards, 7-day bar chart, filterable enquiry table, bulk status, bulk delete, CSV export | Changing dashboard UI |
| `app/admin/orders/[id]/page.tsx` | Fetches single enquiry + history from Supabase | Changing data fetch |
| `app/admin/orders/[id]/OrderDetail.tsx` | Order detail — customer info, devices, tracking step, status update, WhatsApp templates, activity history, delete | Adding fields or WhatsApp templates |
| `app/admin/products/page.tsx` | Fetches models from Supabase | Changing product data fetch |
| `app/admin/products/ProductsClient.tsx` | Products CRUD — iPhone and MacBook tabs, toggle active, reorder, add/edit via sheet | Changing product management UI |
| `app/admin/questions/page.tsx` | Fetches questions from Supabase | Changing question fetch |
| `app/admin/questions/QuestionsClient.tsx` | Questions CRUD — category tabs, reorder, add/edit/delete via sheet | Changing question management UI |

### API routes

| File | What it does | Change when |
|------|-------------|-------------|
| `app/api/enquiry/route.ts` | `POST /api/enquiry` — saves to Supabase, records history, sends emails. Guest mode (no login required) | Adding fields or email logic |
| `app/api/export/route.ts` | `GET /api/export` — admin-only CSV export | Changing export format |

---

## `components/` — UI components

### `components/shared/` — Layout chrome `[P1]`

| File | What it does | Change when |
|------|-------------|-------------|
| `AppChrome.tsx` | Decides which chrome per route — header + footer + bottom nav for public; nothing for `/login` and `/admin` | Adding route-specific chrome rules |
| `SiteHeader.tsx` | Sticky header — Logo, nav links (`const NAV`), WhatsApp button, Login/User button | Adding nav items or changing header layout |
| `BottomNav.tsx` | Mobile-only fixed bottom nav — Home, My Enquiry (with update badge), Account | Adding bottom nav items |
| `Footer.tsx` | Dark footer with logo, company links, contact | Changing footer content |
| `AuthGate.tsx` | Client-side route guard using Zustand — redirects to `/login` if no user | Do not change |
| `FlowHeader.tsx` | Back button + title on all sell flow pages | Changing sell flow header style |
| `StickyBar.tsx` | Fixed mobile CTA bar (label + value + button) at bottom of sell pages | Changing mobile CTA style |
| `CartBar.tsx` | Floating cart bar on homepage when cart has items | Changing cart bar appearance |
| `Logo.tsx` | SellMyiPhone wordmark with blue S icon | Changing logo |
| `DeviceVisual.tsx` | Stylised iPhone SVG — used on hero and storage page | Changing device illustration |
| `SectionHeading.tsx` | Reusable eyebrow + title + subtitle block | Changing heading style |

### `components/marketing/` — Homepage `[P1]`

| File | What it does | Change when |
|------|-------------|-------------|
| `ModelSelector.tsx` | iPhone/MacBook category tabs + search + series pills + model card grid. `switchCategory` resets all filters. iPhone tab filters `m.category !== "macbook"` from store, MacBook tab uses `MACBOOK_MODELS` directly | Changing model browse UX |
| `ModelCard.tsx` | Individual model card — `PhoneGlyph` for iPhones, `LaptopGlyph` for MacBooks. `getMaxPrice()` unpacks both flat (iPhone) and nested (MacBook) pricing | Changing card design |

### `components/sell/` — Sell flow `[P1]`

| File | What it does | Change when |
|------|-------------|-------------|
| `QuestionBody.tsx` | Renders condition question UI — `single` (radio list), `multi` (checkbox with exclusive), `matrix` (yes/no grid). Uses `<OptionCard>` for single/multi options | Adding new question types |
| `PhotoUploader.tsx` | Single photo slot card — tap to toggle uploaded state | Changing photo upload UI |

### `components/track/` `[P1]`

| File | What it does |
|------|-------------|
| `OrderCard.tsx` | Compact order summary — model, amount, step badge, exec name |
| `StatusTimeline.tsx` | Horizontal step timeline for tracking progress |

### `components/ui/` — UI kit

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `Button.tsx` | P1 | Motion button — variants: `primary`, `secondary`, `outline`, `ghost`, `whatsapp`, `danger` | Changing button style |
| `Input.tsx` | P1 | Text input, Textarea, Select — all with label, error, helper text | Changing input style |
| `Badge.tsx` | P1 | Coloured badge pill — intents: `neutral`, `brand`, `success`, `warning`, `error` | Changing badge |
| `Card.tsx` | P1 | Content card — `padded` + optional `interactive` hover lift | Changing card style |
| `Accordion.tsx` | P1 | FAQ accordion — one open at a time, animated expand/collapse | Changing FAQ UI |
| `Progress.tsx` | P1 | Labelled progress bar for condition question flow | Changing progress bar |
| `Stars.tsx` | P1 | `<Stars>` interactive + `<StarRow>` display | Changing stars |
| `Selectable.tsx` | P1 | `<Pill>` filter chip + `<OptionCard>` large option row (condition quiz) | Changing question option style |
| `Sheet.tsx` | P1 | Bottom slide-up sheet for slot/payment pickers in checkout | Changing sheet |
| `BottomSheet.tsx` | P2 | Admin bottom sheet for product/question editor | Changing admin editor sheet |
| `ConfirmDialog.tsx` | P2 | Admin confirmation dialog (delete, cancel) | Changing admin dialogs |
| `Modal.tsx` | P1 | Centre modal dialog | Changing modal |
| `Skeleton.tsx` | P1 | Loading skeleton placeholder | Changing loading states |
| `EmptyState.tsx` | P1 | Empty state with icon + message | Changing empty states |
| `Toggle.tsx` | P1 | On/off toggle switch | Changing toggles |
| `Stepper.tsx` | P1 | Timeline stepper | Changing stepper |
| `Toaster.tsx` | P1 | Toast notification renderer | Changing toasts |
| `StatusChip.tsx` | P2 | Admin order status chip | Changing status display |

---

## `lib/` — Business logic

### `lib/data.ts` — All static content `[P1]` — **the most important file to know**

Everything visible on the site that isn't hardcoded JSX lives here.

| Export | What it is | How to change |
|--------|-----------|---------------|
| `MODELS` | 35 iPhones (iPhone X → iPhone 17 Pro Max) with flat storage pricing `{"128GB": 40000}`. Each has `category: "iphone"` | Add/edit entries to change models or prices |
| `MACBOOK_MODELS` | 19 MacBooks across 4 series (Air, Pro 13", Pro 14", Pro 16") with nested chip pricing `{"M1": {"256GB": 42000}}` | Add/edit entries to change Mac models or prices |
| `SERIES` | iPhone series filter pill labels | Add a new series name here and matching models |
| `MAC_SERIES` | MacBook series filter pill labels | Same for Mac |
| `QUESTIONS` | 13 iPhone condition questions (power on, screen, body, functions matrix, cameras, battery, accessories) | Add/edit/reorder — question types: `single`, `multi`, `matrix` |
| `MAC_QUESTIONS` | 8 MacBook condition questions (power, age, display, keyboard, body, functions, battery cycles, accessories) | Same — affects MacBook sell flow only |
| `PHOTO_SLOTS` | 5 photo slot definitions (front, back, settings, left, right) | Add slots to require more photos |
| `TRACK_STEPS` | 5 tracking step labels | Change step names shown on `/track` |
| `SLOTS` | Pickup time options shown in checkout | Add or remove time slots |
| `EXECUTIVES` | Executive names randomly assigned at enquiry creation | Add real names |
| `REVIEWS` | 3 customer reviews shown on homepage | Add/edit/remove reviews |
| `SEED_ENQUIRIES` | 4 sample enquiries shown in demo admin dashboard | Add more seeds for testing |
| `getModel(id)` | Finds a model by ID across both `MODELS` and `MACBOOK_MODELS` | Do not change — used by store |

**Adding a new iPhone model:**
```ts
// In MODELS array, copy the pattern:
{ id: "18promax", name: "iPhone 18 Pro Max", series: "18 Series", category: "iphone" as const,
  storages: { "256GB": 100000, "512GB": 115000, "1TB": 130000 } },
// Also add "18 Series" to SERIES array
```

**Adding a new MacBook model:**
```ts
// In MACBOOK_MODELS array:
{ id: "mba-m5", name: "MacBook Air 13\" M5", series: "MacBook Air", category: "macbook" as const,
  chips: ["M5"], storages: { "M5": { "256GB": 95000, "512GB": 108000 } } },
```

**Adding a condition question:**
```ts
// To QUESTIONS or MAC_QUESTIONS:
{ type: "single", q: "Is the SIM tray present?", sub: "Check the side of the device", opts: [
  { label: "Yes", factor: 1.0 },
  { label: "No",  factor: 0.97 },
] },
```

### Other `lib/` files

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `store.ts` | P1 | Zustand store — all app state (auth, sell flow, enquiry, settings, admin CRUD). `computeQuote` handles both flat (iPhone) and nested (MacBook) pricing. `login()` checks demo admin credentials | Adding new state, changing auth, changing sell flow |
| `quote.ts` | P1 | `calcQuote(base, answers, questions)` — multiplies base price by all condition factors, rounds to nearest ₹100. `quoteGrade()` returns Good/Fair/Poor | Changing pricing calculation |
| `types.ts` | MERGED | All TypeScript types — `Model`, `Enquiry`, `User`, `Quote`, `CartDevice`, `FlatStorages`, `NestedStorages`, `TRACKING_STEPS`, etc. | Adding new types |
| `motion.ts` | P1 | Framer Motion variants (`fadeUp`, `staggerContainer`) | Changing animation timing |
| `toast.ts` | P1 | Zustand toast store — `toast(message, tone?)` helper | Changing toast |
| `utils.ts` | P1 | `cn()` (Tailwind merge), `fmt()` (₹ formatter), `makeEnquiryId()`, `initials()` | Adding utilities |
| `supabase/client.ts` | P2 | `createBrowserClient()` for client components | Changing Supabase project |
| `supabase/server.ts` | P2 | `createServerClient()`, `createRouteClient()`, `createServiceClient()` | Changing Supabase project |
| `auth.ts` | P2 | Supabase auth helpers (Google, phone OTP, email) | Adding OAuth providers |
| `email.ts` | P2 | `sendAdminNotification()`, `sendCustomerConfirmation()` — Resend email templates | Changing email copy |
| `pricing.ts` | P2 | `formatFactorDelta()` — used in admin Questions UI to show −8% labels | Changing factor display |
| `format.ts` | P2 | `inr(n)` — ₹ formatter for admin panel | Admin formatting |

---

## `supabase/` — Database

| File | What it does | Change when |
|------|-------------|-------------|
| `migrations/001_initial.sql` | Full schema — 7 tables, RLS, triggers. **Never edit** after applying | Never — add a new migration file |
| `migrations/002_grants.sql` | Role grants for anon + authenticated | Adding tables that need public access |
| `seed.sql` | 20 iPhone models, 28 MacBook models, 13 condition questions, 6 reviews | Adding seed data for development |

---

## `tokens/` and `design-system/`

| File | What it is |
|------|-----------|
| `tokens/design-tokens.json` | Figma design tokens export — reference only |
| `design-system/README.md` | Design system overview |
| `design-system/foundations.md` | Colour palette, spacing, typography |
| `design-system/components.md` | Component usage guidelines |
| `design-system/patterns.md` | UI patterns (forms, cards, flows) |
| `design-system/figma-variables.md` | Figma variable → CSS custom property mapping |

---

## Unused legacy components `[P2]`

These files exist from P2 but are **not used in any active routes**. They are safe to delete.

| File | Replaced by |
|------|------------|
| `components/admin/AdminShell.tsx` | `app/admin/layout.tsx` |
| `components/admin/EnquiryRow.tsx` | `app/admin/Dashboard.tsx` inline |
| `components/AuthModal.tsx` | `app/login/page.tsx` |
| `components/SellWizard.tsx` | `app/sell/*` pages |
| `components/HomeCatalog.tsx` | `components/marketing/ModelSelector.tsx` |
| `components/TopNav.tsx` | `components/shared/SiteHeader.tsx` |
| `components/BottomNav.tsx` | `components/shared/BottomNav.tsx` |
| `components/Providers.tsx` | `components/shared/Providers.tsx` |
| `components/CategoryTabs.tsx` | `components/marketing/ModelSelector.tsx` tabs |
| `components/ModelLanding.tsx` | Not used (planned for `/sell/[slug]` pages) |
| `components/ModelList.tsx` | Not used |
| `components/ConditionQuestion.tsx` | `components/sell/QuestionBody.tsx` |
| `components/CustomerStories.tsx` | Not used |
| `components/Faq.tsx` | `components/ui/Accordion.tsx` on homepage |
