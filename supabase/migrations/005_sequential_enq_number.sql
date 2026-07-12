-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: Sequential ENQ numbers
-- ─────────────────────────────────────────────────────────────────────────────
-- Problem: The existing trigger generates a random 5-digit number (ENQ73210).
-- Two enquiries can collide, and there is no way to tell which came first
-- from the number alone.
--
-- Solution: Use a Postgres SEQUENCE for a true auto-increment counter.
-- Format: ENQ-00001, ENQ-00002, ... (zero-padded to 5 digits, max 99999 before
-- wrapping — sufficient for hundreds of thousands of enquiries).
--
-- Safe to run on a live DB: the sequence starts at the current max + 1 so
-- existing ENQ numbers are not affected.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create the sequence (starts at 1, safe to re-run with IF NOT EXISTS)
create sequence if not exists public.enq_number_seq
  start 1
  increment 1
  minvalue 1
  maxvalue 99999
  cycle;        -- wraps back to 1 after 99999 (change maxvalue if you need more)

-- 2. Advance the sequence to current max so we don't reuse existing numbers
do $$
declare
  max_num int;
begin
  -- Extract the numeric part of existing ENQ IDs, find the max
  select max(nullif(regexp_replace(display_id, '[^0-9]', '', 'g'), '')::int)
  into max_num
  from public.enquiries
  where display_id ~ '^ENQ';

  if max_num is not null and max_num > 0 then
    perform setval('public.enq_number_seq', max_num, true);
  end if;
end $$;

-- 3. Replace the random trigger function with a sequential one
create or replace function public.generate_display_id() returns trigger as $$
begin
  if new.display_id is null or new.display_id = '' then
    -- ENQ-00001 format: prefix + zero-padded 5-digit sequence number
    new.display_id := 'ENQ-' || lpad(nextval('public.enq_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger is already in place from migration 001 — just the function needed updating.
-- Recreate to be safe:
drop trigger if exists set_display_id on public.enquiries;
create trigger set_display_id
  before insert on public.enquiries
  for each row execute function public.generate_display_id();
