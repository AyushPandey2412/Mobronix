-- Migration 008: WhatsApp Business integration support
-- Adds canonical enquiry statuses, notification audit/idempotency, and realtime.
-- Safe to re-run.

-- 1. Normalize old status values before tightening the check constraint.
update public.enquiries
set status = case status
  when 'pending' then 'new'
  when 'accepted' then 'contacted'
  when 'rejected' then 'cancelled'
  else status
end
where status in ('pending', 'accepted', 'rejected');

alter table public.enquiries
  alter column status set default 'new';

alter table public.enquiries
  drop constraint if exists enquiries_status_check;

alter table public.enquiries
  add constraint enquiries_status_check
  check (status in (
    'new',
    'contacted',
    'pickup_scheduled',
    'inspection',
    'price_confirmed',
    'payment_completed',
    'completed',
    'cancelled'
  ));

-- Realtime UPDATE payloads are more useful with full row identity.
alter table public.enquiries replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'enquiries'
    ) then
      alter publication supabase_realtime add table public.enquiries;
    end if;
  end if;
end $$;

-- 2. Persist WhatsApp sends for auditability and duplicate prevention.
create table if not exists public.whatsapp_notifications (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  recipient_type text not null check (recipient_type in ('owner', 'customer')),
  event_key text not null,
  to_phone text not null,
  template_name text not null check (template_name in ('owner_new_enquiry', 'customer_status_update')),
  whatsapp_message_id text,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error_message text,
  response_payload jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (enquiry_id, recipient_type, event_key)
);

drop trigger if exists touch_whatsapp_notifications on public.whatsapp_notifications;
create trigger touch_whatsapp_notifications
  before update on public.whatsapp_notifications
  for each row execute function public.touch_updated_at();

create index if not exists idx_whatsapp_notifications_enquiry
  on public.whatsapp_notifications(enquiry_id);

create index if not exists idx_whatsapp_notifications_status
  on public.whatsapp_notifications(status, created_at desc);

alter table public.whatsapp_notifications enable row level security;

drop policy if exists "whatsapp notifications admin read" on public.whatsapp_notifications;
create policy "whatsapp notifications admin read"
  on public.whatsapp_notifications
  for select
  using (public.is_admin());

drop policy if exists "whatsapp notifications service writes" on public.whatsapp_notifications;
create policy "whatsapp notifications service writes"
  on public.whatsapp_notifications
  for all
  using (false)
  with check (false);

grant select, insert, update, delete on public.whatsapp_notifications to service_role;
grant select on public.whatsapp_notifications to authenticated;
