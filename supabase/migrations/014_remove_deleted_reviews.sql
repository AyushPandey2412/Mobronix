-- Permanently remove reviews previously deleted through the admin UI.
delete from public.customer_reviews where status = 'deleted';
