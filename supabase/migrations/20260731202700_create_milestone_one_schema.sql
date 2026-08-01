create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  area text not null,
  address text,
  latitude double precision,
  longitude double precision,
  cuisines text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name, area)
);

create table public.recommendation_evidence (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  source_url text not null unique,
  source_profile text,
  published_at timestamptz not null,
  cuisine_clues text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null,
  cuisines text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.refresh_requests (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  cuisines text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'running', 'complete', 'failed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz
);

create index restaurants_area_idx on public.restaurants using gin (lower(area) gin_trgm_ops);
create index recommendation_evidence_restaurant_published_idx on public.recommendation_evidence (restaurant_id, published_at desc);
create index saved_searches_user_id_idx on public.saved_searches (user_id);
create index refresh_requests_status_requested_idx on public.refresh_requests (status, requested_at);

grant select on public.restaurants, public.recommendation_evidence to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.saved_searches to authenticated;

alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.recommendation_evidence enable row level security;
alter table public.saved_searches enable row level security;
alter table public.refresh_requests enable row level security;

create policy "Public restaurants are readable" on public.restaurants for select to anon, authenticated using (true);
create policy "Public evidence is readable" on public.recommendation_evidence for select to anon, authenticated using (true);

create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users read own saved searches" on public.saved_searches for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own saved searches" on public.saved_searches for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete own saved searches" on public.saved_searches for delete to authenticated using ((select auth.uid()) = user_id);

-- refresh_requests intentionally has no client policy; only trusted server/database roles may use it.
