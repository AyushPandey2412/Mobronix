# BACKEND.md — Supabase + API guide

Everything about how the backend works, which client to use where, and how to change things.

---

## Table of contents

1. [Architecture overview](#1-architecture-overview)
2. [Supabase clients — which one to use](#2-supabase-clients)
3. [Authentication flow](#3-authentication-flow)
4. [API routes](#4-api-routes)
5. [Row level security](#5-row-level-security)
6. [Rate limiting](#6-rate-limiting)
7. [Email (Resend)](#7-email)
8. [Supabase Storage — photos](#8-supabase-storage)
9. [Environment variables](#9-environment-variables)
10. [Common changes](#10-common-changes)

---

## 1. Architecture overview

```
Browser (client)
    │
    ├─ Zustand store (auth, sell flow state)
    │
    ├─ TanStack Query ──► Supabase anon client ──► Supabase DB (RLS applies)
    │   (models, questions,                         ─ models table
    │    admin CRUD)                                ─ questions table
    │                                               ─ enquiries table
    ├─ fetch('/api/enquiry') ──► Next.js API route ──► Supabase service client
    │   (submit sell request)        (server-side)      (bypasses RLS, needed
    │                                                    for guest inserts)
    └─ Supabase auth (sign in / sign up via email)
```

**Key principle:** The browser never uses the service role key. The anon key is used for all client-side Supabase calls. The service role key is only used inside Next.js API routes (`app/api/`) which run server-side.

---

## 2. Supabase clients

There are three clients. Use the right one for the context.

### `createBrowserClient()` — client components

**File:** `lib/supabase/client.ts`

```ts
import { createBrowserClient } from '@/lib/supabase/client'

const sb = createBrowserClient()
```

Use in: any `"use client"` component or page. Uses the public anon key. RLS applies — the user can only see what the RLS policies allow.

**Used by:** TanStack Query in admin pages, ModelSelector, PhotoUploader.

### `createServerClient()` — server components

**File:** `lib/supabase/server.ts`

```ts
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()
```

Use in: server components (no `"use client"` directive). Reads the user's session from cookies. RLS applies as that user.

**Used by:** `app/page.tsx` (prefetches models), `app/admin/orders/[id]/page.tsx`, `app/admin/products/page.tsx`, `app/admin/questions/page.tsx`.

### `createServiceClient()` — API routes only

**File:** `lib/supabase/server.ts`

```ts
import { createServiceClient } from '@/lib/supabase/server'

const svc = createServiceClient()
```

Use in: `app/api/` routes only. Uses the service role key — bypasses all RLS. **Never import this in a client component** — the service role key would be exposed.

**Used by:** `app/api/enquiry/route.ts` (enquiry inserts, photo rows, history inserts).

### `createRouteClient()` — API routes that need the user session

**File:** `lib/supabase/server.ts`

```ts
import { createRouteClient } from '@/lib/supabase/server'

const supabase = createRouteClient()
```

Use in: API routes where you need to identify the logged-in user. Reads session from cookies. RLS applies.

**Used by:** `app/api/enquiry/route.ts` (to get the user's ID), `app/api/export/route.ts` (to check admin role).

---

## 3. Authentication flow

The app has **two separate auth systems** that coexist:

### System 1 — Zustand (seller + demo admin)

Used by the sell flow. Sellers never sign up for a Supabase account — they enter name/phone and a password on the login page.

```
/login page → lib/store.ts login() → checks password "admin123" for demo admin
                                   → otherwise creates local Zustand user
                                   → redirects to /sell/storage or /admin
```

**Files:**
- `app/login/page.tsx` — login form
- `lib/store.ts` → `login()` action
- `components/shared/AuthGate.tsx` — redirects to /login if no Zustand user
- `app/admin/AdminAuthGate.tsx` — checks Zustand demo admin OR Supabase session

**To change the demo admin password:** Edit `lib/store.ts` → `login()` function, find `id === "admin" && pwd === "admin123"`.

**To add Google OAuth for sellers:** Use `lib/auth.ts` → `signInWithGoogle()`. Wire it to the login page.

### System 2 — Supabase Auth (real admin)

Used for production admin access. Admin signs up with email/password via Supabase, then their `profiles.role` is set to `'admin'` in the database.

```
/login page → Supabase email auth → if profiles.role = 'admin' → /admin
```

**To promote a user to admin:**
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'someone@example.com';
```

**The `handle_new_user` trigger** (in `001_initial.sql`) automatically creates a `profiles` row when anyone signs up via Supabase auth.

---

## 4. API routes

### POST /api/enquiry

**File:** `app/api/enquiry/route.ts`

The main sell flow endpoint. Called from `app/sell/checkout/page.tsx` after the user fills in address, slot, and payment mode.

**What it does:**

1. Checks rate limit (5 requests per IP per 60 seconds). Returns 429 if exceeded.
2. Validates the request body with Zod.
3. Tries to get the Supabase session to identify a logged-in user. Falls back to null for guests.
4. Uses `createServiceClient()` (bypasses RLS) to INSERT into enquiries. This is intentional — guests have no session so the authenticated INSERT policy would block them.
5. Inserts photo rows into `enquiry_photos` if any paths were uploaded.
6. Inserts an initial history row (`actor: 'customer'`, `action: 'Enquiry submitted'`).
7. Sends email notifications via Resend (best-effort, never blocks the response).
8. Returns `{ enquiryId, displayId, assignedExec }`.

**The checkout page** calls `submitEnquiry()` (local Zustand) then `patchCurrentEnquiry({ id: enquiryId, display_id: displayId })` so the customer sees the real ENQ-XXXXX number from Supabase.

**To change the executive list:**
```ts
// app/api/enquiry/route.ts, top of file
const EXECS = ['Rohan Patil', 'Amit Sharma', 'Sana Khan', 'Vikram Iyer', 'Neha Desai']
```

**To change the rate limit:**
```ts
const RATE_MAX_REQ = 5    // requests per window
const RATE_WINDOW  = 60_000  // window in milliseconds
```

### GET /api/export

**File:** `app/api/export/route.ts`

Admin-only CSV export. Called from the admin Dashboard when clicking "Export CSV".

Checks the user's Supabase session, verifies `profiles.role = 'admin'`, then streams a CSV of selected enquiries (or all enquiries if no IDs are passed).

**Only works for real Supabase admins** — not the demo `admin/admin123` Zustand admin. To make it work for demo mode, the client-side export function in `Dashboard.tsx` generates a CSV directly from the in-memory data.

---

## 5. Row level security

All tables have RLS enabled. A summary of who can do what:

| Table | Anon | Customer (logged in) | Admin |
|-------|------|---------------------|-------|
| profiles | — | Read/update own | Read all |
| models | Read active | Read active | Full CRUD |
| questions | Read active | Read active | Full CRUD |
| enquiries | Insert (guest, null user_id) | Insert own, read own | Full CRUD |
| enquiry_history | — | Read own enquiry's history | Full CRUD |
| enquiry_photos | Upload to seller-* folder | Upload to own folder, read own | Full CRUD |
| reviews | Read published | Read published | Full CRUD |

**The `is_admin()` helper function** (`001_initial.sql`) is used by RLS policies to check if the current user has `role = 'admin'` in profiles. It is marked `SECURITY DEFINER STABLE` (added in `003_performance.sql`) so Postgres caches the result per query instead of running a subquery for every row.

---

## 6. Rate limiting

**File:** `app/api/enquiry/route.ts`

In-memory sliding window rate limiter. Uses a module-level `Map` keyed by client IP.

- Reads IP from `x-forwarded-for` header (set by Vercel's proxy).
- 5 requests per IP per 60 seconds.
- Returns HTTP 429 with `Retry-After` header on breach.
- Cleans up expired entries every 5 minutes to prevent memory leak.

**Limitation:** This is per serverless instance. If Vercel spins up 3 instances, each has its own Map — a bot could hit 5 × 3 = 15 requests before being blocked. For true cross-instance limiting, replace with Upstash Redis:

```ts
// Install: npm install @upstash/ratelimit @upstash/redis
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '60s'),
})

// In the POST handler:
const { success, reset } = await ratelimit.limit(clientIp)
if (!success) return NextResponse.json({ error: '...' }, { status: 429 })
```

---

## 7. Email

**File:** `lib/email.ts`

Uses [Resend](https://resend.com) for transactional email. Two emails are sent on every enquiry submission:

1. **Admin notification** — sent to `ADMIN_EMAIL` env var with full enquiry details.
2. **Customer confirmation** — sent to the customer's email (only if they have a Supabase account; guest sellers don't have an email address).

Both are sent with `Promise.allSettled()` — if email fails, the enquiry is still saved and the API still returns 200. Email failure is logged but never surfaces to the user.

**To change the email template:** Edit `lib/email.ts` → `shell()` function (shared layout) and `sendAdminNotification()` / `sendCustomerConfirmation()` (content).

**To enable email:** Set `RESEND_API_KEY` in `.env.local`. Without it, `getResend()` returns null and all emails are silently skipped — useful for local development.

**From address:** `SellMyiPhone <noreply@sellmyiphone.in>` — change at the top of `lib/email.ts`. You must verify the domain in Resend before it will send.

---

## 8. Supabase Storage

**Bucket:** `enquiry-photos` (private, created in `001_initial.sql`)

### How photo upload works

1. User selects a photo in `components/sell/PhotoUploader.tsx`.
2. A local blob URL is created immediately for preview.
3. `sb.storage.from('enquiry-photos').upload(path, file)` is called.
4. Path format: `seller-{mobile}/{slotId}-{timestamp}.jpg`
5. On success, the storage path is saved to Zustand via `setPhoto(slotId, { path })`.
6. On checkout, paths are collected and sent to `POST /api/enquiry` in the `photos` array.
7. The API inserts rows into `enquiry_photos` with `{ enquiry_id, slot, storage_path }`.

### Upload fails gracefully

If upload fails (no session, network error), the photo is marked `done: true` but `path: null`. The sell flow continues — photos are optional. The API receives an empty photos array.

### Viewing photos as admin

To get a signed URL for a photo:
```ts
const { data } = await sb.storage
  .from('enquiry-photos')
  .createSignedUrl(storagePath, 3600) // 1 hour
```

### Changing storage path format

Edit `components/sell/PhotoUploader.tsx`:
```ts
const folder = user?.mobile ? `seller-${user.mobile}` : 'guest'
const path   = `${folder}/${slot.id}-${Date.now()}.${ext}`
```

---

## 9. Environment variables

All in `.env.local`. **Never commit `.env.local` to git.**

| Variable | Required | Where used | Notes |
|----------|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Everywhere | Your project URL from Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client-side | Public key, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | API routes only | Secret — server-side only |
| `RESEND_API_KEY` | No | `lib/email.ts` | Without this, emails are skipped silently |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | OG tags, sitemap, emails | Set to `https://yourdomain.com` in production |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Yes (prod) | Footer, header buttons | Format: `919999999999` (country code + number, no +) |
| `ADMIN_EMAIL` | No | `lib/email.ts` | Receives admin notification emails |
| `GOOGLE_CLIENT_ID` | No | `lib/auth.ts` | Only if enabling Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | `lib/auth.ts` | Only if enabling Google OAuth |

**A `.env.example` file should exist at the project root** with placeholder values (no real secrets) for documentation. If it is missing, create it by copying `.env.local` and replacing all values with `your_value_here`.

---

## 10. Common changes

### Add a new API route

1. Create `app/api/your-route/route.ts`.
2. Use `createRouteClient()` to get the user's session (for reads).
3. Use `createServiceClient()` only if you need to bypass RLS (for writes on behalf of guests).
4. Validate the request body with Zod.
5. Add rate limiting if the route is user-facing.

### Change what data is returned by the admin dashboard

Edit `lib/adminQueries.ts` → `fetchEnquiries()`. Add `.select()` columns there.

### Add a column to the enquiries table

1. Create `supabase/migrations/006_add_column.sql`:
   ```sql
   ALTER TABLE public.enquiries ADD COLUMN IF NOT EXISTS your_column text;
   ```
2. Update `lib/types.ts` → `Enquiry` interface.
3. Update `app/api/enquiry/route.ts` to include the new column in the INSERT.
4. Update admin views if you want to display it.

### Change which email address receives admin notifications

```
# .env.local
ADMIN_EMAIL=newemail@example.com
```

### Disable guest mode (require login to submit enquiry)

In `app/api/enquiry/route.ts`, change the guest insert section:
```ts
// Instead of allowing null user_id, return 401 if no session
if (!userId) {
  return NextResponse.json({ error: 'Please log in to submit an enquiry.' }, { status: 401 })
}
```
Also update the RLS policy in a new migration to remove `OR user_id IS NULL`.
