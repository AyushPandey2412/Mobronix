# PROJECT_INDEX.md — Developer Reference Index

A map of which file controls which behavior, so you (or a future session) can find things fast.

## Directory map

```
sellmyiphone/
├── app/
│   ├── layout.tsx                 Root layout: fonts, metadata defaults, TopNav/BottomNav, providers
│   ├── page.tsx                   Home: hero, How It Works, catalog, Why Sell, tips, stories, FAQ, footer, JSON-LD
│   ├── globals.css                Tailwind entry + fade-in animation
│   ├── robots.ts                  robots.txt (disallow admin/account/wizard; link sitemap)
│   ├── sitemap.ts                 sitemap.xml (home + track + all model landing pages)
│   ├── sell/
│   │   ├── page.tsx               Category chooser (noindex); routes to iphone/macbook
│   │   ├── iphone/page.tsx        iPhone wizard host (noindex) — renders <SellWizard>
│   │   ├── iphone/[slug]/page.tsx INDEXABLE iPhone model landing page (SEO)
│   │   ├── macbook/page.tsx       MacBook wizard host (noindex)
│   │   └── macbook/[slug]/page.tsx INDEXABLE MacBook model landing page (SEO)
│   ├── track/
│   │   ├── page.tsx               Track wrapper (noindex)
│   │   └── TrackClient.tsx        Search, realtime stepper, edit pickup, cancel, rating
│   ├── account/
│   │   ├── page.tsx               Account wrapper (noindex)
│   │   └── AccountClient.tsx      Account / Settings / Referral sub-tabs
│   ├── admin/
│   │   ├── layout.tsx             Server auth + role guard; sidebar shell
│   │   ├── AdminNav.tsx           Sidebar / mobile nav links
│   │   ├── page.tsx               Dashboard data fetch (server)
│   │   ├── Dashboard.tsx          Stat cards, pipeline, 7-day SVG chart, filterable list, bulk actions, CSV
│   │   ├── login/page.tsx         Admin email/password login (no Google/OTP)
│   │   ├── orders/[id]/page.tsx   Enquiry detail fetch (server)
│   │   ├── orders/[id]/OrderDetail.tsx  Status/step controls, condition grid, WhatsApp, history, delete
│   │   ├── products/page.tsx + ProductsClient.tsx  Model CRUD (iPhone flat / MacBook nested matrix)
│   │   └── questions/page.tsx + QuestionsClient.tsx Question CRUD (single/multi; matrix view-only)
│   └── api/
│       ├── enquiry/route.ts       POST: validate, insert enquiry + photos + history, send emails
│       └── export/route.ts        GET: admin-only CSV stream of enquiries
│
├── components/
│   ├── Providers.tsx              TanStack Query provider
│   ├── ToastHost.tsx              Toast context (useToast)
│   ├── TopNav.tsx / BottomNav.tsx Responsive navigation (top ≥1280px, bottom <1280px)
│   ├── AuthModal.tsx              3-provider auth gate (Google / Phone OTP / Email)
│   ├── CategoryTabs.tsx           iPhone / MacBook switcher
│   ├── ModelList.tsx              Cashify-style list rows with "Get Upto" price + Sell Now
│   ├── HomeCatalog.tsx            Category tabs + series chips + search wrapping ModelList
│   ├── ConditionQuestion.tsx      Renders single / multi / matrix questions
│   ├── SellWizard.tsx             Full step machine (model→…→quote→photos→checkout→confirm)
│   ├── CustomerStories.tsx        Dark navy review carousel
│   ├── Faq.tsx                    FAQ accordion
│   ├── ModelLanding.tsx           Shared body + metadata/params for SEO landing pages
│   └── ui/                        Button, Card, Input, StatusChip, Skeleton, BottomSheet, ConfirmDialog
│
├── lib/
│   ├── types.ts                   All shared TypeScript types + TRACKING_STEPS
│   ├── pricing.ts                 getBasePrice(), calcQuote(), getMaxPrice(), factor formatting
│   ├── data.ts                    Server read helpers (models, questions, reviews)
│   ├── auth.ts                    Client auth helpers (Google/OTP/email)
│   ├── email.ts                   Resend templates (admin/customer/status)
│   ├── format.ts                  inr(), storageRange()
│   ├── clsx.ts                    classnames helper
│   └── supabase/client.ts, server.ts  Browser / server / service-role Supabase clients
│
├── middleware.ts                  Protects /admin/* (session + admin role)
├── supabase/migrations/001_initial.sql  Schema, triggers, RLS, storage bucket
├── supabase/seed.sql              20 iPhones + 32 MacBooks + 26 quiz questions + reviews
├── tailwind.config.ts             Design tokens (colors, fonts, radius)
├── .env.local                     Secrets template
└── SEO.md / SETUP.md / PROJECT_INDEX.md  Docs
```

