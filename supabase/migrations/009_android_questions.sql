-- Migration to add 'android' to the category check constraint of the questions table.
alter table public.questions drop constraint if exists questions_category_check;
alter table public.questions add constraint questions_category_check check (category in ('iphone','macbook','android','all'));
