# PRODUCTION_READINESS.md — The Brutal Audit

An honest, no-sugar assessment of what's wrong with this project and what it needs before
it's safe to run as a real business. Ordered by severity. **Read the 🔴 Critical section
before letting a single real customer near this.**

> TL;DR: This is a **good-looking prototype**, not a production app. The UI is solid. The
> **auth, pricing integrity, and security model are not real** — they're demo stubs that
> are trivially exploitable. Money and personal data are involved here, so those gaps are
> not "nice to fix later" — they're launch blockers.

---

## 🔴 CRITICAL — launch blockers (exploitable / data-integrity)

### C1. Seller "login" is fake — anyone is anyone
`lib/store.ts` `login()/signup()/phoneLogin()` just set a local Zustand `user`. **Any
password works**, phone numbers are **never verified**, and the "session" is just
localStorage a user can edit in devtools. There is no real seller identity.
- **Impact:** account spoofing, fake enquiries, no trust in "who" submitted anything.
- **Fix:** implement real Supabase auth (Google + phone OTP) per `AUTH_SETUP.md`. Remove
  the demo login paths.

### C2. Hardcoded admin backdoor: `admin` / `admin123`
`lib/store.ts` `login()` grants `role:'admin'` for `admin`/`admin123`, and
`app/admin/AdminAuthGate.tsx` honors that local role. **Anyone can open the admin
dashboard** by typing those credentials.
- **Impact:** total admin UI exposure.
- **Fix:** delete the demo-admin branch. Admin must be **only** a real Supabase user with
  `profiles.role='admin'`.

### C3. Admin is gated **client-side only**
`AdminAuthGate` is a `'use client'` component doing a `useEffect` redirect. The admin
pages, JS, and any embedded data are **shipped to every visitor**; the "gate" is cosmetic
and bypassable (disable JS, edit store, read the bundle).
- **Impact:** admin code/logic exposure; not real access control.
- **Fix:** enforce on the **server** — check the Supabase session + `role='admin'` in
  `middleware.ts` and/or a server component/layout, and 302 before rendering. Never rely on
  a client redirect for authorization.

### C4. The server trusts client-supplied prices
`POST /api/enquiry` accepts `devices[].base` and `devices[].final` from the request body
(Zod checks they're *numbers*, not that they're *correct*) and stores `total_amount =
sum(final)`. A user can `POST` `{ final: 999999 }` or `{ final: 1 }`.
- **Impact:** price tampering — fraudulent quotes/payout amounts. This is the single most
  dangerous bug for a buyback business.
- **Fix:** the server must **recompute** base + condition factors from the **DB** (`models`
  + `questions`) using the submitted answers, and ignore any client-provided price.

### C5. Order-status endpoint leaks data + is enumerable
`GET /api/enquiry/status?ref=ENQ-00012` uses the **service role** (bypasses RLS) and
matches by `display_id`, which is **sequential**. Anyone can loop `ENQ-00001…` and read
every order's model, storage, and amount.
- **Impact:** mass data scraping of customers' devices and payout amounts.
- **Fix:** require auth or a non-guessable token (e.g. return a random `tracking_token` at
  submit and look up by that), rate-limit, and never expose by sequential id.

### C6. Rate limiting is in-memory (useless on Vercel)
`app/api/enquiry/route.ts` keeps counts in a per-process `Map`. Vercel runs **many
serverless instances**, each with its own map, and they're recycled constantly. Effective
limit ≈ none.
- **Impact:** spam/abuse of enquiry creation and (if added) OTP SMS — which costs money.
- **Fix:** use a shared store — **Upstash Redis + `@upstash/ratelimit`** (or Vercel KV).

### C7. Secrets hygiene
The real `SUPABASE_SERVICE_ROLE_KEY` (full DB god-mode) and DB password have been handled
in plaintext, live in a `Downloads` folder, and were pasted around. The service role key
bypasses **all** RLS.
- **Fix:** **rotate** the Supabase keys + DB password now (Supabase → Settings → API → roll).
  Store secrets only in Vercel env. Treat the service role key like a root password.

