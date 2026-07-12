# MIGRATIONS.md — Database migrations guide

Everything about the Supabase database schema, how to run migrations, and what each one does.

---

## Table of contents

1. [How migrations work in this project](#1-how-migrations-work)
2. [Running migrations — step by step](#2-running-migrations)
3. [Migration files — what each one does](#3-migration-files)
4. [Running the seed data](#4-seed-data)
5. [Table reference](#5-table-reference)
6. [Adding a new migration](#6-adding-a-new-migration)
7. [Common tasks — SQL snippets](#7-common-tasks)

---

## 1. How migrations work

This project uses **plain SQL files** stored in `supabase/migrations/`. There is no CLI migration runner — you copy each file into the Supabase SQL Editor and run it manually.

**Rules to follow:**

- Run migrations **in number order** (001 → 002 → 003 → 004 → 005).
- **Never edit a migration file after you have run it** on any real database. If you need to change something, create a new numbered file.
- Every migration is written to be **safe to re-run** where possible (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP IF EXISTS`). The seed file uses `TRUNCATE` before inserting, so it is also safe to re-run.
- Migration files live at `supabase/migrations/`. Seed data lives at `supabase/seed.sql`.

---

## 2. Running migrations

### Step 1 — Open the Supabase SQL Editor

Go to your Supabase project → **SQL Editor** (left sidebar).

### Step 2 — Run each file in order

Open each file in your code editor, copy the full contents, paste into the SQL Editor, and click **Run**.

```
supabase/migrations/001_initial.sql          ← run first
supabase/migrations/002_grants.sql           ← run second
supabase/migrations/003_performance.sql      ← run third
supabase/migrations/004_photo_upload_policy.sql  ← run fourth
supabase/migrations/005_sequential_enq_number.sql  ← run fifth
supabase/seed.sql                            ← run last (loads data)
```

### Step 3 — Promote yourself to admin

After signing up in the app, run this in the SQL Editor (replace the email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

### Step 4 — Verify

In the SQL Editor, check rows exist:

```sql
SELECT count(*) FROM public.models;     -- should be 52
SELECT count(*) FROM public.questions;  -- should be 26
SELECT count(*) FROM public.reviews;    -- should be 6
```

---

## 3. Migration files

### 001_initial.sql — Full schema

Creates all 7 tables, all RLS policies, all triggers, and the Supabase Storage bucket.

**Tables created:**

| Table | Purpose |
|-------|---------|
| `profiles` | One row per signed-up user. Stores name, phone, email, role (customer / admin). Auto-created on auth sign-up via trigger. |
| `models` | Every iPhone and MacBook model with slug, name, category, series, chips, storages (JSONB), is_active, sort_order. |
| `questions` | Condition quiz questions. order_index, category (iphone / macbook / all), type (single / multi / matrix), options (JSONB), matrix_items (JSONB). |
| `enquiries` | Every sell request submitted. Links to profiles via user_id (nullable for guests). Stores devices (JSONB array), total_amount, address, pincode, pickup_slot, payment_mode, status, tracking_step. |
| `enquiry_history` | Audit log for every status change on an enquiry. actor (customer / admin), action text. |
| `enquiry_photos` | Storage paths for photos uploaded against an enquiry. slot name + Supabase Storage path. |
| `reviews` | Customer reviews shown on the homepage. is_published flag controls visibility. |

**Triggers created:**

- `set_display_id` — before INSERT on enquiries, generates a random `ENQ` number (replaced by migration 005 with sequential numbers).
- `touch_updated_at` — before UPDATE on models and questions, sets `updated_at = now()`.
- `handle_new_user` — after INSERT on `auth.users`, creates a matching row in `public.profiles`.

**RLS policies:**

- `profiles` — users can read/update their own row. Admins can read all.
- `enquiries` — users can see and insert their own. Admins can see all, update any, delete any. Guest inserts (user_id null) are blocked here — fixed in migration 003.
- `enquiry_history` — users can see history for their own enquiries. Admins see all.
- `enquiry_photos` — same as history.
- `models` — public read (sell flow needs this without login). Admin write only.
- `questions` — public read. Admin write only.
- `reviews` — public read for is_published = true. Admin can see and write all.

**Storage bucket:**

Creates the `enquiry-photos` private bucket for customer photo uploads. Original policies are replaced by migration 004.

---

### 002_grants.sql — Role grants

Grants SELECT, INSERT, UPDATE, DELETE on all public tables to the `anon` and `authenticated` Postgres roles. Without this, RLS policies exist but the roles have no base access to even attempt a query.

---

### 003_performance.sql — Indexes + RLS fixes

**New indexes:**

| Index | Table | Column | Why |
|-------|-------|--------|-----|
| `idx_enquiries_created_at` | enquiries | created_at DESC | Dashboard sorts by date — was a full table scan. |
| `idx_enquiry_history_enquiry` | enquiry_history | enquiry_id | Order detail fetches history by enquiry_id — was a seq scan. |
| `idx_enquiries_status_created` | enquiries | (status, created_at DESC) | Admin filters by status then sorts — composite index covers both. |
| `idx_models_active` | models | (is_active, category, sort_order) WHERE is_active = true | Partial index for the public sell-flow query that only fetches active models. |
| `idx_questions_active` | questions | (is_active, category, order_index) WHERE is_active = true | Same for condition page questions. |

**RLS fix — is_admin() function:**

The original `is_admin()` function ran a subquery into `profiles` on every row check. For an admin reading 100 enquiries, this meant 100 subqueries. Changed to `SECURITY DEFINER STABLE` — Postgres caches the result within each query.

**RLS fix — guest enquiry insert:**

The original policy `user_id = auth.uid()` blocked guest sellers (no Supabase session). Added `OR user_id IS NULL` to allow the server-side API route to insert on behalf of guests.

---

### 004_photo_upload_policy.sql — Photo bucket RLS

The original storage policies required `to authenticated` for uploads. Guest sellers use the anon key and have no session, so their uploads were rejected.

**Drops** the old policies and creates four new ones:

- `photo upload authenticated` — authenticated users upload to `{uid}/` folder.
- `photo upload guest` — anon users upload to `seller-{mobile}/` folder.
- `photo read own or admin` — authenticated users read their own folder. Admins read all.
- `photo read guest` — anon users read the `seller-{mobile}/` folder during the same session.

---

### 005_sequential_enq_number.sql — Sequential ENQ numbers

The original trigger generated a random 5-digit number (`ENQ73210`). Two enquiries could collide, and the number gave no ordering information.

**Creates** a Postgres sequence `enq_number_seq` (1 → 99999, cycles). Advances the sequence to `max(existing ENQ number) + 1` so no existing number is reused. Replaces the trigger function to generate `ENQ-00001`, `ENQ-00002`, etc. (zero-padded, with hyphen).

---

## 4. Seed data

`supabase/seed.sql` loads all the starting data. It **truncates** the models, questions, and reviews tables first, so it is safe to re-run. It does not touch enquiries or profiles.

**What it loads:**

| Table | Rows | Notes |
|-------|------|-------|
| `models` | 20 iPhones + 32 MacBooks = 52 | iPhone SE (3rd Gen) through iPhone 16 Pro Max. MacBook Air 2013 → 2026, MacBook Pro 2013 → 2025. |
| `questions` | 13 iPhone + 13 MacBook = 26 | Full condition quiz for both categories. |
| `reviews` | 6 | All marked is_published = true. |

**Gap to be aware of:** The seed has 20 iPhones but `lib/data.ts` (the local fallback) has 35. The seed is missing iPhone 17 series, iPhone Air, and SE 2020/2022. After running the seed, add these via `/admin/products` or update the seed file before running it.

---

## 5. Table reference

### enquiries — key columns

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key. Used internally for all Supabase queries. |
| `display_id` | text unique | Human-readable order number e.g. `ENQ-00012`. Shown to customer and admin. |
| `user_id` | uuid nullable | Links to profiles. NULL for guest sellers. |
| `devices` | jsonb | Array of `{ model, storage, chip, base, final, factors, answers }`. |
| `total_amount` | int | Sum of all device final prices in INR. |
| `status` | text | `pending` / `accepted` / `completed` / `rejected` / `cancelled`. |
| `tracking_step` | int | 0–4 maps to TRACKING_STEPS in `lib/data.ts`. |
| `assigned_exec` | text | Name of the pickup executive. Random from EXECS list in API route. |
| `payment_mode` | text | `UPI` or `Cash`. |
| `internal_note` | text | Admin-only note. Never shown to customer. |

### models — storages column format

**iPhone (flat):**
```json
{ "128GB": 50000, "256GB": 57000, "512GB": 65000 }
```

**MacBook (nested by chip):**
```json
{ "M3": { "256GB": 72000, "512GB": 82000, "1TB": 94000 } }
```

### questions — types

| Type | options field | matrix_items field |
|------|-------------|-------------------|
| `single` | Array of `{ label, factor }` | null |
| `multi` | Array of `{ label, factor }`. Set `exclusive_option` to the "no issues" label. | null |
| `matrix` | null | Array of `{ label, yesFactor, noFactor }` |

---

## 6. Adding a new migration

1. Create a file named `supabase/migrations/006_describe_what_it_does.sql`.
2. Start with a comment block explaining what it does and why.
3. Use `IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP IF EXISTS` where possible.
4. Test on a staging project before running on production.
5. Never modify earlier migration files.

**Template:**

```sql
-- ─────────────────────────────────────────────────────────────────────
-- Migration 006: Short description
-- Date: YYYY-MM-DD
-- ─────────────────────────────────────────────────────────────────────
-- Longer explanation of why this change is needed.
-- ─────────────────────────────────────────────────────────────────────

-- Your SQL here
```

---

## 7. Common tasks

### Promote a user to admin

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'someone@example.com';
```

### Check all enquiries with customer names

```sql
SELECT e.display_id, p.full_name, p.phone, e.total_amount, e.status, e.created_at
FROM public.enquiries e
LEFT JOIN public.profiles p ON p.id = e.user_id
ORDER BY e.created_at DESC
LIMIT 50;
```

### Change a model's price

```sql
UPDATE public.models
SET storages = '{"128GB": 52000, "256GB": 59000, "512GB": 67000}'::jsonb,
    updated_at = now()
WHERE slug = 'iphone-16';
```

### Add a new iPhone model

```sql
INSERT INTO public.models (slug, name, category, series, chips, rams, storages, is_active, sort_order)
VALUES (
  'iphone-17',
  'iPhone 17',
  'iphone',
  '17 Series',
  null, null,
  '{"128GB": 65000, "256GB": 73000, "512GB": 85000}'::jsonb,
  true,
  (SELECT count(*) FROM public.models WHERE category = 'iphone')
);
```

### Hide a model from the sell flow

```sql
UPDATE public.models SET is_active = false WHERE slug = 'iphone-x';
```

### Reset the ENQ number sequence (e.g. after clearing test data)

```sql
SELECT setval('public.enq_number_seq', 1, false);
```

### Delete all test enquiries

```sql
DELETE FROM public.enquiries WHERE display_id LIKE 'ENQ%' AND total_amount < 1000;
```

### View enquiry history for a specific order

```sql
SELECT actor, action, created_at
FROM public.enquiry_history
WHERE enquiry_id = 'paste-uuid-here'
ORDER BY created_at DESC;
```

**Never edit `001_initial.sql` — add migration 006+ for any schema changes.**
