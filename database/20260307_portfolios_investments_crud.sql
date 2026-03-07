begin;

-- Ensure required ownership columns are mandatory.
alter table if exists public.portfolios
  alter column member_id set not null;

alter table if exists public.portfolios
  alter column name set not null;

alter table if exists public.investments
  alter column portfolio_id set not null;

-- Portfolio names must be unique per member (owner).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'portfolios_member_id_name_key'
      and conrelid = 'public.portfolios'::regclass
  ) then
    alter table public.portfolios
      add constraint portfolios_member_id_name_key unique (member_id, name);
  end if;
end $$;

-- Ensure investments.portfolio_id -> portfolios.portfolio_id uses ON DELETE CASCADE.
do $$
declare
  fk_name text;
begin
  for fk_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.investments'::regclass
      and c.contype = 'f'
      and c.confrelid = 'public.portfolios'::regclass
  loop
    execute format('alter table public.investments drop constraint %I', fk_name);
  end loop;

  alter table public.investments
    add constraint investments_portfolio_id_fkey
    foreign key (portfolio_id)
    references public.portfolios (portfolio_id)
    on delete cascade;
end $$;

-- Optional but recommended: ensure portfolios are tied to a valid member.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'portfolios_member_id_fkey'
      and conrelid = 'public.portfolios'::regclass
  ) then
    alter table public.portfolios
      add constraint portfolios_member_id_fkey
      foreign key (member_id)
      references public.members (member_id)
      on delete cascade;
  end if;
end $$;

alter table public.portfolios enable row level security;
alter table public.investments enable row level security;

-- Recreate policies to guarantee expected CRUD behavior.
drop policy if exists "portfolios_select_own" on public.portfolios;
drop policy if exists "portfolios_insert_own" on public.portfolios;
drop policy if exists "portfolios_update_own" on public.portfolios;
drop policy if exists "portfolios_delete_own" on public.portfolios;

drop policy if exists "investments_select_own" on public.investments;
drop policy if exists "investments_insert_own" on public.investments;
drop policy if exists "investments_update_own" on public.investments;
drop policy if exists "investments_delete_own" on public.investments;

create policy "portfolios_select_own"
  on public.portfolios
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.member_id = portfolios.member_id
        and m.email = auth.email()
    )
  );

create policy "portfolios_insert_own"
  on public.portfolios
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.members m
      where m.member_id = portfolios.member_id
        and m.email = auth.email()
    )
  );

create policy "portfolios_update_own"
  on public.portfolios
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.member_id = portfolios.member_id
        and m.email = auth.email()
    )
  )
  with check (
    exists (
      select 1
      from public.members m
      where m.member_id = portfolios.member_id
        and m.email = auth.email()
    )
  );

create policy "portfolios_delete_own"
  on public.portfolios
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.members m
      where m.member_id = portfolios.member_id
        and m.email = auth.email()
    )
  );

create policy "investments_select_own"
  on public.investments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      join public.members m on m.member_id = p.member_id
      where p.portfolio_id = investments.portfolio_id
        and m.email = auth.email()
    )
  );

create policy "investments_insert_own"
  on public.investments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.portfolios p
      join public.members m on m.member_id = p.member_id
      where p.portfolio_id = investments.portfolio_id
        and m.email = auth.email()
    )
  );

create policy "investments_update_own"
  on public.investments
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      join public.members m on m.member_id = p.member_id
      where p.portfolio_id = investments.portfolio_id
        and m.email = auth.email()
    )
  )
  with check (
    exists (
      select 1
      from public.portfolios p
      join public.members m on m.member_id = p.member_id
      where p.portfolio_id = investments.portfolio_id
        and m.email = auth.email()
    )
  );

create policy "investments_delete_own"
  on public.investments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios p
      join public.members m on m.member_id = p.member_id
      where p.portfolio_id = investments.portfolio_id
        and m.email = auth.email()
    )
  );

grant select, insert, update, delete on table public.portfolios to authenticated;
grant select, insert, update, delete on table public.investments to authenticated;

commit;
