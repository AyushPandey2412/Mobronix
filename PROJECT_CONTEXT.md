# PROJECT_CONTEXT.md

Single-file context for the **Mobronix** app. Hand this to any AI chat / developer so they understand the whole project without exploring. Reflects the **current** state.

---

## 1. What this is

A **Next.js 14 (App Router)** web app for an **iPhone/MacBook buyback service** (like Cashify/Cellkar). A seller picks a device → answers condition questions → gets an instant quote → logs in → books a free doorstep pickup. Admins manage orders, products, and condition questions through a Supabase-backed dashboard.

- **Brand:** "Mobronix" — theme color **blue** (`#1A56DB`).
- **Region/locale:** India (₹ INR, Mumbai/Navi Mumbai/Thane/Sangli), `en_IN`.

---

## 2. Tech stack

| Area | Tech |
|---|---|
| Framework | Next.js `14.2.14` (App Router, RSC), React 18 |
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

---

## 3. Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
```
`.env.local` holds Supabase keys. See `SETUP.md`.

**Test logins:**
- Admin (demo, local): `admin` / `admin123`
- Admin (production): Your Supabase email + password (requires profile `role = 'admin'`)
- Seller: phone-number quick login on the quote page (demo — sets local user)

---

## 4. Folder structure (top level)

```
merged_final/
├─ app/                  # Next.js App Router: routes, layouts, API routes
│  ├─ _components/       # Home page client component
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
├─ components/           # Reusable React components
├─ lib/                  # Logic: store, supabase clients, data, quote engine, helpers
├─ supabase/             # SQL migrations + seed
├─ public/               # Static assets (icons, og image)
├─ middleware.ts         # Refreshes Supabase session cookie on /admin/*
├─ next.config.mjs       # Images (remote CDNs), security headers, optimizePackageImports
├─ tailwind.config.ts    # Tailwind theme (colors map to CSS vars)
└─ *.md                  # Docs
```

---

## 5. Routes (app/)

| Route | File | Purpose | Gated? |
|---|---|---|---|
| `/` | `app/page.tsx` + `_components/HomePageClient.tsx` | Home: hero, model selector, How it works, Why us, bento Android box, reviews, FAQ | no |
| `/login` | `app/login/page.tsx` | Login/Signup (uses `AuthForm`) | no |
| `/sell/iphone` | `app/sell/iphone/page.tsx` | Dedicated indexable catalog page for iPhones | no |
| `/sell/macbook` | `app/sell/macbook/page.tsx` | Dedicated indexable catalog page for MacBooks | no |
| `/sell/iphone/[slug]` | `app/sell/iphone/[slug]/page.tsx` | Indexable landing page for a single iPhone model | no |
| `/sell/macbook/[slug]` | `app/sell/macbook/[slug]/page.tsx` | Indexable landing page for a single MacBook model | no |
| `/sell/storage` | `app/sell/storage/page.tsx` | Pick storage/chip; shows device image + price | no |
| `/sell/condition` | `app/sell/condition/page.tsx` | Condition questions (from Supabase); sets `activeQuestions` | no |
| `/sell/quote` | `app/sell/quote/page.tsx` | Shows quote; **price blurred until phone login** (`PriceUnlockModal`) | login to reveal |
| `/sell/photos` | `app/sell/photos/page.tsx` | Optional photo upload (Supabase Storage) | no |
| `/sell/checkout` | `app/sell/checkout/page.tsx` | Address/slot/payment; **inline login if needed**; submits enquiry | login to submit |
| `/sell/confirm` | `app/sell/confirm/page.tsx` | Success + ENQ number | — |
| `/track` | `app/track/page.tsx` | Search any order by ENQ id; show live status | yes (AuthGate) |
| `/account/*` | `app/account/*` | Profile, settings, referral | yes |
| `/admin` | `app/admin/*` | Dashboard, enquiries, orders, products, questions | role=admin |
| `/legal/*` | `app/legal/*` | Privacy / Terms | no |
| **API** | | | |
| `POST /api/enquiry` | `app/api/enquiry/route.ts` | Create enquiry (service role; rate-limited) | — |
| `GET /api/enquiry/status` | `app/api/enquiry/status/route.ts` | Look up order status by `?id=` or `?ref=ENQ-x` (service role) | — |
| `GET /api/export` | `app/api/export/route.ts` | CSV export of enquiries (admin only) | role=admin |

Every top-level route also has a `loading.tsx` skeleton.

---

## 6. Components

| Folder | Key components | Role |
|---|---|---|
| `components/shared/` | `AppChrome` (header/footer/bottomnav switcher), `SiteHeader` (nav + scroll-spy), `Footer`, `Providers` (Query + toaster), `RouteProgress` (top loading bar), `AuthForm` (login/signup tabs), `AuthGate` (redirect guard), `PriceUnlockModal` (price gate), `SectionHeading`, `FlowHeader`, `StickyBar`, `CartBar`, `DeviceVisual`, `Logo` | App chrome + auth + shared UI |
| `components/marketing/` | `ModelSelector` (search/filter grid, TanStack Query), `ModelCard` (device card w/ image), `HowItWorks` (illustrated steps, blue), `WhyUs` (comparison layout, blue), `AndroidBuyback` (bento asymmetric cards, light mode) | Home marketing sections |
| `components/sell/` | `QuestionBody` (renders single/multi/matrix questions), `PhotoUploader` | Sell flow |
| `components/track/` | `OrderCard`, `StatusTimeline` | Tracking UI |
| `components/admin/` | `AdminShell`, `EnquiryRow` | Admin UI |
| `components/ui/` | Primitives: `Button`, `Input`, `Card`, `Badge`, `Modal`, `Sheet`, `BottomSheet`, `Accordion`, `Stepper`, `Progress`, `Skeleton`, `Stars`, `Selectable`, `Toggle`, `EmptyState`, `StatusChip`, `Toaster`, `ConfirmDialog` | Design-system primitives |

---

## 7. lib/ (logic)

| File | Purpose |
|---|---|
| `lib/store.ts` | **Zustand store** — single source of client state: `user`, sell-flow state, `enquiry`, plus all actions. |
| `lib/data.ts` | Local seed/fallback data: `MODELS`, `MACBOOK_MODELS`, `QUESTIONS`, `MAC_QUESTIONS`, `SERIES`, `MAC_SERIES`, `SLOTS`, `EXECUTIVES`, `TRACK_STEPS`, `REVIEWS`, `FAQS`, `STATS`, `getModel()`. |
| `lib/deviceImages.ts` | `getDeviceImage(model)` → Apple CDN product image URL. Resolves by id, slug or name. |
| `lib/quote.ts` | `calcQuote(base, answers, questions)` — base price × condition factors → final. |
| `lib/adminQueries.ts` | TanStack Query fns + keys for Supabase reads/writes. |
| `lib/supabase/client.ts` | Browser Supabase client (`@supabase/ssr` `createBrowserClient`). |
| `lib/supabase/server.ts` | Server clients: `createServerClient`/`createRouteClient` (cookie-aware) + `createServiceClient` (service role). |
| `lib/auth.ts` | Supabase auth helpers: `signInWithGoogle`, `sendPhoneOtp`, `verifyPhoneOtp`, `signInWithEmail`, `signUpWithEmail`. |
| `lib/utils.ts` | Core helper utilities including Tailwind-merge font size override configurations. |
| `lib/email.ts` | Resend email senders (admin notification + customer confirmation). |
| `lib/motion.ts` | framer-motion variants (`fadeUp`, `staggerContainer`). |
| `lib/types.ts` | All TypeScript interfaces (`Model`, `Question`, `Enquiry`, `Quote`, `User`, …). |
| `lib/toast.ts` | Toast helper. |

---

## 8. Database (Supabase Postgres)

Migrations in `supabase/migrations/` (run in order 001→006, then `seed.sql`). See `MIGRATIONS.md`.

| Table | Purpose / key columns |
|---|---|
| `profiles` | One row per auth user. `id` (uuid, = auth.users.id), `full_name`, `phone`, `email`, `role` (`customer`/`admin`). Auto-created by `handle_new_user` trigger. |
| `models` | Devices. `id` (uuid), `slug` (e.g. `iphone-12-pro`), `name`, `category` (`iphone`/`macbook`), `series`, `chips`, `storages` (jsonb), `is_active`, `sort_order`. |
| `questions` | Condition quiz. `order_index`, `category` (`iphone`/`macbook`/`all`), `type` (`single`/`multi`/`matrix`), `question_text`, `hint_text`, `options` (jsonb), `matrix_items` (jsonb), `exclusive_option`, `is_active`. |
| `enquiries` | Sell requests. `id` (uuid), `display_id` (`ENQ-00001`, sequential), `user_id` (nullable for guests), `devices` (jsonb array), `total_amount`, `address`, `pincode`, `pickup_slot`, `payment_mode`, `status` (`pending`/`accepted`/…), `tracking_step` (0–4), `assigned_exec`, `internal_note`. |
| `enquiry_history` | Audit log per enquiry. `actor` (`customer`/`admin`), `action`, `created_at`. |
| `enquiry_photos` | Uploaded photo paths. `enquiry_id`, `slot`, `storage_path`. |
| `reviews` | Homepage reviews. `is_published`. |

**Storage:** private bucket `enquiry-photos`.
**RLS:** public read for models/questions/published reviews; users see own enquiries; admins see all; guest enquiries inserted via service role.

---

## 9. Auth model (hybrid)

There are **two coexisting systems**:

1. **Local demo auth (Zustand)** — what the seller flow uses today.
   - `login(identity, password)` / `signup(name, mobile, password)` / `phoneLogin(mobile)` just set `store.user`. No real password check. `PriceUnlockModal` uses `phoneLogin` to unlock the quote.
2. **Real Supabase auth** — used for **admin** and available for sellers.
   - Email/password via `signInWithPassword`. Admin = `profiles.role='admin'`.
   - `lib/auth.ts` also has Google OAuth + phone OTP ready (needs callback route + session-to-store bridge).

The app reads `useStore(s => s.user)` everywhere. `{ name, mobile, role: 'seller'|'admin' }`.

---

## 10. Environment variables (`.env.local`)

| Var | Public | Use |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✗ secret | Server-only; bypasses RLS (enquiry insert, status lookup) |
| `NEXT_PUBLIC_APP_URL` | ✓ | Base URL (SEO/OG/sitemap/emails) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ✓ | WhatsApp CTA number |
| `ADMIN_EMAIL` | ✗ | Receives enquiry email |
| `RESEND_API_KEY` | ✗ | Email (optional) |

`.env.local` is git-ignored — re-enter vars in Vercel for production.

---

## 11. Design system / conventions

- **Tokens:** colors/spacing/fontSizes are CSS variables in `app/globals.css`, mapped to Tailwind in `tailwind.config.ts`.
- **Primary text** is **brand navy** (`--text-primary: #0F2147`), not pure black. Big headings use a navy→blue gradient.
- **`cn()`** (lib/utils) merges classes; it's been extended so custom `text-{size}` classes don't clobber `text-{color}` (this fixed white button text).
- **Buttons:** `components/ui/Button.tsx` — variants `primary|secondary|outline|ghost|whatsapp|danger`, sizes `sm|md|lg`.
- **Images:** `next/image`; allowed remote hosts = Apple CDN + `*.supabase.co` (in `next.config.mjs`).

---

## 12. Current state

**Working & recently fixed:**
- Supabase connected, all migrations + seed applied; admin user created.
- Device images fixed (resolver by id/slug/name; all URLs 200; enlarged in cards).
- Sell flow: no login at product click; login gate is the `PriceUnlockModal` on the quote page + inline auth at checkout.
- Condition questions render (Supabase shape normalized) and quote uses the same `activeQuestions`.
- Enquiry submit works (fixed rate-limiter bug + service_role grants).
- Track: search by `ENQ-id` + Refresh fetch real status via `/api/enquiry/status`.
- Nav scroll-spy underline; blue theme throughout; HowItWorks + WhyUs sections rebuilt in blue.
- **TypeScript type checking passes cleanly (`npx tsc --noEmit` has 0 errors)**.
- Category catalog landing pages and individual model routes (/sell/iphone/[slug] and /sell/macbook/[slug]) are fully indexable and dynamic.
- Sitemap is fully dynamic and crawls all categories and active model slugs.

---

## 13. Other docs in this repo

| File | What it covers |
|---|---|
| `DEPLOY.md` | Vercel deployment (env vars, redirect configurations) |
| `AUTH_SETUP.md` | Add real Google login + mobile OTP |
| `MIGRATIONS.md` | DB migrations, table reference, common SQL |
| `BACKEND.md` | Supabase clients, API routes, RLS notes |
| `SETUP.md` | Local run/config/deploy basics |
| `FILE_MAP.md` | File-by-file map and "change X edit Y" reference |
| `STATE.md` | State/flow notes |
| `SEO.md` | SEO/metadata notes, sitemap and robots |
| `README.md` | Short intro |
