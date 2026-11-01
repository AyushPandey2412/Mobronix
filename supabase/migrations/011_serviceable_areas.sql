-- Empty by default: only pincodes explicitly enabled by an admin are served.
create table public.serviceable_areas (
  pincode text primary key check (pincode ~ '^[1-9][0-9]{5}$'),
  area_name text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.serviceable_areas enable row level security;
revoke all on public.serviceable_areas from anon, authenticated;
grant all on public.serviceable_areas to service_role;
