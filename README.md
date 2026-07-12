# SellMyiPhone

A production **Next.js 14** app for a used iPhone & MacBook resale business serving **Mumbai, Navi Mumbai & Thane**. Customers get an instant condition-based quote, schedule a free doorstep pickup, and get paid by UPI/cash on inspection.

**Stack:** Next.js 14 (App Router, TypeScript strict) · Tailwind · Supabase (Postgres, Auth, Storage, Realtime, RLS) · TanStack Query · Zod · React Hook Form · Resend · Vercel.

## Quick start

```bash
npm install
cp .env.local .env.local   # fill in real keys (see SETUP.md)
# run supabase/migrations/001_initial.sql then supabase/seed.sql in Supabase SQL Editor
npm run dev
```

Open <http://localhost:3000>. Full, non-developer-friendly instructions are in **`SETUP.md`**.

## Docs

- **`SETUP.md`** — step-by-step setup + a common-errors fix table (written for non-developers).
- **`PROJECT_INDEX.md`** — file-by-file map and "I want to change X → edit this file" guide.
- **`SEO.md`** — SEO strategy, structured-data inventory, and verification checklist.

## What's inside

- **Home** — Cashify-style marketing page: hero, How It Works, iPhone/MacBook catalog (list layout), Why Sell, tips, Customer Stories, FAQ. Brand green `#16A34A`.
- **Sell flow** — guest-browsable wizard; login wall appears only at the quiz end (Google / Phone OTP / Email). MacBook adds variant → chip → RAM steps. Real photo upload to Supabase Storage.
- **Track** — search by enquiry ID or phone, realtime stepper, edit pickup, cancel with reason, post-pickup rating.
- **Account** — Account / Settings / Referral sub-tabs.
- **Admin** — dashboard (stats, pipeline, 7-day chart, filterable list, bulk actions, CSV), order detail (status/step controls, condition grid, WhatsApp milestone buttons, history), product & question CRUD.
- **SEO** — indexable per-model landing pages, sitemap, robots, JSON-LD (Product, BreadcrumbList, FAQPage, Organization).

See `PROJECT_INDEX.md` for the notes on a couple of intentional deviations from the original spec (MacBook 32-vs-35 count; a few helper components inlined rather than split into separate files).
