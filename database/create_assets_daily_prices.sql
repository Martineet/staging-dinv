create table if not exists public.assets_daily_prices (
  price_date date primary key,
  btc_eur numeric(18,8) not null check (btc_eur > 0),
  btc_source text,
  gold_eur numeric(18,8) not null check (gold_eur > 0),
  gold_source text,
  sp500_eur numeric(18,8) not null check (sp500_eur > 0),
  sp500_source text,
  ibex35_eur numeric(18,8) not null check (ibex35_eur > 0),
  ibex35_source text,
  created_at timestamptz not null default now()
);

create index if not exists assets_daily_prices_price_date_idx
  on public.assets_daily_prices (price_date);

alter table public.assets_daily_prices enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assets_daily_prices'
      and policyname = 'Allow read assets_daily_prices'
  ) then
    create policy "Allow read assets_daily_prices"
      on public.assets_daily_prices
      for select
      to authenticated, anon
      using (true);
  end if;
end $$;