### C8. `next build` is broken (~40 TypeScript errors)
15 files have type errors (`lib/quote.ts`, `lib/store.ts` `PhotoState`, `lib/email.ts`,
admin clients, `app/sitemap.ts` `legal_pages`, sell pages importing non-existent
`getModels`/`getQuestions`, etc.). `next dev` hides them; **Vercel will fail** unless you
fix them or set `ignoreBuildErrors` (which ships latent bugs).
- **Fix:** fix the errors (preferred) — they're mostly small and reveal real bugs (e.g. the
  sell pages import functions that don't exist).

---

## 🟠 HIGH — needed for a credible production launch

### H1. Zero automated tests
No unit, integration, or e2e tests anywhere. Every change is a guess. For a flow that
calculates money, this is reckless.
- **Fix:** Vitest for `calcQuote`/pricing, Playwright for the sell→submit→track flow.

### H2. No error monitoring / observability
No Sentry, no structured logging, no alerts. In production you'd be blind to crashes,
failed payments, failed emails, RLS errors.
- **Fix:** add Sentry (client + server), structured logs, uptime monitoring.

### H3. No bot/spam protection
Enquiry submission has no CAPTCHA/Turnstile. Combined with C6, it's an open spam funnel
(and future OTP = an open SMS-cost bomb).
- **Fix:** Cloudflare Turnstile / hCaptcha on submit + OTP; server-side verification.

### H4. Product images depend on Apple's CDN (fragile + legal)
`lib/deviceImages.ts` hotlinks `store.storeimages.cdn-apple.com`. Apple can change/kill
these URLs anytime (it already happened — 24 were dead), and **hotlinking Apple's imagery +
using "iPhone"/Apple trademarks commercially is a legal risk**.
- **Fix:** self-host your own/licensed device images; get trademark/usage right; add proper
  disclaimers. Don't build a business on someone else's CDN.

### H5. Weak security headers (no CSP)
`next.config.mjs` sets X-Frame-Options etc., but **no Content-Security-Policy**. XSS
surface is wide open for a site handling personal data.
- **Fix:** add a strict CSP (script-src, connect-src for Supabase, img-src for your CDN).

