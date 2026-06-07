
-- Roles enum for admin gating
create type public.app_role as enum ('admin', 'user');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  plan text not null default 'free',
  forecasts_today int not null default 0,
  chat_messages_today int not null default 0,
  trading_style text not null default 'moderate',
  default_currency text not null default 'INR',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- User roles (separate table, no recursion)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Portfolio
create table public.portfolio (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  company_name text,
  qty numeric not null,
  buy_price numeric not null,
  buy_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Watchlist
create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  added_at timestamptz not null default now(),
  unique (user_id, ticker)
);

-- Price alerts
create table public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  condition text not null,
  target_price numeric not null,
  alert_via text not null default 'in-app',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Forecast history
create table public.forecast_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  model text not null,
  recommendation text not null,
  predicted_price numeric,
  predicted_change_pct numeric,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.portfolio enable row level security;
alter table public.watchlist enable row level security;
alter table public.price_alerts enable row level security;
alter table public.forecast_history enable row level security;

-- Policies: profiles
create policy "Profiles: select own" on public.profiles for select using (auth.uid() = id);
create policy "Profiles: update own" on public.profiles for update using (auth.uid() = id);
create policy "Profiles: insert own" on public.profiles for insert with check (auth.uid() = id);

-- Policies: user_roles (read own)
create policy "Roles: select own" on public.user_roles for select using (auth.uid() = user_id);

-- Policies: portfolio / watchlist / alerts / history (full crud on own rows)
create policy "Portfolio: own" on public.portfolio for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Watchlist: own" on public.watchlist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Alerts: own" on public.price_alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "History: own" on public.forecast_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, plan)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'plan', 'free')
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'user')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
