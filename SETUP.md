# SETUP.md — How to run, configure, and deploy SellMyiPhone

---

## What this project is

A Next.js 15 app that lets users get an instant buyback quote for their used iPhone and book a doorstep pickup. Admins manage orders, products, and condition questions through a Supabase-backed dashboard.

**Two auth systems coexist:**
- **Users** (sellers) — Zustand local auth (`name + password`, any name works, any password works). No database needed.
- **Admin (demo)** — Zustand local admin (`admin` / `admin123`). Dashboard shows seed data. No Supabase needed.
- **Admin (production)** — Supabase email/password auth. Must have `profiles.role = 'admin'` in the database.

---

## 1. Prerequisites

- Node.js 18.17 or newer
- npm 9+
- A Supabase project (for production admin and enquiry storage — optional for local dev)
- A Resend account (for transactional emails — optional)

---

## 2. Install dependencies

```bash
unzip practice.zip
cd merged_final
npm install
```

---

## 3. Environment variables

Copy `.env.local` is already included with the Supabase project keys. For local development it works as-is.

For production, update these values:

```env
# Supabase — Settings → API in your Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend — resend.com → API Keys
RESEND_API_KEY=re_xxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
ADMIN_EMAIL=you@yourdomain.com
```

---

## 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Test credentials:**

| Who | URL | Credentials |
|-----|-----|-------------|
| Seller | `/` then click any model | Name: anything · Password: anything |
| Admin (demo) | `/login` | Name: `admin` · Password: `admin123` |
| Admin (production) | `/login` | Your Supabase email + password |

---

## 5. Set up Supabase (production)

### 5a. Run migrations

Go to your Supabase dashboard → SQL Editor, then run these files in order:

```
supabase/migrations/001_initial.sql   ← creates all tables, RLS, triggers
supabase/migrations/002_grants.sql    ← sets up role grants
```

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 5b. Seed with sample data (optional)

```sql
-- Run in Supabase SQL Editor
-- Pastes in iPhone models, MacBook models, condition questions, reviews
```

Run `supabase/seed.sql` in the SQL Editor.

### 5c. Create your admin account

1. Go to Supabase → Authentication → Users → Invite user (or sign up via the app)
2. After the user is created, run this in SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

3. Sign in at `/login` with that email and password → you'll be redirected to `/admin`.

---

## 6. Email setup (Resend)

1. Create a free account at [resend.com](https://resend.com)
2. Add your domain or use the sandbox `@resend.dev` address
3. Copy your API key to `RESEND_API_KEY` in `.env.local`
4. Update `ADMIN_EMAIL` to your email address
5. The app sends two emails per enquiry:
   - Admin notification (to `ADMIN_EMAIL`)
   - Customer confirmation (to the Supabase user's email, if they have one)

If `RESEND_API_KEY` is empty, emails are silently skipped — the app still works fine.

---

## 7. Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Or drag-and-drop at [vercel.com/new](https://vercel.com/new).

**Add these environment variables in the Vercel dashboard** (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL        ← set to your Vercel URL
ADMIN_EMAIL
NEXT_PUBLIC_WHATSAPP_NUMBER
```

---

## 8. Changing prices / models

**Option A — Admin panel (production only)**  
Go to `/admin` → Products → Edit any model or add new.

**Option B — Edit static data (works in demo mode too)**  
Edit `lib/data.ts`. The `MODELS` array has every iPhone with storage → price mapping:

```ts
{ id: "16pro", name: "iPhone 16 Pro", series: "16 Series", storages: { "128GB": 58000, "256GB": 65000 } },
```

Change the numbers and restart `npm run dev`.

---

## 9. Changing condition questions

**Option A — Admin panel**  
Go to `/admin` → Questions → Edit or add questions. Each option has a factor (1.0 = no change, 0.85 = −15%).

**Option B — Edit static data**  
Edit the `QUESTIONS` array in `lib/data.ts`. Questions support three types:
- `single` — one option selected (radio)
- `multi` — multiple options, with optional exclusive option that clears others
- `matrix` — yes/no for multiple sub-items (e.g. WiFi working, Face ID working)

---

## 10. Changing pickup slots

Edit the `SLOTS` array in `lib/data.ts`:

```ts
export const SLOTS = [
  "Today 10 AM – 12 PM",
  "Today 12 PM – 2 PM",
  // add or remove slots here
];
```

---

## 11. Adding a new page

1. Create `app/your-page/page.tsx`
2. If it needs login: wrap with `<AuthGate>` (Zustand) or add `if (!user) return null` + redirect
3. If it needs admin: wrap with `<AdminAuthGate>`
4. If it's a sell flow step: add it inside `app/sell/` — the sell layout adds `container-app` padding automatically

---

## 12. Changing colours

The design uses two systems — edit `tailwind.config.ts`:

**P1 — blue (frontend / user-facing):**
```ts
brand: { DEFAULT: "var(--brand)" }   // → --brand: var(--color-primary-600) in globals.css
// Primary: #1A56DB (Trust Blue)
// Change: update --color-primary-600 in app/globals.css
```

**P2 — green (admin panel):**
```ts
accent: "#16A34A",     // main green CTA
"accent-deep": "#0E7C39",
"accent-soft": "#E7F7ED",
```

---

## 13. Common changes reference

| Task | File to edit |
|------|-------------|
| Change iPhone buyback prices | `lib/data.ts` → `MODELS` array |
| Add a new iPhone model | `lib/data.ts` → add entry to `MODELS` |
| Change condition questions | `lib/data.ts` → `QUESTIONS` array |
| Change pickup time slots | `lib/data.ts` → `SLOTS` array |
| Change executives list | `lib/data.ts` → `EXECUTIVES` array |
| Change marketing copy (homepage) | `app/page.tsx` |
| Change FAQ answers | `app/page.tsx` → `FAQS` array |
| Change footer links/contact | `components/shared/Footer.tsx` |
| Change email templates | `lib/email.ts` |
| Add a new admin nav item | `app/admin/AdminNav.tsx` → `LINKS` array |
| Change admin dashboard stats | `app/admin/Dashboard.tsx` |
| Add new WhatsApp template | `app/admin/orders/[id]/OrderDetail.tsx` → `waMessages` array |
| Change admin status options | `app/admin/orders/[id]/OrderDetail.tsx` → `ADMIN_STATUSES` |
| Change demo admin credentials | `lib/store.ts` → `login()` function (line ~138) |
| Add new Supabase table | Create `supabase/migrations/003_*.sql` |

