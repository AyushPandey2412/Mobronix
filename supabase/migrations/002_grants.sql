-- supabase/migrations/002_grants.sql
-- Grant the standard Supabase role privileges that the API roles need.
-- Row Level Security (enabled in 001) still governs WHICH rows each role sees;
-- these GRANTs only give the roles table-level access so RLS can take effect.
-- Without these, PostgREST returns 401 "permission denied for table ..." (42501).

-- Schema usage
grant usage on schema public to anon, authenticated;

-- anon: read-only access to the publicly readable tables (RLS still applies)
grant select on all tables in schema public to anon;

-- authenticated: full DML; RLS policies restrict rows to the owner/admin
grant select, insert, update, delete on all tables in schema public to authenticated;

-- sequences (for any serial/identity columns)
grant usage, select on all sequences in schema public to anon, authenticated;

-- Make the same grants automatic for any future tables/sequences created by postgres
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated;
