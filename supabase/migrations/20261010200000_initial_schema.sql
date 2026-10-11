-- Gerenciie Pro / Rastreie-aqui: schema inicial (migrado do Firestore)
-- Todas as tabelas de dados pertencem a um usuário (user_id -> auth.users) e são
-- protegidas por RLS: cada usuário só lê/escreve as próprias linhas.

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  photo_url text,
  provider text,
  role text not null default 'user' check (role in ('user', 'admin')),
  plan text not null default 'free',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

-- Função auxiliar fora do schema exposto, para evitar recursão nas políticas
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Cria o perfil automaticamente quando um usuário se cadastra
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name, photo_url, provider)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_app_meta_data ->> 'provider'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- As políticas rodam com o papel do usuário, então ele precisa poder chamar is_admin()
grant usage on schema private to authenticated;
revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

alter table public.profiles enable row level security;

create policy "profiles: ver o próprio ou admin vê todos" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));

create policy "profiles: atualizar o próprio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Usuário só pode alterar nome e foto (não pode se promover a admin nem mudar o plano).
-- Papel, plano e status são alterados pelo servidor (service_role) ou no painel do Supabase.
revoke update on public.profiles from authenticated;
grant update (display_name, photo_url) on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Tabelas financeiras
-- ---------------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  bank text,
  type text not null check (type in ('checking', 'savings', 'credit_card', 'wallet', 'investment')),
  balance numeric(14, 2) not null default 0,
  credit_limit numeric(14, 2),
  closing_day smallint check (closing_day between 1 and 31),
  due_day smallint check (due_day between 1 and 31),
  color text,
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  budget_limit numeric(14, 2),
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  category text,
  account_id uuid references public.accounts (id) on delete set null,
  account_name text,
  date date not null,
  status text not null default 'paid' check (status in ('paid', 'pending', 'cancelled')),
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  notes text,
  attachment_url text,
  is_recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  creditor text,
  total_amount numeric(14, 2) not null,
  paid_amount numeric(14, 2) not null default 0,
  installments_count integer not null default 1,
  paid_installments integer not null default 0,
  installment_value numeric(14, 2),
  due_date date,
  interest_rate numeric(7, 4),
  status text not null default 'active' check (status in ('active', 'paid_off', 'renegotiated')),
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  target_amount numeric(14, 2) not null,
  current_amount numeric(14, 2) not null default 0,
  target_date date,
  category text,
  color text,
  icon text,
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

create table public.market_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  category text,
  quantity numeric(10, 3) not null default 1,
  unit_price numeric(14, 2) not null default 0,
  unit text,
  checked boolean not null default false,
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  brand text,
  model text,
  plate text,
  year smallint,
  current_km integer,
  fuel_type text check (fuel_type in ('gasolina', 'etanol', 'diesel', 'flex', 'eletrico')),
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

create table public.vehicle_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  vehicle_id uuid not null references public.vehicles (id) on delete cascade,
  description text not null,
  type text not null check (type in ('fuel', 'maintenance', 'tax', 'insurance', 'wash', 'other')),
  amount numeric(14, 2) not null,
  date date not null,
  km integer,
  liters numeric(10, 3),
  price_per_liter numeric(10, 3),
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  date date not null,
  amount numeric(14, 2),
  type text not null check (type in ('bill', 'income', 'reminder', 'meeting')),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  mode text not null default 'personal' check (mode in ('personal', 'business')),
  created_at timestamptz not null default now()
);

-- Calculadora de precificação (coleção "products" no Firestore)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  product_name text not null,
  currency text not null default 'BRL',
  cost_price numeric(14, 2) default 0,
  freight_in numeric(14, 2) default 0,
  packaging_cost numeric(14, 2) default 0,
  shipping_label numeric(14, 2) default 0,
  fixed_fee numeric(14, 2) default 0,
  marketplace_commission_percent numeric(7, 4) default 0,
  gateway_fee numeric(7, 4) default 0,
  marketing_percent numeric(7, 4) default 0,
  fixed_op_cost numeric(14, 2) default 0,
  tax_percent numeric(7, 4) default 0,
  desired_markup numeric(7, 4) default 0,
  estimated_monthly_sales integer default 0,
  tax_regime text,
  card_tax_percent numeric(7, 4) default 0,
  payment_reserve_percent numeric(7, 4) default 0,
  yampi_fee_percent numeric(7, 4) default 0,
  icms_percent numeric(7, 4) default 0,
  pix_tax_percent numeric(7, 4) default 0,
  new_tax_percent numeric(7, 4) default 0,
  ads_tax_percent numeric(7, 4) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  spend numeric(14, 2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  atc integer not null default 0,
  ic integer not null default 0,
  sales integer not null default 0,
  active boolean not null default true,
  selected boolean not null default false,
  phase text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.planning_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null default current_date,
  spend numeric(14, 2) not null default 0,
  revenue numeric(14, 2) not null default 0,
  roas numeric(10, 4),
  cpa numeric(14, 2),
  profit numeric(14, 2),
  created_at timestamptz not null default now()
);

-- updated_at automático em products
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row execute function private.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS + índices para todas as tabelas com user_id
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'accounts', 'categories', 'transactions', 'debts', 'goals', 'market_items',
    'vehicles', 'vehicle_expenses', 'calendar_events', 'products', 'campaigns',
    'planning_history'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create index %I on public.%I (user_id)', t || '_user_id_idx', t);
    execute format(
      'create policy "dono pode ver" on public.%I for select to authenticated using (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "dono pode inserir" on public.%I for insert to authenticated with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "dono pode atualizar" on public.%I for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "dono pode excluir" on public.%I for delete to authenticated using (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Índices para chaves estrangeiras e consultas por data
create index transactions_account_id_idx on public.transactions (account_id);
create index transactions_user_date_idx on public.transactions (user_id, date desc);
create index vehicle_expenses_vehicle_id_idx on public.vehicle_expenses (vehicle_id);
create index calendar_events_user_date_idx on public.calendar_events (user_id, date);
