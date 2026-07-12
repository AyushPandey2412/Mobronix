-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: performance + RLS fixes
-- Run once against your Supabase project.
-- Safe to re-run (all statements use IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. MISSING INDEXES ────────────────────────────────────────────────────────

-- Dashboard orders by created_at DESC — was a full table scan without this
create index if not exists idx_enquiries_created_at
  on public.enquiries(created_at desc);

-- Order detail fetches history by enquiry_id — was a seq scan without this
create index if not exists idx_enquiry_history_enquiry
  on public.enquiry_history(enquiry_id);

-- Admin dashboard filters by status AND sort by created_at — composite index
create index if not exists idx_enquiries_status_created
  on public.enquiries(status, created_at desc);

-- ── 2. FIX is_admin() — make it SECURITY DEFINER STABLE ─────────────────────
-- STABLE tells Postgres to cache the result within a single query, so checking
-- 100 enquiry rows doesn't trigger 100 subqueries into profiles.
-- SECURITY DEFINER means it runs as the function owner, bypassing RLS on profiles.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── 3. FIX enquiry INSERT policy — allow guest (user_id IS NULL) inserts ──────
-- The old policy required user_id = auth.uid(), which blocks guests (no session).
-- The API route uses the service role key and bypasses RLS anyway, but this fixes
-- any future direct client inserts and makes the intent explicit.

drop policy if exists "enquiries owner insert" on public.enquiries;

create policy "enquiries owner insert"
  on public.enquiries
  for insert
  with check (
    user_id = auth.uid()    -- logged-in user inserting their own enquiry
    or user_id is null      -- guest mode (Zustand sell flow, no Supabase session)
  );

-- ── 4. ENQUIRY PHOTOS — allow service-role inserts (already works, but explicit) ─
-- No change needed here — service role bypasses RLS. Keeping comment for clarity.

-- ── 5. MODELS — add is_active index for public sell-flow query ─────────────────
-- fetchPublicModels filters by is_active = true — index speeds this up
create index if not exists idx_models_active
  on public.models(is_active, category, sort_order)
  where is_active = true;

-- ── 6. QUESTIONS — add is_active index for public condition page query ─────────
create index if not exists idx_questions_active
  on public.questions(is_active, category, order_index)
  where is_active = true;
