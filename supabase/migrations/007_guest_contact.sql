-- ─────────────────────────────────────────────────────────────────────
-- Migration 007: Store guest contact (name + phone) on the enquiry
-- ─────────────────────────────────────────────────────────────────────
-- Problem: Guest sellers (no auth session → no profiles row) submit an
-- enquiry through /api/enquiry, but their NAME and PHONE were only used in
-- the notification email and never persisted. The admin order page reads
-- `profiles.phone`, which is null for guests, so the customer's phone never
-- showed up and there was no way to call them back.
--
-- Solution: add nullable guest_name / guest_phone columns. The API writes
-- them for every submission; the admin UI falls back to them when there is
-- no linked profile.
--
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────

alter table public.enquiries
  add column if not exists guest_name  text,
  add column if not exists guest_phone text;

-- Optional: index phone for quick lookup / dedupe of repeat sellers.
create index if not exists idx_enquiries_guest_phone on public.enquiries(guest_phone);
