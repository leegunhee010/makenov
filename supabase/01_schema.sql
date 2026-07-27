-- ============================================================
--  MAKENOV — Supabase 스키마
--  Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
--  실행 순서: 01_schema.sql → 02_seed.sql → (스토리지 버킷 생성)
-- ============================================================

-- ---------- 관리자 판별 ----------
-- 관리자 계정의 auth.users.id 를 여기에 넣습니다 (02_seed.sql 마지막 참고).
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table admins enable row level security;

create or replace function is_admin()
returns boolean language sql security definer stable
set search_path = public
as $$ select exists(select 1 from admins where user_id = auth.uid()) $$;

-- ---------- 바이어 프로필 ----------
-- auth.users 와 1:1. 사업자 인증 결과가 여기 저장되고, 가격 열람 권한의 근거가 됩니다.
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  country      text not null default 'VN',
  company      text,
  address      text,
  reg_no       text,                                   -- MST / 사업자등록번호
  verified_by  text check (verified_by in ('gov','nts','checksum','domain','manual')),
  verify_note  text,
  status       text not null default 'pending'
               check (status in ('pending','verified','rejected')),
  tier         text not null default 'verified' check (tier in ('verified','vip')),
  contact_name text,
  position     text,
  messenger    text,
  phone        text,
  created_at   timestamptz default now()
);
alter table profiles enable row level security;

-- 가입 시 프로필 자동 생성
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 인증 통과 여부 (RLS에서 반복 사용)
create or replace function is_verified()
returns boolean language sql security definer stable
set search_path = public
as $$ select exists(
  select 1 from profiles where id = auth.uid() and status = 'verified'
) $$;

-- ---------- 제조사 ----------
create table if not exists companies (
  id          text primary key,
  brand       text,
  cat         text,
  name        jsonb not null default '{}'::jsonb,   -- {vi,ko,en}
  tagline     jsonb default '{}'::jsonb,
  intro       jsonb default '{}'::jsonb,
  location    jsonb default '{}'::jsonb,
  since       text,
  staff       text,
  export      text,
  brn         text,
  ceo         text,
  tel         text,
  site        text,
  certs       text[] default '{}',
  moq_policy  text,
  logo        text,
  cover       text,
  sort        int default 0,
  created_at  timestamptz default now()
);
alter table companies enable row level security;

-- ---------- 제품 ----------
create table if not exists products (
  id          text primary key,
  company_id  text references companies(id) on delete set null,
  cat         text,
  brand       text,
  origin      text,
  name        jsonb not null default '{}'::jsonb,
  tagline     jsonb default '{}'::jsonb,
  brand_story jsonb default '{}'::jsonb,
  img         text,
  gallery     text[] default '{}',
  video       text,
  detail      jsonb default '[]'::jsonb,             -- [{type:'p'|'img'|'video', ...}]
  inquiries   int default 0,
  views       int default 0,
  featured    boolean default false,
  is_new      boolean default false,
  published   boolean default true,
  created_at  date default current_date
);
alter table products enable row level security;
create index if not exists products_cat_idx on products(cat);
create index if not exists products_company_idx on products(company_id);

-- ---------- 거래 조건 (가격·MOQ·납기) ----------
-- ★ 별도 테이블로 분리한 이유:
--   같은 테이블에 두면 RLS는 '행' 단위라 가격만 가릴 수 없습니다.
--   분리해야 인증 안 된 사용자에게 아예 내려가지 않습니다. (CSS 블러는 소스보기로 뚫립니다)
create table if not exists product_terms (
  product_id text primary key references products(id) on delete cascade,
  price      text,
  moq        text,
  lead       text,
  terms      text,
  updated_at timestamptz default now()
);
alter table product_terms enable row level security;

-- ---------- 칼럼 ----------
create table if not exists columns_post (
  id         text primary key,
  cat        jsonb default '{}'::jsonb,
  title      jsonb not null default '{}'::jsonb,
  excerpt    jsonb default '{}'::jsonb,
  body       jsonb default '{}'::jsonb,
  img        text,
  date       date default current_date,
  published  boolean default true,
  created_at timestamptz default now()
);
alter table columns_post enable row level security;

-- ---------- 홈 히어로 슬라이드 ----------
create table if not exists hero_slides (
  id     text primary key,
  art    text,
  link   text,
  kicker jsonb default '{}'::jsonb,
  title  jsonb default '{}'::jsonb,
  sub    jsonb default '{}'::jsonb,
  sort   int default 0,
  active boolean default true
);
alter table hero_slides enable row level security;

-- ---------- 관심제품 ----------
create table if not exists wishlist (
  buyer_id   uuid references auth.users(id) on delete cascade,
  product_id text references products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (buyer_id, product_id)
);
alter table wishlist enable row level security;

