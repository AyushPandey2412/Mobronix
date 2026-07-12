# PROJECT_CONTEXT.md

Single-file context for the **SellMyiPhone** app. Hand this to any AI chat / developer
so they understand the whole project without exploring. Reflects the **current** state.

---

## 1. What this is

A **Next.js 15 (App Router)** web app for an **iPhone/MacBook buyback service** (like
Cashify/Cellkar). A seller picks a device → answers condition questions → gets an instant
quote → logs in → books a free doorstep pickup. Admins manage orders, products, and
condition questions through a Supabase-backed dashboard.

- **Brand:** "SellMyiPhone" — theme color **blue** (`#1A56DB`).
- **Region/locale:** India (₹ INR, Mumbai/Navi Mumbai/Thane), `en_IN`.

---

## 2. Tech stack

| Area | Tech |
|---|---|
| Framework | Next.js `15.5.19` (App Router, RSC), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v3 + CSS variables (design tokens in `app/globals.css`) |
| Animation | framer-motion |
| Icons | lucide-react |
| State (client) | Zustand (`lib/store.ts`, persisted to localStorage) |
| Server data | TanStack Query (`@tanstack/react-query`) |
| Backend/DB/Auth | Supabase (Postgres + Auth + Storage) via `@supabase/ssr` |
| Email | Resend (optional) |
| Validation | Zod (API routes) |
| Hosting | Vercel (see `DEPLOY.md`) |

**Supabase project ref:** `tndbjposrliqshigmdvm` (already migrated + seeded).

---

## 3. Quick start

```bash
npm install
npm run dev          # http://localhost:3000  (uses Turbopack: "next dev --turbopack")
npm run build        # production build (NOTE: ~40 pre-existing TS errors — see §12)
```
`.env.local` holds Supabase keys (already present for dev). See §10.

**Test logins:**
- Admin (real Supabase): `ayushpandey5248@gmail.com` / `ayush2412` → `/admin`
- Admin (demo, local): `admin` / `admin123`
- Seller: phone-number quick login on the quote page (demo — sets local user)

---

## 4. Folder structure (top level)

```
merged_final/
├─ app/                  # Next.js App Router: routes, layouts, API routes
│  ├─ _components/        # Home page client component
│  ├─ account/           # Seller account pages (gated)
│  ├─ admin/             # Admin dashboard (gated, role=admin)
│  ├─ api/               # Route handlers (enquiry create/status, CSV export)
│  ├─ legal/             # Privacy / Terms pages
│  ├─ login/             # Seller/admin login page
│  ├─ sell/              # The sell flow (storage → condition → quote → photos → checkout → confirm)
│  ├─ track/             # Order tracking
│  ├─ layout.tsx         # Root layout (fonts, Providers, AppChrome, RouteProgress)
│  ├─ template.tsx       # Per-navigation enter animation
│  ├─ page.tsx           # Home page (server component; prefetches models)
│  └─ globals.css        # Design tokens (CSS variables) + base styles
├─ components/           # Reusable React components (see §6)
├─ lib/                  # Logic: store, supabase clients, data, quote engine, helpers
├─ supabase/             # SQL migrations + seed
├─ public/               # Static assets (icons, og image)
├─ middleware.ts         # Refreshes Supabase session cookie on /admin/*
├─ next.config.mjs       # Images (remote CDNs), security headers, optimizePackageImports
├─ tailwind.config.ts    # Tailwind theme (colors map to CSS vars, custom fontSizes)
└─ *.md                  # Docs (see §13)
```

---

## 5. Routes (app/)

| Route | File | Purpose | Gated? |
|---|---|---|---|
| `/` | `app/page.tsx` + `_components/HomePageClient.tsx` | Home: hero, model selector, How it works, Why us, handover steps, reviews, FAQ, top prices | no |
| `/login` | `app/login/page.tsx` | Login/Signup (uses `AuthForm`) | no |
| `/sell/storage` | `app/sell/storage/page.tsx` | Pick storage/chip; shows device image + price | no |
| `/sell/condition` | `app/sell/condition/page.tsx` | Condition questions (from Supabase); sets `activeQuestions` | no |
| `/sell/quote` | `app/sell/quote/page.tsx` | Shows quote; **price blurred until phone login** (`PriceUnlockModal`) | login to reveal |
| `/sell/photos` | `app/sell/photos/page.tsx` | Optional photo upload (Supabase Storage) | no |
| `/sell/checkout` | `app/sell/checkout/page.tsx` | Address/slot/payment; **inline login if needed**; submits enquiry | login to submit |
| `/sell/confirm` | `app/sell/confirm/page.tsx` | Success + ENQ number | — |
| `/track` | `app/track/page.tsx` | Search any order by ENQ id; show live status; Refresh | yes (AuthGate) |
| `/account/*` | `app/account/*` | Profile, settings, referral | yes |
| `/admin` | `app/admin/*` | Dashboard, enquiries, orders, products, questions | role=admin |
| `/legal/*` | `app/legal/*` | Privacy / Terms | no |
| **API** | | | |
| `POST /api/enquiry` | `app/api/enquiry/route.ts` | Create enquiry (service role; rate-limited) | — |
| `GET /api/enquiry/status` | `app/api/enquiry/status/route.ts` | Look up order status by `?id=` or `?ref=ENQ-x` (service role) | — |
| `GET /api/export` | `app/api/export/route.ts` | CSV export of enquiries (admin only) | role=admin |

