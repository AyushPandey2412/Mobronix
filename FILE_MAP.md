# FILE_MAP.md — Every file in this project, what it does, and when to touch it

> **Legend**
> `[P1]` = came from Mobronix (Figma frontend, blue design system, Zustand)
> `[P2]` = came from practice (Supabase backend, admin panel)
> `[MERGED]` = created during merge to bridge both

---

## Index

- [Quick-reference table](#quick-reference-i-want-to-change) — 30 common "I want to change X" lookups
- [app/_components/HomePageClient.tsx — Homepage in detail](#app_componentshomepageclienttsx--homepage-in-detail-p1) — all sections, hero, how-it-works, FAQs
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
| Hero headline / subheading / badge text | `app/_components/HomePageClient.tsx` → `<h1>`, `<p>`, `<span>` (first ~30 lines of `return`) |
| Hero CTA buttons ("Get my price", "WhatsApp us") | `app/_components/HomePageClient.tsx` → buttons inside the Hero block |
| Hero stats (12,400+, 4.8/5, Same-day) | `app/_components/HomePageClient.tsx` → stats row data |
| Hero floating badges ("Paid in 24 min", "IMEI verified") | `app/_components/HomePageClient.tsx` → absolute divs inside the mockup columns |
| Hero device illustration | `components/shared/DeviceVisual.tsx` — pure SVG |
| "How it works" steps (4 cards) | `components/marketing/HowItWorks.tsx` |
| "Why us" items (4 icon cards) | `components/marketing/WhyUs.tsx` |
| "Pro tips" items (4 numbered cards) | `app/_components/HomePageClient.tsx` → tips section |
| FAQ questions and answers | `app/_components/HomePageClient.tsx` → `FAQS` import (lives in `lib/data.ts`) |
| Customer reviews | `lib/data.ts` → `export const REVIEWS: Review[]` |
| Bottom CTA section text | `app/_components/HomePageClient.tsx` → bottom CTA banner markup |
| Section headings (eyebrow, title, subtitle) | Edit the `<SectionHeading eyebrow="..." title="..." subtitle="..."/>` at each section |
| Condition questions (sell flow) | `lib/data.ts` → `export const QUESTIONS` (iPhone) or `export const MAC_QUESTIONS` (MacBook) |
| iPhone buyback prices | Seed Excel (`Price.xlsx`) or update `lib/data.ts` → `export const MODELS` |
| MacBook buyback prices | Seed Excel (`Price.xlsx`) or update `lib/data.ts` → `export const MACBOOK_MODELS` |
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

## `app/_components/HomePageClient.tsx` — Homepage in detail `[P1]`

This file controls the rendering of the client-side homepage components.

### Sections and where they live

```
app/_components/HomePageClient.tsx
│
├── <section bg-mesh>             ← HERO (renders split mobile/desktop layouts)
│   ├── <motion.span>             ← Eyebrow badge "Your phone. Your Choice. No Pressure."
│   ├── <motion.h1>               ← Main headline
│   ├── <motion.p>                ← Subheading paragraph
│   ├── <motion.div>              ← CTA buttons (Get my price, WhatsApp us)
│   └── device column             ← Floating mockup visual + tooltips
│
├── {resume && ...}               ← Resume-quote banner (auto, don't edit)
│
├── <section id="models">         ← ModelSelector (tabs category grids)
│
├── <HowItWorks />                ← HOW IT WORKS — renders steps
│
├── <WhyUs />                     ← WHY US — renders why selling cards
│
├── <AndroidBuyback />            ← ANDROID BUYBACK — glassmorphic bento cards
│
└── <section CTA>                 ← Bottom CTA banner
```

---

## `components/shared/DeviceVisual.tsx` — Hero phone illustration `[P1]`

Pure SVG iPhone illustration. No image file needed.

**Props:**
- `tone` — `"graphite"` (dark, used on storage page) · `"blue"` (used in hero) · `"sand"` (unused)
- `floating` — `true` by default — adds a slow floating animation
- `className` — controls size (`h-72 w-40` etc.)

---

## `components/shared/SectionHeading.tsx` — Reusable section heading `[P1]`

Used above every homepage section. Props:
- `eyebrow` — small uppercase text in brand blue above the title (e.g. `"How it works"`)
- `title` — main `<h2>` text
- `subtitle` — optional paragraph below
- `center` — centres all text

---

## `components/ui/Accordion.tsx` — FAQ accordion `[P1]`

Used on the homepage FAQ section. Props:
- `items` — array of `{ q: string; a: string }`

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

**`multi`** — same as single but multiple can be selected. One option can be marked `exclusive` (selecting it clears all others).

**`matrix`** — renders a two-column grid of rows, each with Yes / No buttons. Used for the device functions check.

---

## `components/ui/Selectable.tsx` — Option cards and filter pills `[P1]`

Two components:

**`<OptionCard>`** — large tappable option row used in condition questions.
- Selected state: blue border + blue background + check circle
- Unselected: neutral border, hover darkens border

**`<Pill>`** — small filter chip used in ModelSelector series pills.
- Active: `bg-brand text-white`
- Inactive: `bg-surface border-border text-text-secondary`

---

## Root config files

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `package.json` | MERGED | All dependencies | Adding/removing npm packages |
| `tailwind.config.ts` | MERGED | Unified design tokens | Adding new color tokens |
| `next.config.mjs` | P1 | Next.js config | Adding image domains, redirects |
| `postcss.config.mjs` | P1 | PostCSS with Tailwind + Autoprefixer | Rarely |
| `tsconfig.json` | P1 | TypeScript config, `@/` path alias | Adding new path aliases |
| `middleware.ts` | MERGED | Refreshes Supabase session cookie for `/admin/*`. | If adding server-side route protection |
| `.env.local` | P2 | All secrets | When changing Supabase project or adding email/OAuth |

---

## `app/` — Pages

### Public pages

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `app/layout.tsx` | P1 | Root layout — Inter + JetBrains Mono fonts, `metadataBase`, title template, OG/Twitter, keywords, `<AppChrome>` | Changing fonts, SEO metadata, global providers |
| `app/globals.css` | MERGED | CSS variables (blue tokens), global scroll padding overrides | Adding global styles |
| `app/page.tsx` | P1 | Homepage entry component — pre-fetches models server-side and sets metadata tags | Updating metadata or pre-fetch hooks |
| `app/template.tsx` | P1 | Page transition wrapper (framer-motion fade) | Changing route transition |
| `app/login/page.tsx` | MERGED | Single unified login — Supabase email first (real admin), Zustand fallback (sellers + demo admin). Routes admin → `/admin`, seller → home/sell | Login copy, OAuth, credential changes |
| `app/robots.ts` | P2 | robots.txt — disallows all sell steps, admin, account, api, manual | Changing crawl rules |
| `app/sitemap.ts` | MERGED | Dynamic sitemap — home, category paths, and all active model landing pages | Adding new indexable pages |

### Sell flow pages — all `[P1]`, all `noindex`

State flows: model select → storage → condition → quote → photos → checkout → confirm

| File | What it does | Change when |
|------|-------------|-------------|
| `app/sell/layout.tsx` | Wraps sell pages in `container-app` with padding | Changing sell flow container |
| `app/sell/iphone/page.tsx` | Indexable dedicated catalog grid listing all iPhone models | Customizing the full iPhone catalog view |
| `app/sell/macbook/page.tsx` | Indexable dedicated catalog grid listing all MacBook models | Customizing the full MacBook catalog view |
| `app/sell/iphone/[slug]/page.tsx` | Dynamic landing page route for a single iPhone model | Customizing the iPhone model layout |
| `app/sell/macbook/[slug]/page.tsx` | Dynamic landing page route for a single MacBook model | Customizing the MacBook model layout |
| `app/sell/storage/page.tsx` | Pick storage (iPhone flat) or chip + storage (MacBook nested). Shows animated price. | Adding chip selector options |
| `app/sell/condition/page.tsx` | Animated question-by-question flow. Uses `QUESTIONS` for iPhones, `MAC_QUESTIONS` for MacBooks. | Changing question flow UI |
| `app/sell/quote/page.tsx` | Shows final quote with grade badge, deduction breakdown. | Changing quote display |
| `app/sell/photos/page.tsx` | 5 photo slots. Optional skip photo capabilities | Changing photo requirements |
| `app/sell/checkout/page.tsx` | Address, pincode, slot picker (Sheet), payment mode (Sheet). | Adding checkout fields |
| `app/sell/confirm/page.tsx` | Success screen with animated check, executive name, OrderCard | Changing confirmation copy |

### Account pages — all `[P1]`, all `noindex`

| File | What it does | Change when |
|------|-------------|-------------|
| `app/account/layout.tsx` | Wraps account with `<AuthGate>` | Changing account layout |
| `app/account/page.tsx` | User profile — name, mobile, logout | Changing profile UI |
| `app/account/settings/page.tsx` | Notifications + language preferences (Zustand) | Adding settings |
| `app/account/referral/page.tsx` | Referral code display | Changing referral program |

### Track page — `[P1]`, `noindex`

`app/track/page.tsx` — wrapped in `<AuthGate>`. Search by enquiry ID or mobile. Shows `OrderCard` + `StatusTimeline`.

### Admin panel — all `[P2]`

Auth handled by `AdminAuthGate` — checks Zustand demo admin OR Supabase real admin.

| File | What it does | Change when |
|------|-------------|-------------|
| `app/admin/layout.tsx` | Sidebar layout wrapping `AdminAuthGate` | Changing admin sidebar |
| `app/admin/AdminAuthGate.tsx` | Dual auth gate — Zustand demo admin or Supabase `profiles.role = 'admin'`. | Changing admin auth logic |
| `app/admin/AdminNav.tsx` | Sidebar nav + sign out. | Adding nav items |
| `app/admin/page.tsx` | Dashboard page entry point | Changing dashboard data source |
| `app/admin/Dashboard.tsx` | Stat cards, 7-day bar chart, filterable enquiry table, CSV export | Changing dashboard UI |
| `app/admin/orders/[id]/page.tsx` | Fetches single enquiry + history from Supabase | Changing data fetch |
| `app/admin/orders/[id]/OrderDetail.tsx` | Order detail — customer info, devices, WhatsApp templates, activity history | Adding fields or WhatsApp templates |
| `app/admin/products/page.tsx` | Fetches models from Supabase | Changing product data fetch |
| `app/admin/products/ProductsClient.tsx` | Products CRUD — iPhone and MacBook tabs, toggle active, reorder | Changing product management UI |
| `app/admin/questions/page.tsx` | Fetches questions from Supabase | Changing question fetch |
| `app/admin/questions/QuestionsClient.tsx` | Questions CRUD — category tabs, reorder, add/edit/delete | Changing question management UI |

### API routes

| File | What it does | Change when |
|------|-------------|-------------|
| `app/api/enquiry/route.ts` | `POST /api/enquiry` — saves to Supabase, records history, sends emails. | Adding fields or email logic |
| `app/api/export/route.ts` | `GET /api/export` — admin-only CSV export | Changing export format |

---

## `components/` — UI components

### `components/shared/` — Layout chrome `[P1]`

| File | What it does | Change when |
|------|-------------|-------------|
| `AppChrome.tsx` | Decides which chrome per route | Adding route-specific chrome rules |
| `SiteHeader.tsx` | Sticky header — Logo, nav links, WhatsApp button, Login/User button | Adding nav items |
| `BottomNav.tsx` | Mobile-only fixed bottom nav | Adding bottom nav items |
| `Footer.tsx` | Dark footer with logo, company links, contact | Changing footer content |
| `AuthGate.tsx` | Client-side route guard using Zustand | Do not change |
| `FlowHeader.tsx` | Back button + title on all sell flow pages | Changing sell flow header style |
| `StickyBar.tsx` | Fixed mobile CTA bar at bottom of sell pages | Changing mobile CTA style |
| `CartBar.tsx` | Floating cart bar on homepage when cart has items | Changing cart bar appearance |
| `Logo.tsx` | Mobronix wordmark with blue S icon | Changing logo |
| `DeviceVisual.tsx` | Stylised iPhone SVG — used on hero and storage page | Changing device illustration |
| `SectionHeading.tsx` | Reusable eyebrow + title + subtitle block | Changing heading style |

### `components/marketing/` — Homepage `[P1]`

| File | What it does | Change when |
|------|-------------|-------------|
| `ModelSelector.tsx` | Category tabs + search + series pills + model card grid. Supports limiting and dynamic category filters | Changing model browse UX |
| `ModelCard.tsx` | Individual model card — handles dynamic zoom scale factors and high-res image sources | Changing card design |

### `components/sell/` — Sell flow `[P1]`

| File | What it does | Change when |
|------|-------------|-------------|
| `QuestionBody.tsx` | Renders condition question UI | Adding new question types |
| `PhotoUploader.tsx` | Single photo slot card — tap to toggle uploaded state | Changing photo upload UI |

### `components/track/` `[P1]`

| File | What it does |
|------|-------------|
| `OrderCard.tsx` | Compact order summary — model, amount, step badge, exec name |
| `StatusTimeline.tsx` | Horizontal step timeline for tracking progress |

### `components/ui/` — UI kit

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `Button.tsx` | P1 | Motion button | Changing button style |
| `Input.tsx` | P1 | Text input, Textarea, Select | Changing input style |
| `Badge.tsx` | P1 | Coloured badge pill | Changing badge |
| `Card.tsx` | P1 | Content card | Changing card style |
| `Accordion.tsx` | P1 | FAQ accordion | Changing FAQ UI |
| `Progress.tsx` | P1 | Labelled progress bar for condition question flow | Changing progress bar |
| `Stars.tsx` | P1 | `<Stars>` interactive + `<StarRow>` display | Changing stars |
| `Selectable.tsx` | P1 | `<Pill>` filter chip + `<OptionCard>` large option row | Changing question option style |
| `Sheet.tsx` | P1 | Bottom slide-up sheet for slot/payment pickers in checkout | Changing sheet |
| `BottomSheet.tsx` | P2 | Admin bottom sheet for product/question editor | Changing admin editor sheet |
| `ConfirmDialog.tsx` | P2 | Admin confirmation dialog | Changing admin dialogs |
| `Modal.tsx` | P1 | Centre modal dialog | Changing modal |
| `Skeleton.tsx` | P1 | Loading skeleton placeholder | Changing loading states |
| `EmptyState.tsx` | P1 | Empty state with icon + message | Changing empty states |
| `Toggle.tsx` | P1 | On/off toggle switch | Changing toggles |
| `Stepper.tsx` | P1 | Timeline stepper | Changing stepper |
| `Toaster.tsx` | P1 | Toast notification renderer | Changing toasts |
| `StatusChip.tsx` | P2 | Admin order status chip | Changing status display |

---

## `lib/` — Business logic

### `lib/data.ts` — All static content `[P1]`

Everything visible on the site that isn't loaded from the database or hardcoded in client components.

| Export | What it is | How to change |
|--------|-----------|---------------|
| `MODELS` | iPhone catalog fallback array with flat storage pricing | Add/edit entries to change models or prices |
| `MACBOOK_MODELS` | MacBook catalog fallback array with nested cycle pricing | Add/edit entries to change Mac models or prices |
| `SERIES` | iPhone series filter pill labels | Add a new series name here and matching models |
| `MAC_SERIES` | MacBook series filter pill labels | Same for Mac |
| `QUESTIONS` | iPhone condition questions | Add/edit/reorder — question types: `single`, `multi`, `matrix` |
| `MAC_QUESTIONS` | MacBook condition questions | Same — affects MacBook sell flow only |
| `PHOTO_SLOTS` | 5 photo slot definitions | Add slots to require more photos |
| `TRACK_STEPS` | 5 tracking step labels | Change step names shown on `/track` |
| `SLOTS` | Pickup time options shown in checkout | Add or remove time slots |
| `EXECUTIVES` | Executive names randomly assigned at enquiry creation | Add real names |
| `REVIEWS` | Customer reviews shown on homepage | Add/edit/remove reviews |
| `SEED_ENQUIRIES` | Sample enquiries shown in demo admin dashboard | Add more seeds for testing |
| `getModel(id)` | Finds a model by ID across both `MODELS` and `MACBOOK_MODELS` | Do not change — used by store |

### Other `lib/` files

| File | Source | What it does | Change when |
|------|--------|-------------|-------------|
| `store.ts` | P1 | Zustand store — all app state (auth, sell flow, enquiry, settings, admin CRUD). | Adding new state, changing auth, changing sell flow |
| `quote.ts` | P1 | Calculates quotes based on answers, rounds to nearest ₹100. | Changing pricing calculation |
| `types.ts` | MERGED | All TypeScript types | Adding new types |
| `motion.ts` | P1 | Framer Motion variants | Changing animation timing |
| `toast.ts` | P1 | Zustand toast store | Changing toast |
| `utils.ts` | P1 | Core helper utilities (formatting, ID generation) | Adding utilities |
| `supabase/client.ts` | P2 | Browser client initializer | Changing Supabase project |
| `supabase/server.ts` | P2 | Server, Route, and Service client initializers | Changing Supabase project |
| `auth.ts` | P2 | Supabase auth helpers | Adding OAuth providers |
| `email.ts` | P2 | Transactional email helper logic | Changing email copy |
| `pricing.ts` | P2 | Helper formatting delta indicators | Changing factor display |
| `format.ts` | P2 | INR currency formatter for admin panel | Admin formatting |

---

## `supabase/` — Database

| File | What it does | Change when |
|------|-------------|-------------|
| `migrations/001_initial.sql` | Full schema — 7 tables, RLS, triggers. | Never — add a new migration file |
| `migrations/002_grants.sql` | Role grants for anon + authenticated | Adding tables that need public access |
| `seed.sql` | Seeding script for Supabase database tables | Adding seed data for development |

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
| `components/ModelList.tsx` | Not used |
| `components/ConditionQuestion.tsx` | `components/sell/QuestionBody.tsx` |
| `components/CustomerStories.tsx` | Not used |
| `components/Faq.tsx` | `components/ui/Accordion.tsx` on homepage |
