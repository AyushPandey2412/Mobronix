# PROJECT_INDEX.md — Developer Reference Index

A map of which file controls which behavior, so you (or a future session) can find things fast.

## Directory map

```
merged_final/
├── app/
│   ├── layout.tsx                 Root layout: fonts, metadata defaults, SiteHeader/Footer, providers
│   ├── page.tsx                   Home: server entry, pre-fetches models, sets metadata
│   ├── _components/
│   │   └── HomePageClient.tsx     Home layout: hero, How It Works, Why Us, reviews, FAQ, bento box
│   ├── globals.css                Tailwind entry, custom scroll paddings, and utility styles
│   ├── robots.ts                  robots.txt (disallow admin/account/wizard/manual; link sitemap)
│   ├── sitemap.ts                 sitemap.xml (dynamic home, category grids, and all active model pages)
│   ├── sell/
│   │   ├── layout.tsx             Sell flow container wrapper
│   │   ├── iphone/page.tsx        iPhone category page listing all iPhone models
│   │   ├── iphone/[slug]/page.tsx INDEXABLE iPhone model landing page (SEO)
│   │   ├── macbook/page.tsx       MacBook category page listing all MacBook models
│   │   ├── macbook/[slug]/page.tsx INDEXABLE MacBook model landing page (SEO)
│   │   ├── storage/page.tsx       Pick storage/chip; shows device image + price
│   │   ├── condition/page.tsx     Condition questions (from Supabase); sets activeQuestions
│   │   ├── quote/page.tsx         Shows quote; price blurred until phone login (PriceUnlockModal)
│   │   ├── photos/page.tsx        Optional photo upload (Supabase Storage)
│   │   ├── checkout/page.tsx      Address/slot/payment; inline login if needed; submits enquiry
│   │   └── confirm/page.tsx       Success page rendering sequential ENQ-xxxxx display IDs
│   ├── track/
│   │   └── page.tsx               Search any order by ENQ id; show live status
│   ├── account/
│   │   ├── layout.tsx             Wraps seller pages with AuthGate
│   │   ├── page.tsx               Profile view, name, mobile, logout
│   │   ├── settings/page.tsx      Notification and language toggles
│   │   └── referral/page.tsx      Referral link and code display
│   ├── admin/
│   │   ├── layout.tsx             Server auth + role guard; sidebar shell
│   │   ├── AdminNav.tsx           Sidebar / mobile nav links
│   │   ├── page.tsx               Dashboard page entry
│   │   ├── Dashboard.tsx          Stat cards, pipeline, 7-day SVG chart, filterable list, bulk actions, CSV
│   │   ├── login/page.tsx         Admin email/password login
│   │   ├── orders/[id]/page.tsx   Enquiry detail fetch (server)
│   │   ├── orders/[id]/OrderDetail.tsx  Status/step controls, condition grid, WhatsApp, history, delete
│   │   ├── products/page.tsx + ProductsClient.tsx  Model CRUD (iPhone flat / MacBook nested matrix)
│   │   └── questions/page.tsx + QuestionsClient.tsx Question CRUD (single/multi; matrix view-only)
│   └── api/
│       ├── enquiry/route.ts       POST: validate, insert enquiry + photos + history, send emails
│       └── export/route.ts        GET: admin-only CSV stream of enquiries
│
├── components/
│   ├── shared/
│   │   ├── AppChrome.tsx          Decides which headers/footers to render based on route path
│   │   ├── SiteHeader.tsx         Sticky header navigation controls
│   │   ├── Footer.tsx             Dark-themed footer with contact details
│   │   ├── Providers.tsx          React Query client provider + toast notifications provider
│   │   ├── RouteProgress.tsx      Linear loading bar for page transitions
│   │   ├── AuthForm.tsx           Sign-in and sign-up form components
│   │   ├── AuthGate.tsx           Client-side route redirection guard
│   │   └── PriceUnlockModal.tsx   Phone verification popup to unlock quote pricing
│   ├── marketing/
│   │   ├── ModelSelector.tsx      Browse categories and search active models
│   │   ├── ModelCard.tsx          Renders individual device details with dynamic zoom ratios
│   │   ├── HowItWorks.tsx         Illustrated steps section
│   │   ├── WhyUs.tsx              Platform benefits comparison section
│   │   └── AndroidBuyback.tsx     Bento asymmetry bento grid for Android custom quotes
│   ├── sell/
│   │   ├── QuestionBody.tsx       Renders quiz components based on question structure
│   │   └── PhotoUploader.tsx      Drag-and-drop photos upload box
│   ├── track/
│   │   ├── OrderCard.tsx          Mini summary details of specific orders
│   │   └── StatusTimeline.tsx     Timeline indicator matching order steps
│   ├── ModelLanding.tsx           Body rendering wrapper for dynamic model landing pages
│   └── ui/                        Button, Card, Input, StatusChip, Skeleton, BottomSheet, ConfirmDialog
│
├── lib/
│   ├── types.ts                   All shared TypeScript types + TRACKING_STEPS
│   ├── pricing.ts                 formatFactorDelta()
│   ├── quote.ts                   calcQuote(), quoteGrade()
│   ├── data.ts                    Local fallback fallback arrays: MODELS, MACBOOK_MODELS, QUESTIONS
│   ├── deviceImages.ts            getDeviceImage() Apple CDN image routing
│   ├── auth.ts                    Client auth helper integrations
│   ├── email.ts                   Resend notification templates
│   ├── format.ts                  inr() currency and storage range formatters
│   └── supabase/client.ts, server.ts  Browser / server / service-role Supabase clients
│
├── middleware.ts                  Refreshes Supabase session cookie on /admin/* paths
├── supabase/migrations/001_initial.sql  Schema, triggers, RLS, storage bucket
├── supabase/seed.sql              20 iPhones + 32 MacBooks + 26 quiz questions + reviews
├── tailwind.config.ts             Design tokens (colors, fonts, radius)
├── .env.local                     Secrets template
└── SEO.md / SETUP.md / PROJECT_CONTEXT.md  Docs
```

