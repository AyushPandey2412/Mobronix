-- ─────────────────────────────────────────────────────────────────────
-- Migration 006: Grant table/sequence privileges to service_role
-- Date: 2026-06-26
-- ─────────────────────────────────────────────────────────────────────
-- Migration 002 granted privileges to `anon` and `authenticated` but not to
-- `service_role`. The /api/enquiry route inserts with the service-role key
-- (to allow guest submissions that bypass RLS), so without these grants the
-- insert fails with "permission denied for table enquiries".
--
-- This grants full DML on all existing public tables + sequences to
-- service_role, and sets default privileges so future tables are covered too.
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO service_role;