## "I want to change X" → where to go

| I want to… | Edit this |
|---|---|
| **Change a model's price** | Live app: `/admin/products` (writes `models.storages`). Fresh DB only: `supabase/seed.sql`. *Editing the seed only affects a brand-new database; the admin UI changes a live/deployed one.* |
| **Change how a condition factor affects price** | Live: `/admin/questions` (writes `questions.options` / `matrix_items`). Fresh DB: `supabase/seed.sql`. |
| **Change the pricing formula/math** | `lib/pricing.ts` — `calcQuote()` and `getBasePrice()`. This is the **only** place the multiply/round logic lives. |
| **Add a new iPhone or MacBook model** | `/admin/products` (live) or `supabase/seed.sql` (fresh installs). |
| **Add / edit / reorder a quiz question** | `/admin/questions` (live) or `supabase/seed.sql`. Matrix questions are view-only in the UI (v1.1). |
| **Change colors / fonts / design tokens** | `tailwind.config.ts` (sourced from the prototype's CSS custom properties). |
| **Change the home page layout/sections** | `app/page.tsx` + the relevant files in `components/`. |
| **Change the sell flow / wizard steps** | `components/SellWizard.tsx` (hosted by `app/sell/iphone/page.tsx`, `app/sell/macbook/page.tsx`). |
| **Change email templates** | `lib/email.ts`. |
| **Change what happens on enquiry submit** | `app/api/enquiry/route.ts`. |
| **Change admin order statuses / tracking steps** | `app/admin/orders/[id]/OrderDetail.tsx` and the `status` / `tracking_step` CHECK constraints in `supabase/migrations/001_initial.sql`. |
| **Change login / auth behavior** | `components/AuthModal.tsx` + `lib/auth.ts` (customer Google/OTP/email); `middleware.ts` (admin route protection); `app/admin/login/page.tsx` (admin email/password). |
| **Change SEO metadata / sitemap** | Per-page `metadata` / `generateMetadata`; `app/sitemap.ts`; `app/robots.ts`; landing body in `components/ModelLanding.tsx` (cross-ref `SEO.md`). |
| **Change database structure (add a column/table)** | Add a **new** file in `supabase/migrations/` (e.g. `002_*.sql`). **Never edit `001_initial.sql` after it has run against a real database** — applied migrations must stay immutable so environments don't drift; add a new migration instead. |

## Notes / deviations from the master prompt

- **MacBook count:** the prompt says "all 35 models" but enumerates **32** distinct entries; the seed contains those 32. Add the remaining configs via `/admin/products` or a new seed entry if the full 35 list is supplied.
- **Inlined components:** `PhotoCarousel`, `OrderCard`, `StatusTimeline`, `AdminTable`, and `QuoteForm` from the prompt's tree were implemented inline within `SellWizard.tsx`, `TrackClient.tsx`, and `Dashboard.tsx` rather than as separate files. Functionality is complete; only the file boundaries differ.
- Keep this index updated when you add new files.
