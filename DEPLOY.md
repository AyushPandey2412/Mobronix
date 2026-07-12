# DEPLOY.md — Deploying SellMyiPhone to Vercel

A complete, step-by-step guide to take this Next.js 15 app live on Vercel.
Follow the steps in order. Steps marked **⚠️ REQUIRED** will block the deploy if skipped.

---

## 0. What you're deploying

- **Framework:** Next.js 15 (App Router) — Vercel auto-detects this.
- **Database / Auth:** Supabase (already set up — project ref `tndbjposrliqshigmdvm`).
- **Email (optional):** Resend.
- **No `vercel.json` needed** — defaults are correct for Next.js.

---

## 1. ⚠️ REQUIRED — Make the production build pass

Vercel runs `next build`, which **type-checks and lints** the whole project.
This repo currently has **~40 pre-existing TypeScript errors** in 15 files
(admin pages, `lib/quote.ts`, `lib/store.ts`, `lib/email.ts`, sell pages, etc.).
They don't affect `next dev` (which doesn't type-check), but **they WILL fail the
Vercel build.** You have two options:

### Option A (fast — get it live now) — tell Next to not fail the build on these

Edit **`next.config.mjs`** and add `typescript` + `eslint` blocks:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ── Allow the production build to succeed despite pre-existing TS/ESLint issues.
  //    Remove these once the underlying errors are fixed (Option B).
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  // ...keep the existing images + headers config below unchanged...
};

export default nextConfig;
```

> This ships the app with the known type issues unresolved (the app still runs).
> It's the quickest path to a working deploy.

### Option B (proper — fix the errors)

Run `npx tsc --noEmit` locally, fix each reported error, until it's clean. Then you
don't need the ignore flags. (Ask and I can fix all 40 for you — it's mostly small
type-safety fixes like optional fields and a couple of undefined variables.)

**Verify locally before deploying:**
```bash
npm run build
```
If this completes without "Failed to compile", you're good to deploy.

---

## 2. ⚠️ REQUIRED — Environment variables

Your secrets live in `.env.local`, which is **git-ignored** (good — never commit it).
You must re-enter these in the **Vercel dashboard** (Project → Settings → Environment
Variables). Add each for the **Production** (and Preview) environment:

| Variable | Public? | Value / where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | public | `https://tndbjposrliqshigmdvm.supabase.co` (Supabase → Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | public | Supabase → Settings → API → anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | **secret** | Supabase → Settings → API → service_role/secret key. **Server-only — never expose.** |
| `NEXT_PUBLIC_APP_URL` | public | Your live URL, e.g. `https://your-app.vercel.app` (set after first deploy, see Step 6) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | public | Your WhatsApp number with country code, e.g. `919999999999` |
| `ADMIN_EMAIL` | secret | Email that receives enquiry notifications |
| `RESEND_API_KEY` | secret | Optional. Resend → API Keys (`re_...`). If blank, emails are silently skipped. |
| `GOOGLE_CLIENT_ID` | secret | Optional — only if you enable Google login (configured in Supabase, not here) |
| `GOOGLE_CLIENT_SECRET` | secret | Optional — same as above |