## "I want to change X" → where to go

| I want to… | Edit this |
|---|---|
| **Change a model's price** | Live app: `/admin/products` (writes `models.storages`). Fresh DB only: `supabase/seed.sql`. |
| **Change how a condition factor affects price** | Live: `/admin/questions` (writes `questions.options` / `matrix_items`). Fresh DB: `supabase/seed.sql`. |
| **Change the pricing formula/math** | `lib/quote.ts` — `calcQuote()`. This is the **only** place the multiply/round logic lives. |
| **Add a new iPhone or MacBook model** | `/admin/products` (live) or `supabase/seed.sql` (fresh installs). |
| **Add / edit / reorder a quiz question** | `/admin/questions` (live) or `supabase/seed.sql`. |
| **Change colors / fonts / design tokens** | `app/globals.css` and `tailwind.config.ts`. |
| **Change the home page layout/sections** | `app/_components/HomePageClient.tsx` + the relevant components in `components/marketing/`. |
| **Change the sell flow / wizard steps** | Individual pages inside `app/sell/` (e.g. `storage/page.tsx`, `condition/page.tsx`, `quote/page.tsx`, `checkout/page.tsx`). |
| **Change email templates** | `lib/email.ts`. |
| **Change what happens on enquiry submit** | `app/api/enquiry/route.ts`. |
| **Change admin order statuses / tracking steps** | `app/admin/orders/[id]/OrderDetail.tsx` and check constraints in `supabase/migrations/001_initial.sql`. |
| **Change login / auth behavior** | `components/shared/AuthForm.tsx` + `lib/auth.ts` (customer Google/OTP/email); `middleware.ts` (admin cookie refresh); `app/login/page.tsx`. |
| **Change SEO metadata / sitemap** | Per-page `metadata` / `generateMetadata`; `app/sitemap.ts`; `app/robots.ts`; landing body in `components/ModelLanding.tsx` (cross-ref `SEO.md`). |
| **Change database structure (add a column/table)** | Add a **new** file in `supabase/migrations/` (e.g. `007_*.sql`). **Never edit older migrations after they have run against a real database.** |

## Notes / deviations from the master prompt

- **MacBook count:** the seed contains 32 configured MacBooks. Add the remaining configs via `/admin/products` or seed files if needed.
- **Multi-page Wizard:** Replaced single-page `SellWizard` with separate page routes (`/sell/storage`, `/sell/condition`, etc.) to improve sitemap routing, indexing, state separation, and overall performance.