Every top-level route also has a `loading.tsx` skeleton (track, sell, cart, account, admin/*).

---

## 6. Components

> **Active vs legacy:** the live app uses `components/shared/*`, `components/marketing/*`,
> `components/ui/*`, `components/sell/*`, `components/track/*`, `components/admin/*`.
> The **root-level** files (`AuthModal, TopNav, BottomNav, ModelList, HomeCatalog,
> CategoryTabs, ConditionQuestion, CustomerStories, Faq, SellWizard, Providers,
> ToastHost`) are **legacy/unused** leftovers — ignore them.

| Folder | Key components | Role |
|---|---|---|
| `components/shared/` | `AppChrome` (header/footer/bottomnav switcher), `SiteHeader` (nav + scroll-spy), `Footer`, `Providers` (Query + toaster), `RouteProgress` (top loading bar), `AuthForm` (login/signup tabs), `AuthGate` (redirect guard), `PriceUnlockModal` (Cashify-style price gate), `SectionHeading`, `FlowHeader`, `StickyBar`, `CartBar`, `DeviceVisual`, `Logo` | App chrome + auth + shared UI |
| `components/marketing/` | `ModelSelector` (search/filter grid, TanStack Query), `ModelCard` (device card w/ image), `HowItWorks` (illustrated 3-step, blue), `WhyUs` (comparison table, blue) | Home marketing sections |
| `components/sell/` | `QuestionBody` (renders single/multi/matrix questions + `canProceed`), `PhotoUploader` | Sell flow |
| `components/track/` | `OrderCard`, `StatusTimeline` | Tracking UI |
| `components/admin/` | `AdminShell`, `EnquiryRow` | Admin UI |
| `components/ui/` | Primitives: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Sheet`, `BottomSheet`, `Accordion`, `Stepper`, `Progress`, `Skeleton`, `Stars`, `Selectable`, `Toggle`, `EmptyState`, `StatusChip`, `Toaster`, `ConfirmDialog` | Design-system primitives |

---

## 7. lib/ (logic)

| File | Purpose |
|---|---|
| `lib/store.ts` | **Zustand store** — single source of client state: `user`, sell-flow state (`selectedModelId`, `selectedStorage`, `answers`, `activeQuestions`, `quote`, `photos`, `cart`, `checkout`), `enquiry`, plus all actions (`login`, `signup`, `phoneLogin`, `logout`, `selectModel`, `computeQuote`, `submitEnquiry`, admin CRUD…). Persisted to localStorage (`partialize`). |
| `lib/data.ts` | Local seed/fallback data: `MODELS`, `MACBOOK_MODELS`, `QUESTIONS`, `MAC_QUESTIONS`, `SERIES`, `MAC_SERIES`, `SLOTS`, `EXECUTIVES`, `TRACK_STEPS`, `REVIEWS`, `FAQS`, `STATS`, `getModel()`. Used when Supabase is empty. |
| `lib/deviceImages.ts` | `getDeviceImage(model)` → Apple CDN product image URL. Resolves by id **or slug or name** (Supabase uses slugs/UUIDs). All URLs verified 200. |
| `lib/quote.ts` | `calcQuote(base, answers, questions)` — base price × condition factors → final (rounded ₹100). `quoteGrade()`. |
| `lib/adminQueries.ts` | TanStack Query fns + keys for Supabase reads/writes (models, questions, enquiries). `fetchPublicModels`, `fetchPublicQuestions` (normalizes Supabase→UI question shape), admin CRUD. |
| `lib/supabase/client.ts` | Browser Supabase client (`@supabase/ssr` `createBrowserClient`). |
| `lib/supabase/server.ts` | Server clients: `createServerClient`/`createRouteClient` (async, cookie-aware) + `createServiceClient` (service role, bypasses RLS, server-only). |
| `lib/auth.ts` | Supabase auth helpers: `signInWithGoogle`, `sendPhoneOtp`, `verifyPhoneOtp`, `signInWithEmail`, `signUpWithEmail`. (Wired for real auth — see `AUTH_SETUP.md`; UI currently uses demo login.) |
| `lib/utils.ts` | `cn()` — **extended tailwind-merge** that knows the custom fontSizes (`text-body-md`, `text-h2`…) so color classes aren't dropped. Plus helpers. |
| `lib/email.ts` | Resend email senders (admin notification + customer confirmation). No-op if `RESEND_API_KEY` empty. |
| `lib/motion.ts` | framer-motion variants (`fadeUp`, `staggerContainer`). |
| `lib/types.ts` | All TypeScript interfaces (`Model`, `Question`, `Enquiry`, `Quote`, `User`, `PhotoState`, …). |
| `lib/toast.ts` | Toast helper. |
| (`lib/pricing.ts`, `lib/format.ts`, `lib/clsx.ts`, `lib/queryClient.ts`) | Misc/older helpers. |

---

## 8. Database (Supabase Postgres)

Migrations in `supabase/migrations/` (run in order 001→006, then `seed.sql`). See `MIGRATIONS.md`.

| Table | Purpose / key columns |
|---|---|
| `profiles` | One row per auth user. `id` (uuid, = auth.users.id), `full_name`, `phone`, `email`, `role` (`customer`/`admin`). Auto-created by `handle_new_user` trigger. |
| `models` | Devices. `id` (uuid), `slug` (e.g. `iphone-12-pro`), `name`, `category` (`iphone`/`macbook`), `series`, `chips`, `storages` (jsonb: flat for iPhone, nested-by-chip for MacBook), `is_active`, `sort_order`. |
| `questions` | Condition quiz. `order_index`, `category` (`iphone`/`macbook`/`all`), `type` (`single`/`multi`/`matrix`), `question_text`, `hint_text`, `options` (jsonb `{label,factor}`), `matrix_items` (jsonb `{label,yesFactor,noFactor}`), `exclusive_option`, `is_active`. |
| `enquiries` | Sell requests. `id` (uuid), `display_id` (`ENQ-00001`, sequential), `user_id` (nullable for guests), `devices` (jsonb array), `total_amount`, `address`, `pincode`, `pickup_slot`, `payment_mode`, `status` (`pending`/`accepted`/…), `tracking_step` (0–4), `assigned_exec`, `internal_note`. |
| `enquiry_history` | Audit log per enquiry. `actor` (`customer`/`admin`), `action`, `created_at`. |
| `enquiry_photos` | Uploaded photo paths. `enquiry_id`, `slot`, `storage_path`. |
| `reviews` | Homepage reviews. `is_published`. |

**Storage:** private bucket `enquiry-photos`.
**Seed counts:** models 52 (20 iPhone + 32 MacBook), questions 26 (13+13), reviews 6.
**RLS:** public read for models/questions/published reviews; users see own enquiries;
admins see all; **guest enquiries inserted via service role** (migration 006 grants
service_role the needed privileges). `TRACK_STEPS = [Submitted, Verification, Price Confirmed, Pickup, Paid]`.

---

## 9. Auth model (important — it's hybrid)

There are **two coexisting systems**:

1. **Local demo auth (Zustand)** — what the seller flow uses today.
   - `login(identity, password)` / `signup(name, mobile, password)` / `phoneLogin(mobile)`
     just set `store.user`. No real password check (any works). `PriceUnlockModal` uses
     `phoneLogin` (phone-only, demo) to "unlock" the quote.
2. **Real Supabase auth** — used for **admin** and available for sellers.
   - Email/password via `signInWithPassword`. Admin = `profiles.role='admin'`.
   - `lib/auth.ts` also has Google OAuth + phone OTP ready, **but the UI isn't wired to
     them yet** — follow `AUTH_SETUP.md` to enable real Google/OTP (needs an OAuth callback
     route + a session→store bridge).

The app reads `useStore(s => s.user)` everywhere. `{ name, mobile, role: 'seller'|'admin' }`.

---

## 10. Environment variables (`.env.local`)

| Var | Public | Use |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✗ secret | Server-only; bypasses RLS (enquiry insert, status lookup, admin scripts) |
| `NEXT_PUBLIC_APP_URL` | ✓ | Base URL (SEO/OG/sitemap/emails) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✓ | WhatsApp CTA number |
| `ADMIN_EMAIL` | ✗ | Receives enquiry email |
| `RESEND_API_KEY` | ✗ | Email (optional) |
| `GOOGLE_CLIENT_ID/SECRET` | ✗ | Optional; Google login (configured in Supabase) |

`.env.local` is git-ignored — re-enter vars in Vercel for production.

---

## 11. Design system / conventions

- **Tokens:** colors/spacing/fontSizes are CSS variables in `app/globals.css`, mapped to
  Tailwind in `tailwind.config.ts`. Use semantic classes: `bg-surface`, `text-text-primary`,
  `text-brand`, `border-border`, `bg-primary-50`, etc.
- **Primary text** is **brand navy** (`--text-primary: #0F2147`), not pure black. Big
  **headings use a navy→blue gradient** (`bg-gradient-to-br from-primary-900 to-primary-600
  bg-clip-text text-transparent`).
- **`cn()`** (lib/utils) merges classes; it's been extended so custom `text-{size}` classes
  don't clobber `text-{color}` (this fixed white button text).
- **Buttons:** `components/ui/Button.tsx` — variants `primary|secondary|outline|ghost|whatsapp|danger`, sizes `sm|md|lg`.
- **Custom fontSizes:** `text-display-*`, `text-h1..h4`, `text-body-lg/md/sm`, `text-caption`, `text-label`, `text-overline`.
- **Images:** `next/image`; allowed remote hosts = Apple CDN + `*.supabase.co` (in `next.config.mjs`).

---

## 12. Current state / known issues

**Working & recently fixed:**
- Supabase connected, all migrations + seed applied; admin user created.
- Device images fixed (resolver by id/slug/name; all URLs 200; enlarged in cards).
- Sell flow: no login at product click (gate commented in `ModelSelector`); **login gate is
  the `PriceUnlockModal` on the quote page** (price blurred until phone login) + inline auth at checkout.
- Quote price bug fixed (`resolveActiveModel` reads live store models, not just local).
- Condition questions render (Supabase shape normalized) and quote uses the same `activeQuestions`.
- Enquiry submit works (fixed rate-limiter bug + service_role grants migration 006).
- Track: search by `ENQ-id` + Refresh now fetch **real** status via `/api/enquiry/status` (no fake advancing).
- Nav scroll-spy underline; blue theme throughout; HowItWorks + WhyUs sections rebuilt in blue.

**⚠️ Known issues:**
- **~40 pre-existing TypeScript errors** in 15 files (admin pages, `lib/quote.ts`,
  `lib/store.ts` `PhotoState` import, `lib/email.ts`, sell `getModels`/`getQuestions`
  imports, `app/sitemap.ts` `legal_pages`, etc.). They **don't** break `next dev` but
  **will fail `next build`/Vercel** unless fixed or `typescript.ignoreBuildErrors` is set
  (see `DEPLOY.md` §1).
- Real Google/OTP login is **scaffolded but not wired into the UI** (see `AUTH_SETUP.md`).
- Seller auth is demo (phone-only, no real OTP) until `AUTH_SETUP.md` is implemented.

---

## 13. Other docs in this repo

| File | What it covers |
|---|---|
| `DEPLOY.md` | Vercel deployment (build-fix, env vars, Supabase URLs, checklist) |
| `AUTH_SETUP.md` | Add real Google login + mobile OTP (backend + frontend code) |
| `MIGRATIONS.md` | DB migrations, table reference, common SQL |
| `BACKEND.md` | Supabase clients, API routes, RLS notes |
| `SETUP.md` | Local run/config/deploy basics |
| `FILE_MAP.md` | (older) per-file map |
| `STATE.md` | (older) state/flow notes |
| `SEO.md` | SEO/metadata notes |
| `README.md` | Short intro |

> Note: `FILE_MAP.md`, `STATE.md`, `PROJECT_INDEX.md` predate recent changes — **this file
> (PROJECT_CONTEXT.md) is the most up-to-date overview.**

---

## 14. How to give context to an AI quickly

> "It's a Next.js 15 App Router iPhone-buyback app (blue theme). Client state is a Zustand
> store (`lib/store.ts`); data/auth is Supabase via `@supabase/ssr`. Sell flow:
> storage→condition→quote→photos→checkout. Login gate is `PriceUnlockModal` on the quote
> page (demo phone login). Models/questions come from Supabase (fallback `lib/data.ts`);
> images via `lib/deviceImages.ts`. See PROJECT_CONTEXT.md for the full map. Note: ~40
> pre-existing TS errors block `next build` (DEPLOY.md §1)."
