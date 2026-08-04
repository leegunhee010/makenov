-- ============================================================
--  MAKENOV — 명품 고운발 풋크림 (웰빙헬스팜) 추가
--
--  제조사 (주)웰빙헬스팜 + 제품 명품 고운발 + 거래조건을 라이브 DB에 넣는다.
--  가격은 USD 표기 + '협의 가능' 배지(products.negotiable) 방식.
--
--  Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.
--  여러 번 실행해도 안전합니다 (on conflict = upsert, add column if not exists).
--
--  출처: 3wbmall.com / wh-pharm.com 공개정보 (사업자번호·대표·주소·이미지 실값)
-- ============================================================

-- 0) 가격 협의 가능 플래그 (없으면 추가)
alter table products add column if not exists negotiable boolean not null default false;

-- 1) 제조사 : (주)웰빙헬스팜
insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'wellbeing', 'WELLBEING HEALTHFARM', 'beauty',
  '{"vi":"WELLBEING HEALTHFARM","ko":"(주)웰빙헬스팜","en":"WELLBEING HEALTHFARM Co., Ltd."}'::jsonb,
  '{"vi":"Thương hiệu chăm sóc bàn chân K-Beauty — Goeunbal (Bàn chân mịn màng)","ko":"대표 풋케어 브랜드 명품 고운발 — 발 각질·보습 전문","en":"K-Beauty foot-care brand behind Goeunbal premium foot cream"}'::jsonb,
  '{"vi":"WELLBEING HEALTHFARM (Incheon, Hàn Quốc) là nhà sản xuất mỹ phẩm chăm sóc sức khỏe, nổi bật với thương hiệu chăm sóc bàn chân \"Goeunbal\". Sản phẩm chủ lực là kem dưỡng gót chân chứa urea, được bán trực tiếp qua kênh chính hãng 3wbmall và Naver, với hàng nghìn đánh giá của người dùng Hàn Quốc.","ko":"(주)웰빙헬스팜은 인천 남동구에 위치한 건강·화장품 제조기업으로, 대표 풋케어 브랜드 \"명품 고운발\"을 운영합니다. 우레아 성분 기반 발 각질·보습 크림을 자사몰(3wbmall)과 네이버에서 직접 판매하며 다수의 국내 사용후기를 보유하고 있습니다.","en":"WELLBEING HEALTHFARM (Incheon, Korea) is a health & cosmetics manufacturer known for its \"Goeunbal\" foot-care brand. Its flagship urea-based foot cream sells directly through its own mall (3wbmall) and Naver, with thousands of Korean user reviews."}'::jsonb,
  '{"vi":"Incheon, Hàn Quốc","ko":"인천 남동구","en":"Incheon, Korea"}'::jsonb,
  '2018', '—', '—', '118-81-22304', '박진수', '070-7532-4508', 'wh-pharm.com',
  array['화장품 제조판매업'], '문의',
  'https://3wbmall.com/web/upload/weskin11/kr/main/logo.png',
  'https://3wbmall.com/web/upload/weskin11/kr/main/210114_pc_top.jpg', 10)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

-- 2) 제품 : 명품 고운발 풋크림
insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,negotiable,created_at) values (
  'p9', 'wellbeing', 'beauty', 'WELLBEING HEALTHFARM', 'Incheon, Korea',
  '{"vi":"Kem dưỡng gót chân Goeunbal (Bàn chân mịn màng)","ko":"명품 고운발 풋크림","en":"Goeunbal Premium Foot Cream"}'::jsonb,
  '{"vi":"Kem chứa urea làm mềm da chai sần, nứt gót chân — dưỡng ẩm cho bàn chân mịn màng","ko":"우레아 성분으로 굳은살·갈라진 발뒤꿈치를 부드럽게, 발 각질 관리 풋크림","en":"Urea foot cream that softens calluses and cracked heels while deeply moisturizing"}'::jsonb,
  '{"vi":"Goeunbal là thương hiệu chăm sóc bàn chân của WELLBEING HEALTHFARM (Incheon, Hàn Quốc), bán trực tiếp qua kênh chính hãng với nhiều đánh giá của người dùng Hàn Quốc.","ko":"명품 고운발은 (주)웰빙헬스팜(인천)의 풋케어 브랜드로, 자사몰 직판 및 다수의 국내 사용후기를 보유한 제품입니다.","en":"Goeunbal is the foot-care brand of WELLBEING HEALTHFARM (Incheon, Korea), sold directly through its own mall with many Korean user reviews."}'::jsonb,
  'https://3wbmall.com/web/product/big/202606/4ff0e93f1a368497d33f653b12804364.jpg',
  array['https://3wbmall.com/web/product/big/202606/4ff0e93f1a368497d33f653b12804364.jpg','https://3wbmall.com/web/product/small/202606/0e63ed69a7e12afe44e884f975cfb86c.jpg'],
  '',
  '[{"type":"p","text":{"vi":"Kem chứa urea giúp làm mềm và loại bỏ da chai sần, da khô nứt nẻ ở gót chân, đồng thời cấp ẩm để giữ bàn chân mềm mịn. Kết cấu thẩm thấu nhanh, dùng hằng ngày sau khi tắm.","ko":"우레아 성분이 발뒤꿈치의 굳은살과 건조하게 갈라진 각질을 부드럽게 정돈하고, 동시에 수분을 공급해 매끈한 발을 유지해 줍니다. 흡수가 빠른 제형으로 목욕 후 매일 사용하기 좋습니다.","en":"A urea-based cream that softens and smooths calluses and dry, cracked heels while supplying moisture for soft feet. Its fast-absorbing texture suits daily use after bathing."}},{"type":"img","src":"https://3wbmall.com/web/product/big/202606/4ff0e93f1a368497d33f653b12804364.jpg"},{"type":"p","text":{"vi":"Khí hậu nóng ẩm và thói quen đi dép hở của người Việt khiến nhu cầu chăm sóc gót chân tăng cao — dòng foot cream Hàn Quốc có dư địa tốt tại kênh nhà thuốc, cửa hàng mỹ phẩm và bán lẻ trực tuyến.","ko":"덥고 습한 기후와 샌들 착용 문화로 베트남의 발 관리 수요가 높아, 한국산 풋크림은 약국·화장품 매장·온라인 리테일 채널에서 성장 여지가 큽니다.","en":"Vietnam''s hot, humid climate and open-sandal culture drive strong foot-care demand — Korean foot creams have room to grow across pharmacies, cosmetics stores and online retail."}}]'::jsonb,
  0, 0, false, true, true, '2026-07-29')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new, negotiable=excluded.negotiable;

-- 3) 거래조건 (RLS: 인증 바이어만 열람) — 가격은 USD, 협의 가능은 위 negotiable 플래그가 담당
insert into product_terms (product_id,price,moq,lead,terms) values (
  'p9', 'US$ 3.50 / tube (FOB Incheon)', '문의', '문의', 'K-뷰티 풋케어 · 우레아 함유 · OEM/ODM 문의 · 국내 소비자가 9,900원(참고)')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

-- ---------- 확인 ----------
-- select id, brand, negotiable, is_new from products where id='p9';
-- select * from companies where id='wellbeing';
