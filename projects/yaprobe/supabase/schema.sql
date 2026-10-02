-- YaProbé MVP schema — draft v1
-- PostgreSQL / Supabase

create extension if not exists pgcrypto;

create type public.buy_again_choice as enum ('yes','maybe','no');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  country_code char(2),
  preferred_currency char(3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_es text not null,
  name_en text,
  icon text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  barcode text unique,
  name text not null,
  brand text,
  variant text,
  category_id uuid references public.categories(id),
  image_url text,
  created_by uuid references auth.users(id),
  status text not null default 'active' check (status in ('active','pending','merged','hidden')),
  merged_into uuid references public.products(id),
  ratings_count integer not null default 0,
  average_rating numeric(3,2),
  buy_again_yes_pct numeric(5,2),
  average_price numeric(12,2),
  price_currency char(3),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  buy_again public.buy_again_choice not null,
  price numeric(12,2) check (price is null or price >= 0),
  currency char(3),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, product_id)
);

create index ratings_product_idx on public.ratings(product_id);
create index ratings_user_recent_idx on public.ratings(user_id, updated_at desc);
create index products_category_idx on public.products(category_id);
create index products_brand_idx on public.products(lower(brand));

-- Seed categories: intentionally broad for MVP.
insert into public.categories(slug,name_es,name_en,icon) values
('wine','Vinos','Wine','wine'),
('beer','Cervezas','Beer','beer'),
('coffee','Café','Coffee','coffee'),
('food','Alimentos','Food','food'),
('snacks','Botanas y snacks','Snacks','snack'),
('beverages','Bebidas','Beverages','drink'),
('personal-care','Cuidado personal','Personal care','sparkles'),
('beauty','Belleza','Beauty','droplet'),
('home-care','Hogar y limpieza','Home care','home'),
('pet','Mascotas','Pet','paw'),
('other','Otros','Other','box')
on conflict do nothing;

-- Public read for global catalog.
alter table public.products enable row level security;
alter table public.categories enable row level security;
alter table public.ratings enable row level security;
alter table public.profiles enable row level security;

create policy "categories_read_all"
on public.categories for select
using (true);

create policy "products_read_all"
on public.products for select
using (status = 'active');

create policy "authenticated_create_product"
on public.products for insert
to authenticated
with check (auth.uid() = created_by);

create policy "own_profile_read"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "own_profile_write"
on public.profiles for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Ratings are private at row level; community aggregates should be exposed through
-- a controlled view/RPC that returns only aggregate statistics.
create policy "own_ratings_read"
on public.ratings for select
to authenticated
using (auth.uid() = user_id);

create policy "own_ratings_insert"
on public.ratings for insert
to authenticated
with check (auth.uid() = user_id);

create policy "own_ratings_update"
on public.ratings for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "own_ratings_delete"
on public.ratings for delete
to authenticated
using (auth.uid() = user_id);

-- Aggregate function; SECURITY DEFINER should be reviewed carefully before production.
create or replace function public.product_public_stats(target_product uuid)
returns table (
  ratings_count bigint,
  average_rating numeric,
  buy_again_yes_pct numeric,
  average_price numeric
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint,
    round(avg(stars)::numeric, 2),
    case when count(*) = 0 then null
      else round((count(*) filter (where buy_again='yes')::numeric / count(*)::numeric) * 100, 1)
    end,
    round(avg(price)::numeric, 2)
  from public.ratings
  where product_id = target_product;
$$;

revoke all on function public.product_public_stats(uuid) from public;
grant execute on function public.product_public_stats(uuid) to authenticated;

-- Production note:
-- Add rate limiting / anti-abuse at API edge, canonical image moderation,
-- duplicate merge tooling, and optionally materialized aggregates when scale warrants.
