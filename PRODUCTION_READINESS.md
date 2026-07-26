# PRODUCTION_READINESS.md — The Brutal Audit

An honest assessment of what the project needs before it's safe to run as a real business. Ordered by severity. **Read the 🔴 Critical section before letting a single real customer near this.**

> TL;DR: This is a **good-looking prototype**, not a production app. The UI is solid. The **auth, pricing integrity, and security model need hardening** before going live. Money and personal data are involved here, so those gaps are launch blockers.

---

## 🔴 CRITICAL — launch blockers (exploitable / data-integrity)

### C1. Seller "login" is fake — anyone is anyone
`lib/store.ts` `login()/signup()/phoneLogin()` just set a local Zustand `user`. Phone numbers are **never verified**, and the "session" is just localStorage a user can edit in devtools. There is no real seller identity.
- **Impact:** account spoofing, fake enquiries, no trust in "who" submitted anything.
- **Fix:** implement real Supabase auth (Google + phone OTP) per `AUTH_SETUP.md`. Remove the demo login paths.

### C2. Hardcoded admin backdoor: `admin` / `admin123`
`lib/store.ts` `login()` grants `role:'admin'` for `admin`/`admin123`, and `app/admin/AdminAuthGate.tsx` honors that local role.
- **Impact:** admin UI exposure.
- **Fix:** delete the demo-admin branch. Admin must be **only** a real Supabase user with `profiles.role='admin'`.

### C3. Admin is gated **client-side only**
`AdminAuthGate` is a `'use client'` component doing a redirect.
- **Impact:** admin code/logic exposure; not real access control.
- **Fix:** enforce on the **server** — check the Supabase session + `role='admin'` in `middleware.ts` and/or a server component/layout, and redirect before rendering.

### C4. The server trusts client-supplied prices
`POST /api/enquiry` accepts `devices[].base` and `devices[].final` from the request body and stores `total_amount = sum(final)`. A user can `POST` `{ final: 999999 }` or `{ final: 1 }`.
- **Impact:** price tampering — fraudulent quotes/payout amounts. This is the single most dangerous bug for a buyback business.
- **Fix:** the server must **recompute** base + condition factors from the **DB** (`models` + `questions`) using the submitted answers, and ignore any client-provided price.

### C5. Order-status endpoint leaks data + is enumerable
`GET /api/enquiry/status?ref=ENQ-00012` uses the **service role** (bypasses RLS) and matches by `display_id`, which is **sequential**.
- **Impact:** mass data scraping of customers' devices and payout amounts.
- **Fix:** require auth or a non-guessable token (e.g. return a random `tracking_token` at submit and look up by that), rate-limit, and never expose by sequential id.

### C6. Rate limiting is in-memory (useless on Vercel)
`app/api/enquiry/route.ts` keeps counts in a per-process `Map`. Vercel runs **many serverless instances**, each with its own map, and they're recycled constantly.
- **Impact:** spam/abuse of enquiry creation and OTP SMS costs.
- **Fix:** use a shared store — **Upstash Redis + `@upstash/ratelimit`** (or Vercel KV).

### C7. Secrets hygiene
The real `SUPABASE_SERVICE_ROLE_KEY` (full DB god-mode) and DB password should be stored securely.
- **Fix:** Store secrets only in Vercel env. Treat the service role key like a root password.

### C8. Build Status
- **TypeScript build checks pass cleanly (`npx tsc --noEmit` returns 0 errors)**. No errors remain.

---

## 🟠 HIGH — needed for a credible production launch

### H1. Zero automated tests
No unit, integration, or e2e tests.
- **Fix:** Vitest for `calcQuote`/pricing, Playwright for the sell→submit→track flow.

### H2. No error monitoring / observability
No Sentry, no structured logging, no alerts.
- **Fix:** add Sentry (client + server), structured logs, uptime monitoring.

### H3. No bot/spam protection
Enquiry submission has no CAPTCHA/Turnstile.
- **Fix:** Cloudflare Turnstile / hCaptcha on submit + OTP; server-side verification.

### H4. Product images depend on Apple's CDN
`lib/deviceImages.ts` hotlinks `store.storeimages.cdn-apple.com`. Apple can change/kill these URLs.
- **Fix:** self-host your own/licensed device images.

### H5. Weak security headers (no CSP)
No Content-Security-Policy set in headers.
- **Fix:** add a strict CSP.

### H6. Email (Resend) transactional reliability
- **Fix:** configure Resend, verify domain, add retrying + logging.

### H7. Personal data, compliance posture
You store names, phone numbers, addresses, pincodes under India's **DPDP Act**.
- **Fix:** consent capture, retention policy, "delete my data" path.

---

## 🟡 MEDIUM — quality, scale, maintainability

| # | Problem | Fix |
|---|---|---|
| M1 | **Dead/duplicate code** — legacy components `AuthModal, TopNav, BottomNav, ModelList, HomeCatalog, CategoryTabs, ConditionQuestion, CustomerStories, Faq, SellWizard, Providers, ToastHost`. | Delete them. |
| M2 | **`lib/store.ts` is a god-object** (~470 lines). | Split by domain. |
| M3 | **Heavy client bundles** — framer-motion on nearly every component. | Lazy-load animations. |
| M4 | **No pagination/virtualization** in admin enquiries/products. | Paginate + index queries. |
| M5 | **No staging environment** — one Supabase project. | Separate dev/staging/prod projects. |
| M6 | **No backups / DR plan.** | Enable Supabase backups. |
| M7 | **Admin writes lack server validation** — trust client shapes. | Validate with Zod on the server. |
| M8 | **No analytics** (conversion funnel, drop-off). | Add privacy-friendly analytics. |
| M9 | **Accessibility unaudited.** | Run axe/Lighthouse a11y. |

---

## 🟢 LOW — polish

- **i18n:** Hindi is referenced but not implemented.
- **Empty/error states:** audit async paths for fallback screens.
- **Favicon/PWA/manifest:** add web manifest files.
- **Content:** stats are seed data.

---

## ⚖️ Legal / business (don't skip)

- **Trademark & imagery:** using Apple marks commercially needs proper disclaimers.
- **DLT/SMS:** OTP SMS to Indian numbers requires TRAI DLT registration (see `AUTH_SETUP.md`).
- **Terms/Privacy:** legal pages should be reviewed for compliance.

---

## What's actually GOOD

- Clean, modern, consistent **UI/design system** (tokens, components, blue theme).
- Sensible **DB schema + RLS** foundation, sequential ENQ numbers, audit history table.
- **App Router structure** is reasonable; server/client split mostly sane.
- **Supabase + Next 14** wiring is correct.
