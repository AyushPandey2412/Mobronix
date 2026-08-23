alter table public.enquiries
  add column if not exists payment_date date;
