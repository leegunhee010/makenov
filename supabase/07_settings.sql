-- ============================================================
-- 07. 사이트 설정 테이블 (상단 띠배너 등)
--     실행: Supabase 대시보드 → SQL Editor에 붙여넣고 Run (재실행 안전)
--
--     이 파일을 실행하기 전에는 관리자 '설정 → 상단 띠배너' 저장이
--     브라우저에만 남고 다른 기기·배포본에는 반영되지 않습니다.
-- ============================================================

create table if not exists settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);
alter table settings enable row level security;

-- 공개 읽기 (띠배너 문구는 비로그인 방문자도 봐야 함)
drop policy if exists "settings_read" on settings;
create policy "settings_read"  on settings for select using (true);

-- 쓰기는 관리자만
drop policy if exists "settings_admin" on settings;
create policy "settings_admin" on settings for all using (is_admin()) with check (is_admin());

-- ---------- 시드 (data.js MK_SETTINGS와 동일) ----------
-- 이미 값이 있으면 덮어쓰지 않는다 — 운영 중 바꾼 문구가 되돌아가면 안 되므로.
insert into settings (key, value) values
('site', '{
  "topbarOn": true,
  "topbarLink": "",
  "topbar": {
    "vi": "Doanh nghiệp Hàn Quốc đang tìm nhà phân phối — xác thực miễn phí để xem giá",
    "ko": "해외 유통 파트너를 찾는 제조사 모집 중 — 사업자 인증하면 가격 열람 무료",
    "en": "Makers are looking for distribution partners — verify free to unlock pricing"
  }
}'::jsonb)
on conflict (key) do nothing;

-- ---------- 확인 ----------
-- select value->'topbar'->>'ko' from settings where key='site';