### H6. SEO is shallow for a "SEO-focused" buyback site
The model grid and per-model content render **client-side** (TanStack Query), so crawlers
may see empty shells. Dynamic model/landing pages aren't statically generated.
- **Fix:** server-render model/landing pages (RSC + generateStaticParams), structured data,
  real per-model pages. (See `SEO.md` — but it's aspirational vs. implemented.)

### H7. No CI/CD or quality gates
No GitHub Actions, no enforced typecheck/lint/test on PRs. Nothing stops broken code from
shipping (see C8).
- **Fix:** CI that runs `tsc`, `eslint`, tests, and `next build` on every push.

### H8. No real email/transactional reliability
Resend isn't configured; there's no retry/queue, no email verification, no delivery
tracking. Enquiry confirmations may silently never send.
- **Fix:** configure Resend, verify domain, add retries + logging, verify emails on signup.

### H9. Personal data, no privacy/compliance posture
You store names, **phone numbers, addresses, pincodes** — personal data under India's
**DPDP Act** (and GDPR if EU). There's no consent logging, data-retention, deletion, or DPA.
- **Fix:** consent capture, retention policy, "delete my data" path, privacy review.

---

## 🟡 MEDIUM — quality, scale, maintainability

| # | Problem | Fix |
|---|---|---|
| M1 | **Dead/duplicate code** — `components/AuthModal, TopNav, BottomNav, ModelList, HomeCatalog, CategoryTabs, ConditionQuestion, CustomerStories, Faq, SellWizard, Providers, ToastHost` are legacy/unused. Bloat + confusion. | Delete them. |
| M2 | **`lib/store.ts` is a god-object** (~470 lines, all state + actions + admin CRUD). | Split by domain (auth / sell / admin), or move server state fully to Supabase+Query. |
| M3 | **Heavy client bundles** — framer-motion on nearly every component; large hydration cost (root cause of the "slow page" feeling beyond dev-compile). | Lazy-load animations, prefer RSC, trim motion usage. |
| M4 | **No pagination/virtualization** in admin enquiries/products. Breaks at scale. | Paginate + index queries. |
| M5 | **No staging environment** — one Supabase project for everything; migrations run by hand against prod. | Separate dev/staging/prod projects; use Supabase CLI migrations in CI. |
| M6 | **No backups / DR plan.** | Enable Supabase PITR/backups; document restore. |
| M7 | **Admin writes lack server validation** — trust the client shapes. | Validate with Zod on the server for all admin mutations. |
| M8 | **`any` types + 40 TS errors** = weak type safety throughout. | Tighten types; enable `strict` everywhere; no `any`. |
| M9 | **No analytics** (conversion funnel, drop-off). For a sales funnel that's flying blind. | Add privacy-friendly analytics (Plausible/GA4). |
| M10 | **Accessibility unaudited** — color contrast, focus traps in modals, aria on custom controls. | Run axe/Lighthouse a11y; fix. |

---

## 🟢 LOW — polish

- **i18n:** Hindi is referenced (settings `language: 'HI'`) but not implemented.
- **Empty/error states:** mostly present; audit every async path for a fallback.
- **Mobile QA:** test the whole flow on real devices (sheets, sticky bars, keyboard).
- **Favicon/PWA/manifest:** add a web manifest + proper icons if you want installability.
- **Content:** stats ("12,400+ sold", "4.9★") are **made up** — don't publish false claims.
- **Consistent number/phone formatting & validation** across forms.

---

## ⚖️ Legal / business (don't skip)

- **Trademark & imagery:** using "iPhone"/Apple marks + Apple product photos commercially
  needs the right disclaimers and ideally counsel. (H4)
- **Fake testimonials/stats:** the reviews and stats are seed data. Publishing fabricated
  social proof is a legal/ethical problem (consumer-protection, ASCI in India).
- **DLT/SMS:** OTP SMS to Indian numbers requires TRAI DLT registration (see `AUTH_SETUP.md`).
- **Pricing claims:** "Best Price Guaranteed" is a binding claim — make sure you can honor it.
- **Terms/Privacy:** the legal pages exist but should be reviewed for your actual practices.

---

## What's actually GOOD (credit where due)

- Clean, modern, consistent **UI/design system** (tokens, components, blue theme).
- Sensible **DB schema + RLS** foundation, sequential ENQ numbers, audit history table.
- **App Router structure** is reasonable; server/client split mostly sane.
- **Supabase + Next 15** wiring (async cookies via `@supabase/ssr`) is correct.
- Image-resolution, quote-question alignment, and status-lookup bugs were fixed; the
  happy-path flow works end to end.

---

## Priority order (what I'd do, in order)

1. **C4** (price recompute server-side) and **C2/C3** (kill admin backdoor, enforce admin
   server-side) — these are actively dangerous.
2. **C1** real auth (Google + OTP) — removes the fake-login foundation.
3. **C8** fix the build; add **H7** CI to keep it fixed.
4. **C5/C6/H3** lock down the status endpoint + real rate limiting + bot protection.
5. **C7** rotate secrets.
6. **H1/H2** tests + monitoring so you can move safely after that.
7. Everything in 🟡 / 🟢 / ⚖️ as the product matures.

> Bottom line: the front-end is launch-quality; the **trust layer (auth, authorization,
> pricing integrity, abuse protection) is not built yet**. Treat this as ~60% of a real
> product — the remaining 40% is the unglamorous security/correctness work that actually
> makes it safe to take money and data.

---

# 🛠️ QUICK-FIX COOKBOOK (copy-paste)

Concrete, minimal fixes for the 🔴 Critical items. Time estimates are rough.

## C2 — Remove the admin backdoor  ·  ~2 min
In **`lib/store.ts`**, inside `login()`, **delete** the demo-admin branch:
```ts
// ❌ DELETE THIS:
if (id.toLowerCase() === "admin" && pwd === "admin123") {
  set({ user: { name: "Admin", mobile: "—", role: "admin" } });
  return { ok: true, role: "admin" };
}
```
Admin can now only come from a real Supabase user with `profiles.role='admin'`.

## C3 — Enforce admin on the server  ·  ~10 min
Make **`middleware.ts`** block `/admin/*` for non-admins (it already refreshes the session —
add the role check after `getUser()`):
```ts
// after: const { data: { user } } = await supabase.auth.getUser()
if (req.nextUrl.pathname.startsWith("/admin")) {
  if (!user) return NextResponse.redirect(new URL("/login", req.url));
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.redirect(new URL("/login", req.url));
}
return res;
```
Also set the matcher: `export const config = { matcher: ["/admin/:path*"] }` (already is).
Then the client `AdminAuthGate` becomes a nicety, not the only guard.

## C4 — Recompute price on the server  ·  ~30–45 min  ⭐ most important
**Stop trusting `base`/`final` from the browser.** Two levels:

**Level 1 — 5-min mitigation (sanity clamp):** in `POST /api/enquiry`, look up each device's
DB price and reject absurd values:
```ts
const svc = createServiceClient();
for (const d of parsed.devices) {
  const { data: m } = await svc.from("models")
    .select("storages").ilike("name", d.model).maybeSingle();
  const base = priceFromStorages(m?.storages, d.storage);   // helper: read flat/nested jsonb
  if (!base) return NextResponse.json({ error: "Unknown model/storage" }, { status: 400 });
  // condition factors only move price within ~0.2x–1.2x of base
  if (d.final < base * 0.2 || d.final > base * 1.2) {
    return NextResponse.json({ error: "Price mismatch" }, { status: 400 });
  }
}
```

**Level 2 — proper fix:** have the client send `slug` + the real `answers`, then the server
recomputes with the same engine and **ignores the client price**:
```ts
import { calcQuote } from "@/lib/quote";
// fetch model + active questions from DB, then:
const { final } = calcQuote(serverBase, device.answers, dbQuestions);
// store `final`, never the client's number.
```
(Requires `app/sell/checkout/page.tsx` to send `answers` + `slug` instead of `answers: {}`.)

## C5 — Stop the status-endpoint leak  ·  ~15 min
The fastest real fix: **only allow lookup by the unguessable UUID**, not the sequential
`ENQ-` id. In `app/api/enquiry/status/route.ts`, drop the `ref` branch (or gate it):
```ts
const id = url.searchParams.get("id");
if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
const { data } = await svc.from("enquiries")
  .select("...").eq("id", id).maybeSingle();
```
The owner has the UUID locally (Refresh already uses it). For public "track by ENQ number",
add a random `tracking_token uuid` column, return it at submit, and look up by that token
(+ rate-limit). Never expose data by sequential id.

## C6 — Real rate limiting  ·  ~20 min
```bash
npm i @upstash/ratelimit @upstash/redis
```
Create an Upstash Redis DB (free), add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
to env, then in `app/api/enquiry/route.ts` replace the in-memory limiter:
```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "60 s"),
});
// in POST:
const { success } = await ratelimit.limit(ip);
if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
```

## C7 — Rotate secrets  ·  ~10 min
Supabase → **Settings → API → Roll** the `service_role` (and anon) keys, and **Settings →
Database → reset password**. Update the new values **only** in Vercel env (and your local
`.env.local`). Never commit them.

## C8 — Make the build pass  ·  fast vs. proper
- **Fast (~2 min, ships latent bugs):** add to `next.config.mjs`
  ```ts
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  ```
- **Proper (~1–2 h):** run `npx tsc --noEmit`, fix each error. Several are real bugs (e.g.
  `app/sell/iphone/page.tsx` imports `getModels`/`getQuestions` that don't exist).

## C1 — Real auth (Google + OTP)  ·  ~half day
Follow **`AUTH_SETUP.md`** end to end (callback route + `AuthSync` session→store bridge +
wire the UI), then delete the demo `login/signup/phoneLogin` paths in `lib/store.ts`.

---

### Suggested 1-day hardening sprint
1. C2 (2m) → C3 (10m) → C8 fast (2m) so you can build/deploy.
2. C4 Level-1 clamp (5–10m) → C5 id-only (15m) → C6 Upstash (20m).
3. C7 rotate keys (10m).
4. Then schedule C1 (real auth) + C4 Level-2 + tests/monitoring as the next sprint.

> Want these applied for real? I can do **C2, C3, C5, C8-fast, and C4 Level-1** right now in
> code (they're contained and low-risk); C1/C6 need your Supabase/Upstash dashboard setup.
