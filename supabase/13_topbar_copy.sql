-- ============================================================
-- 13. 상단 띠배너 문구 교체 (긴 대시 제거)
--     실행: node db.js supabase/13_topbar_copy.sql   (재실행 안전)
-- ============================================================

update settings
set value = jsonb_set(value, '{topbar}', '{
  "vi":"Xác thực doanh nghiệp là mở ngay giá và MOQ. Miễn phí, khoảng một phút",
  "ko":"사업자 인증하면 가격과 MOQ가 바로 열립니다. 인증은 무료, 1분이면 끝납니다",
  "en":"Verify your business and prices unlock instantly. Free, about a minute"
}'::jsonb),
    updated_at = now()
where key = 'site';

-- ---------- 확인 ----------
-- select value->'topbar'->>'ko' from settings where key='site';
