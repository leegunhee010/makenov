-- ============================================================
--  MAKENOV — 제품별 관심 수 집계
--
--  카드에 조회수를 보여주던 자리를 '관심 N'으로 바꾼다.
--  wishlist 테이블은 RLS 때문에 본인 행만 보이므로 남의 관심까지 셀 수 없다.
--  → products 에 집계 컬럼을 두고 트리거로 갱신한다. (inquiries 카운터와 같은 방식)
--
--  SQL Editor 에 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

alter table products add column if not exists wish_count int not null default 0;

create or replace function bump_wish()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if TG_OP = 'INSERT' then
    update products set wish_count = wish_count + 1 where id = new.product_id;
  elsif TG_OP = 'DELETE' then
    update products set wish_count = greatest(0, wish_count - 1) where id = old.product_id;
  end if;
  return null;
end $$;

drop trigger if exists on_wishlist_change on wishlist;
create trigger on_wishlist_change
  after insert or delete on wishlist
  for each row execute function bump_wish();

-- 기존 데이터가 있다면 실제 값으로 맞춘다
update products p
   set wish_count = coalesce((select count(*) from wishlist w where w.product_id = p.id), 0);

-- ---------- 확인 ----------
-- select id, wish_count from products order by wish_count desc;