-- ---------- 바이어 문의 ----------
create table if not exists inquiries (
  id         uuid primary key default gen_random_uuid(),
  product_id text references products(id) on delete set null,
  buyer_id   uuid references auth.users(id) on delete set null,
  message    text,
  status     text not null default 'new' check (status in ('new','doing','done')),
  memo       text,
  created_at timestamptz default now()
);
alter table inquiries enable row level security;
create index if not exists inquiries_buyer_idx on inquiries(buyer_id);

-- ---------- 제조사 입점 문의 (maker.html) ----------
create table if not exists maker_leads (
  id         uuid primary key default gen_random_uuid(),
  company    text not null,
  name       text not null,
  tel        text not null,
  email      text not null,
  site       text,
  cat        text,
  message    text,
  status     text not null default 'new'
             check (status in ('new','contacted','onboarding','done','drop')),
  memo       text,
  created_at timestamptz default now()
);
alter table maker_leads enable row level security;

-- ============================================================
--  RLS 정책
--  원칙: 열람은 자유, 가격은 인증 바이어만, 쓰기는 관리자만
-- ============================================================

-- 공개 콘텐츠 — 누구나 읽기, 관리자만 쓰기
do $$
declare t text;
begin
  foreach t in array array['companies','products','columns_post','hero_slides'] loop
    execute format('drop policy if exists "%s_read" on %I', t, t);
    execute format('drop policy if exists "%s_write" on %I', t, t);
    execute format('create policy "%s_read" on %I for select using (true)', t, t);
    execute format('create policy "%s_write" on %I for all using (is_admin()) with check (is_admin())', t, t);
  end loop;
end $$;

-- ★ 거래 조건 — 인증 바이어 또는 관리자만. 그 외에는 행 자체가 내려가지 않습니다.
drop policy if exists "terms_read" on product_terms;
create policy "terms_read" on product_terms
  for select using (is_verified() or is_admin());
drop policy if exists "terms_write" on product_terms;
create policy "terms_write" on product_terms
  for all using (is_admin()) with check (is_admin());

-- 프로필 — 본인 것만, 관리자는 전체
drop policy if exists "profiles_self" on profiles;
create policy "profiles_self" on profiles
  for select using (id = auth.uid() or is_admin());
drop policy if exists "profiles_update" on profiles;
create policy "profiles_update" on profiles
  for update using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());
drop policy if exists "profiles_insert" on profiles;
create policy "profiles_insert" on profiles
  for insert with check (id = auth.uid());

-- 관심제품 — 본인 것만
drop policy if exists "wishlist_own" on wishlist;
create policy "wishlist_own" on wishlist
  for all using (buyer_id = auth.uid()) with check (buyer_id = auth.uid());

-- 문의 — 인증 바이어만 등록, 본인 것만 조회, 관리자는 전체
drop policy if exists "inq_insert" on inquiries;
create policy "inq_insert" on inquiries
  for insert with check (buyer_id = auth.uid() and is_verified());
drop policy if exists "inq_read" on inquiries;
create policy "inq_read" on inquiries
  for select using (buyer_id = auth.uid() or is_admin());
drop policy if exists "inq_admin" on inquiries;
create policy "inq_admin" on inquiries
  for update using (is_admin()) with check (is_admin());
drop policy if exists "inq_delete" on inquiries;
create policy "inq_delete" on inquiries for delete using (is_admin());

-- 입점 문의 — 로그인 없이 접수(랜딩 폼), 조회는 관리자만
drop policy if exists "lead_insert" on maker_leads;
create policy "lead_insert" on maker_leads for insert with check (true);
drop policy if exists "lead_admin" on maker_leads;
create policy "lead_admin" on maker_leads
  for select using (is_admin());
drop policy if exists "lead_update" on maker_leads;
create policy "lead_update" on maker_leads
  for all using (is_admin()) with check (is_admin());

-- 관리자 테이블 — 본인이 관리자인지 확인만 가능
drop policy if exists "admins_self" on admins;
create policy "admins_self" on admins for select using (user_id = auth.uid());

-- ---------- 조회수 증가 (RLS 우회, 남용 방지를 위해 1씩만) ----------
create or replace function bump_views(pid text)
returns void language sql security definer
set search_path = public
as $$ update products set views = views + 1 where id = pid $$;

-- ---------- 문의 시 카운터 증가 ----------
create or replace function bump_inquiries()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  update products set inquiries = inquiries + 1 where id = new.product_id;
  return new;
end $$;

drop trigger if exists on_inquiry_created on inquiries;
create trigger on_inquiry_created
  after insert on inquiries
  for each row execute function bump_inquiries();
