-- Verification script for portfolios/investments constraints and RLS policies.
-- Run in Supabase SQL Editor after applying migrations.

-- 1) RLS enabled.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('portfolios', 'investments')
order by c.relname;

-- 2) Unique portfolio name per member.
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.portfolios'::regclass
  and contype = 'u'
  and conname = 'portfolios_member_id_name_key';

-- 3) FK with cascade delete.
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.investments'::regclass
  and contype = 'f'
  and conname = 'investments_portfolio_id_fkey';

-- 4) Expected CRUD policies.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and (
    (tablename = 'portfolios' and policyname in (
      'portfolios_select_own',
      'portfolios_insert_own',
      'portfolios_update_own',
      'portfolios_delete_own'
    ))
    or
    (tablename = 'investments' and policyname in (
      'investments_select_own',
      'investments_insert_own',
      'investments_update_own',
      'investments_delete_own'
    ))
  )
order by tablename, policyname;

-- 5) Authenticated grants.
select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee = 'authenticated'
  and table_name in ('portfolios', 'investments')
order by table_name, privilege_type;
