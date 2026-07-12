-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: Allow guest (unauthenticated) photo uploads
-- ─────────────────────────────────────────────────────────────────────────────
-- The sell flow uses the Supabase anon key (not an authenticated session).
-- The original policy requires `to authenticated` which blocks guest uploads.
-- We drop the old policy and replace it with one that allows anon uploads
-- into the "guest" folder, and authenticated users into their own folder.
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop old policies
drop policy if exists "photo upload own folder"  on storage.objects;
drop policy if exists "photo read own or admin"   on storage.objects;

-- Allow authenticated users to upload to their own folder (seller-{mobile}/...)
create policy "photo upload authenticated"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'enquiry-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow anon (guest sellers) to upload to the "guest" folder
create policy "photo upload guest"
  on storage.objects for insert
  to anon
  with check (
    bucket_id = 'enquiry-photos'
    and (storage.foldername(name))[1] like 'seller-%'
  );

-- Allow authenticated users to read their own photos + admins to read all
create policy "photo read own or admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'enquiry-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- Allow anon to read guest folder photos (needed during the same session)
create policy "photo read guest"
  on storage.objects for select
  to anon
  using (
    bucket_id = 'enquiry-photos'
    and (storage.foldername(name))[1] like 'seller-%'
  );