Notes:
- `NEXT_PUBLIC_*` vars are exposed to the browser (that's expected for the URL + anon key).
- `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`, `RESEND_API_KEY` are **server-only** — keep them secret.
- After changing any env var in Vercel, you must **redeploy** for it to take effect.

---

## 3. Supabase production setup

The current Supabase project is **already migrated and seeded**, so if you keep using it,
you can skip to 3c. If you create a **fresh** Supabase project for production, do all of 3.

### 3a. Run the migrations (only for a new project)
Supabase → SQL Editor → run these files in order from `supabase/migrations/`:
```
001_initial.sql
002_grants.sql
003_performance.sql
004_photo_upload_policy.sql
005_sequential_enq_number.sql
006_service_role_grants.sql   ← needed so guest enquiries can be inserted
supabase/seed.sql             ← loads 52 models, 26 questions, 6 reviews
```

### 3b. Storage
Migration 001 creates the private `enquiry-photos` bucket. No extra action needed.

### 3c. ⚠️ Auth redirect URLs (REQUIRED for login to work in production)
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://your-app.vercel.app`
- **Redirect URLs:** add `https://your-app.vercel.app/**`
  (and your custom domain if you add one).

If you use **Google login**: Supabase → Authentication → Providers → Google, and in the
Google Cloud Console add the Supabase callback URL to the OAuth client's authorized redirect URIs.

### 3d. Create your admin account
1. Sign up in the app (or Supabase → Authentication → Users → Invite).
2. Supabase → SQL Editor:
   ```sql
   UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
   ```
3. Sign in at `/login` with that email → you're redirected to `/admin`.

---

## 4. Push the code to GitHub

This folder is **not yet a git repo**. Vercel deploys from a Git repo (recommended) or
via the CLI (Step 5, Option 2).

```bash
cd merged_final
git init
git add .
git commit -m "Initial commit"
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

`.env.local` is git-ignored, so your secrets are **not** pushed — that's why you re-enter
them in Vercel (Step 2).

---

## 5. Deploy on Vercel

### Option 1 — Git import (recommended)
1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. **Framework Preset:** Next.js (auto-detected).
3. **Root Directory:** if your repo root *is* `merged_final`, leave as `./`. If you pushed
   the parent folder, set Root Directory to `merged_final`.
4. **Build & Output Settings:** leave defaults
   - Build command: `next build` (default)
   - Install command: `npm install` (default)
   - Output: `.next` (default)
5. Add **all environment variables** from Step 2.
6. Click **Deploy**.

### Option 2 — Vercel CLI
```bash
npm i -g vercel
cd merged_final
vercel            # follow prompts (first deploy = preview)
vercel --prod     # promote to production
```
Then add env vars in the dashboard and redeploy.

---

## 6. ⚠️ After the first deploy — set the real URL

1. Copy your live URL (e.g. `https://your-app.vercel.app`).
2. Vercel → Settings → Environment Variables → set **`NEXT_PUBLIC_APP_URL`** to that URL.
3. Supabase → Auth → URL Configuration → set **Site URL** + **Redirect URLs** to that URL (Step 3c).
4. **Redeploy** (Vercel → Deployments → ⋯ → Redeploy) so the new URL is baked in
   (it's used for SEO metadata, OG images, sitemap, and email links).

---

## 6b. ⚠️ OTP login + rate limiting (REQUIRED for a real deploy)

Checkout login uses a phone **OTP**. The OTP store and the rate limiters need a
**shared store** because Vercel runs many serverless instances (in-memory state
isn't shared). Without it, OTP verify and rate limits are unreliable in production.

### Step 1 — Upstash Redis (shared store)
1. Create a free database at **[console.upstash.com](https://console.upstash.com)** → Redis.
2. Open the DB → **REST API** → copy the URL + token into Vercel env:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `OTP_SECRET` — any long random string (used to hash stored OTP codes).

> **Tip:** the easiest way to get Upstash on Vercel is the **Vercel dashboard →
> Storage / Integrations → Upstash (Redis)** — connect it and the
> `UPSTASH_REDIS_REST_URL`/`TOKEN` (or `KV_REST_API_*`) env vars are added
> automatically. The code reads either name set.

### Step 2 — deploy NOW without SMS (preview mode)
Don't have an SMS provider yet? Set **`OTP_DEV_MODE=true`** in Vercel. The OTP is
then **shown on the checkout screen** (and returned by the API) instead of being
texted — so you can test the full login on the live site immediately.
**⚠️ Turn `OTP_DEV_MODE` off** (delete it or set `false`) the moment you configure
real SMS — while it's on, anyone can read the code, so it is not secure for real users.

You still need **Step 1 (Upstash)** even in preview mode, otherwise the
send-instance and verify-instance on Vercel won't share the code.

### Step 3 — a real SMS provider (later)
Set the env vars for **one** provider and remove `OTP_DEV_MODE`. If none is set
and preview mode is off, OTP codes only go to the server logs.

| Provider | Env vars | Notes |
|---|---|---|
| **Twilio** (global) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` (or `TWILIO_MESSAGING_SERVICE_SID`) | Easiest to start |
| **MSG91** (India) | `MSG91_AUTH_KEY`, `MSG91_SENDER_ID`, `MSG91_OTP_TEMPLATE_ID` | Needs **DLT** registration + a template containing `##OTP##` |
| **Fast2SMS** (India) | `FAST2SMS_API_KEY` | OTP route |

`SMS_COUNTRY_CODE` defaults to `91` (India). The code auto-detects the provider
from whichever env vars are present — no code change needed to switch providers.

> Local dev: leave all of the above blank. The OTP prints to your `npm run dev`
> terminal **and** shows in the checkout UI, so you can test without SMS.

---

## 7. Email (Resend) — optional

1. Create an account at [resend.com](https://resend.com), verify your sending domain.
2. Set `RESEND_API_KEY` and `ADMIN_EMAIL` in Vercel, redeploy.
3. Each enquiry then emails the admin + the customer. If `RESEND_API_KEY` is empty,
   the app skips emails silently and still works.

---

## 8. Custom domain (optional)

Vercel → Settings → Domains → add your domain and follow the DNS instructions.
Then repeat Step 6 with the custom domain (update `NEXT_PUBLIC_APP_URL` + Supabase URLs).

---

## 9. Post-deploy checklist

- [ ] Home page loads, model images show, prices load from Supabase.
- [ ] Pick a model → storage → condition questions → quote (price is non-zero).
- [ ] Login gate appears on the quote page; phone login reveals the price.
- [ ] Submit an enquiry → succeeds → confirm page shows an `ENQ-xxxxx` number.
- [ ] Track page: search that `ENQ-xxxxx` → shows the order; Refresh shows real status.
- [ ] Admin: sign in with your admin email → `/admin` dashboard loads.

---

## 10. Things already handled (no action needed)

- **Image domains:** `next.config.mjs` already whitelists Apple's CDN and Supabase Storage
  (`images.remotePatterns`), so `next/image` works in production.
- **Security headers:** `next.config.mjs` sets `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, and HSTS (production only).
- **Supabase clients:** use `@supabase/ssr` (Next 15-compatible async cookies).
- **`next dev --turbopack`** is only for local dev speed — it does **not** affect the Vercel build.

---

## 11. Security reminders

- Your `.env.local` with real keys is sitting in a `Downloads` folder. Before going live,
  consider **rotating** the Supabase keys (Supabase → Settings → API → roll keys) and the
  DB password, and store secrets only in Vercel.
- Never commit `.env.local` (it's already git-ignored).
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses all row-level security — it must only ever be
  used server-side (it already is, in the API routes).

---

### TL;DR (minimum to go live)
1. Add `typescript.ignoreBuildErrors` + `eslint.ignoreDuringBuilds` to `next.config.mjs` (Step 1A).
2. `git init` + push to GitHub.
3. Import on Vercel, add all env vars (Step 2), deploy.
4. Set `NEXT_PUBLIC_APP_URL` + Supabase redirect URLs to the live URL, redeploy.
5. Promote your admin user, run the checklist.
