create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid unique references public.enquiries(id) on delete set null,
  user_id uuid not null references auth.users(id),
  name text not null,
  device text not null default '',
  rating integer not null check (rating between 1 and 5),
  review_text text not null check (char_length(review_text) between 10 and 1000),
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden', 'deleted')),
  created_at timestamptz not null default now()
);
alter table public.customer_reviews enable row level security;
revoke all on public.customer_reviews from anon, authenticated;
grant all on public.customer_reviews to service_role;
create index if not exists customer_reviews_status_created_idx on public.customer_reviews(status, created_at desc);
