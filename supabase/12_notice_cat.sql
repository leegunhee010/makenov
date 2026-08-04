-- ============================================================
-- 12. 공지사항 구분·상단고정 (addwel식 게시판)
--     실행: node db.js supabase/12_notice_cat.sql   (재실행 안전)
-- ============================================================

alter table notices add column if not exists cat    text    not null default 'notice';  -- notice|new|update|event
alter table notices add column if not exists pinned boolean not null default false;

update notices set cat='notice', pinned=true  where id='n1';
update notices set cat='new',    pinned=false where id in ('n2','n3');

-- ---------- 확인 ----------
-- select id, date, cat, pinned, title->>'ko' from notices order by pinned desc, date desc;
