-- ════════════════════════════════════════════════
--  家計簿アプリ — Supabase スキーマ
--  Supabase SQL Editor でそのまま実行してください
-- ════════════════════════════════════════════════

-- 拡張
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────
-- 1. 支払い方法マスタ
-- ────────────────────────────────────────────────
create table if not exists public.payment_methods (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,                      -- 例: "楽天カード", "Suica"
  type          text not null check (type in (
                  'cash', 'credit', 'debit',
                  'emoney', 'qr', 'bank_transfer'
                )),
  color         text not null default '#5e5a50',
  -- クレジット専用
  closing_day   smallint check (closing_day between 1 and 31),
  payment_day   smallint check (payment_day between 1 and 31),
  credit_limit  numeric(12,0),
  -- 電子マネー/QR専用（初期残高）
  balance       numeric(12,0) default 0,
  created_at    timestamptz not null default now()
);

alter table public.payment_methods enable row level security;

create policy "Users manage own payment methods"
  on public.payment_methods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- 2. 取引
-- ────────────────────────────────────────────────
create table if not exists public.transactions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  type                text not null check (type in ('income', 'expense')),
  category            text not null,
  note                text not null default '',
  amount              numeric(12,0) not null check (amount > 0),
  date                date not null,
  payment_method_id   uuid references public.payment_methods(id) on delete set null,
  is_charge           boolean not null default false,  -- 電子マネーチャージ
  created_at          timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- インデックス
create index if not exists idx_transactions_user_date
  on public.transactions(user_id, date desc);

create index if not exists idx_transactions_payment_method
  on public.transactions(payment_method_id);

-- ────────────────────────────────────────────────
-- 3. ユーザープロフィール（任意）
-- ────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users manage own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- プロフィール自動作成トリガー
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────
-- 4. ビュー: 支払い方法別月次集計
-- ────────────────────────────────────────────────
create or replace view public.payment_method_monthly_summary as
select
  pm.id                       as payment_method_id,
  pm.user_id,
  pm.name,
  pm.type,
  pm.color,
  pm.closing_day,
  pm.payment_day,
  pm.credit_limit,
  pm.balance                  as initial_balance,
  to_char(t.date, 'YYYY-MM') as month,
  sum(case when t.type = 'expense' and not t.is_charge then t.amount else 0 end) as total_expense,
  sum(case when t.type = 'income'  or t.is_charge     then t.amount else 0 end) as total_income,
  count(t.id)                 as transaction_count
from public.payment_methods pm
left join public.transactions t
  on t.payment_method_id = pm.id
group by pm.id, pm.user_id, pm.name, pm.type, pm.color,
         pm.closing_day, pm.payment_day, pm.credit_limit, pm.balance,
         to_char(t.date, 'YYYY-MM');

-- ════════════════════════════════════════════════
--  Supabase Auth — Google OAuth 設定手順
-- ════════════════════════════════════════════════
-- 1. Supabase Dashboard > Authentication > Providers > Google
-- 2. "Google" を有効化
-- 3. Google Cloud Console でOAuth 2.0クライアントIDを作成
--    - 承認済みリダイレクトURI: https://<project>.supabase.co/auth/v1/callback
-- 4. Client ID / Client Secret を Supabase に入力して保存
