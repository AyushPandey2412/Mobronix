-- Keep customer feedback when an admin removes its original enquiry.
begin;
alter table public.customer_reviews alter column enquiry_id drop not null;
alter table public.customer_reviews drop constraint if exists customer_reviews_enquiry_id_fkey;
alter table public.customer_reviews add constraint customer_reviews_enquiry_id_fkey
  foreign key (enquiry_id) references public.enquiries(id) on delete set null;
commit;
