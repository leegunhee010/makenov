-- ============================================================
-- 14. 플랫폼 역할 명칭 변경: 제조사 → 공급사
--     실행: node db.js supabase/14_supplier_wording.sql   (재실행 안전)
--
--     ⚠️ 두 가지를 구분한다.
--        (1) 플랫폼에서의 역할 호칭  → 바이어의 상대편. 공급사로 바꾼다.
--            예) "문의는 제조사에 직접 전달됩니다"
--        (2) 그 회사가 무엇을 하는 곳인지 설명하는 말 → 그대로 둔다.
--            예) "(주)라지는 자동차부품 제조사입니다"
--            여기서 제조사는 사실 서술이라 공급사로 바꾸면 뜻이 달라진다.
--
--     이 마이그레이션은 (1)만 바꾼다. companies.intro / products.brand_story 는
--     대부분 (2)라서 손대지 않는다.
-- ============================================================

-- ---------- FAQ 본문 (플랫폼 역할 호칭) ----------
update faqs
set a = jsonb_set(a, '{ko}', to_jsonb(replace(a->>'ko', '제조사', '공급사')))
where a->>'ko' like '%제조사%';

update faqs
set q = jsonb_set(q, '{ko}', to_jsonb(replace(q->>'ko', '제조사', '공급사')))
where q->>'ko' like '%제조사%';

-- ---------- 확인 ----------
-- select id, page, left(a->>'ko',60) from faqs where a->>'ko' like '%공급사%';
-- 남아 있어야 정상인 것(회사 설명):
-- select id, left(intro->>'ko',60) from companies where intro->>'ko' like '%제조사%';
