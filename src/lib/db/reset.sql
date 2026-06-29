-- ============================================================================
-- OWC PNG — FULL DATABASE RESET (DESTRUCTIVE)
-- ----------------------------------------------------------------------------
-- Drops the ENTIRE `public` schema and everything in it (all tables, views,
-- functions, types, sequences, policies, triggers) and recreates an empty
-- `public` schema with Supabase's default role grants.
--
-- This gives you a clean, empty database to work with.
--
-- NOT affected: the `auth` schema (your users/logins are kept), `storage`,
-- and other Supabase-managed schemas.
--
-- Run this once in the Supabase SQL editor. Afterwards you can build from
-- scratch, or run src/lib/db/schema.sql to provision the OWC schema.
-- ============================================================================

-- Remove any OWC trigger we previously attached to auth.users (safe if absent).
drop trigger if exists on_auth_user_created on auth.users;

-- Nuke and recreate the public schema.
drop schema if exists public cascade;
create schema public;

-- Restore the standard Supabase grants on the fresh schema.
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all   on schema public to postgres, service_role;

alter default privileges in schema public
  grant all on tables    to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to postgres, anon, authenticated, service_role;

comment on schema public is 'standard public schema';

-- Done — `public` is now empty.
