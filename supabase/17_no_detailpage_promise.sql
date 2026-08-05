-- ============================================================
-- 17. "상세페이지 제작" 약속 문구 정리
--     실행: node db.js supabase/17_no_detailpage_promise.sql   (재실행 안전)
--
--     메이크노브가 상세페이지를 만들어 준다는 약속을 빼고
--     "3개 국어 등록" 으로만 말한다. 사장님 지시(2026-08-05).
--     코드 쪽(i18n·maker-copy·about-copy·bake) 은 같은 커밋에서 처리했고,
--     여기서는 DB 에 들어 있는 FAQ·공지를 맞춘다.
-- ============================================================

-- ---------- 칼럼 FAQ (공급사 편) ----------
-- before: 제품 상세페이지와 기업 프로필은 메이크노브가 …로 제작합니다
update faqs
set a = jsonb_build_object(
  'ko', '제품 정보와 기업 프로필은 베트남어·영어·한국어로 등록됩니다. 문의 회신은 담당자가 직접 하시게 되며, 짧은 영어로 항목만 정리해 보내셔도 충분합니다.',
  'vi', 'Thông tin sản phẩm và hồ sơ công ty được đăng bằng tiếng Việt, tiếng Anh và tiếng Hàn. Phần hồi âm do người phụ trách trực tiếp gửi, viết tiếng Anh ngắn gọn theo từng mục là đủ.',
  'en', 'Product information and the company profile are published in Vietnamese, English and Korean. Replies are sent by your own contact person, and short English laid out item by item is enough.')
where id = 'crf1';

-- ---------- 공지: 고운발 ----------
-- 제품 정보가 올라왔다는 사실만 말한다
update notices
set title = jsonb_build_object(
      'ko', '명품 고운발 풋크림 등록',
      'vi', 'Đã đăng kem dưỡng gót chân Goeunbal',
      'en', 'Goeunbal Premium Foot Cream listed'),
    body = jsonb_build_object(
      'ko', '<p>웰빙헬스팜 명품 고운발 풋크림 정보가 올라왔습니다. 2주 인체적용시험 결과, 비자극 판정, 한국 리테일 실적까지 3개 국어로 확인하실 수 있습니다.</p>',
      'vi', '<p>Đã có thông tin kem dưỡng gót chân Goeunbal của Wellbeing Healthfarm. Kết quả thử nghiệm trên người trong hai tuần, kết luận không gây kích ứng và thành tích bán lẻ tại Hàn Quốc đều xem được bằng ba ngôn ngữ.</p>',
      'en', '<p>Wellbeing Healthfarm''s Goeunbal Premium Foot Cream is now listed. The two-week human trial results, the non-irritating assessment and its Korean retail record are all available in three languages.</p>')
where id = 'n2';

-- ---------- 확인 ----------
-- select id, left(a->>'ko',60) from faqs where a->>'ko' like '%상세페이지%';
-- select id, title->>'ko' from notices where body->>'ko' like '%상세페이지%';

-- ---------- 칼럼 본문 ----------
-- c-quote: '상세페이지에 협의 가능 표시' → 제품 페이지를 가리키는 말이라 표현만 바꾼다
update columns_post
set body = jsonb_set(body, '{ko}',
  to_jsonb(replace(body->>'ko',
    '상세페이지에 <strong>협의 가능</strong> 표시가',
    '제품 페이지에 <strong>협의 가능</strong> 표시가')))
where id = 'c-quote';

update columns_post
set body = jsonb_set(body, '{vi}',
  to_jsonb(replace(body->>'vi', 'trên trang chi tiết', 'trên trang sản phẩm')))
where id = 'c-quote';

update columns_post
set body = jsonb_set(body, '{en}',
  to_jsonb(replace(body->>'en', 'on the detail page', 'on the product page')))
where id = 'c-quote';

-- c-reply: 맺음 문단의 제작 약속을 뺀다
update columns_post
set body = jsonb_set(body, '{ko}',
  to_jsonb(replace(body->>'ko',
    '상세페이지와 기업 프로필은 베트남어·영어·한국어로 저희가 제작합니다.',
    '제품 정보와 기업 프로필은 베트남어·영어·한국어로 등록됩니다.')))
where id = 'c-reply';

update columns_post
set body = jsonb_set(body, '{vi}',
  to_jsonb(replace(body->>'vi',
    'Trang chi tiết và hồ sơ công ty do chúng tôi biên soạn bằng tiếng Việt, tiếng Anh và tiếng Hàn.',
    'Thông tin sản phẩm và hồ sơ công ty được đăng bằng tiếng Việt, tiếng Anh và tiếng Hàn.')))
where id = 'c-reply';

update columns_post
set body = jsonb_set(body, '{en}',
  to_jsonb(replace(body->>'en',
    'We produce the detail pages and company profiles in Vietnamese, English and Korean.',
    'Product information and company profiles are published in Vietnamese, English and Korean.')))
where id = 'c-reply';

-- ---------- 제품 안내 문구 ----------
-- 공급사가 준 자료를 가리키는 말과, 아직 자료가 없다는 안내에서 '상세페이지'를 뺀다
update products set detail = replace(detail::text,
  '전용 상세페이지는 추후 보강 예정입니다.', '제품 정보는 추후 보강 예정입니다.')::jsonb
where detail::text like '%전용 상세페이지는 추후%';

update products set detail = replace(detail::text,
  'A dedicated detail page will be added later.', 'More product information will be added later.')::jsonb
where detail::text like '%dedicated detail page%';

update products set detail = replace(detail::text,
  'Trang chi tiết riêng của sản phẩm sẽ được bổ sung.', 'Thông tin sản phẩm sẽ được bổ sung sau.')::jsonb
where detail::text like '%Trang chi tiết riêng%';

update products set detail = replace(detail::text,
  '제조사 상세페이지 기재값입니다.', '공급사가 제공한 자료 기재값입니다.')::jsonb
where detail::text like '%제조사 상세페이지 기재값%';

update products set detail = replace(detail::text,
  'Số liệu trích từ trang chi tiết sản phẩm của nhà sản xuất.',
  'Số liệu trích từ tài liệu do nhà cung cấp cung cấp.')::jsonb
where detail::text like '%trang chi tiết sản phẩm của nhà sản xuất%';
