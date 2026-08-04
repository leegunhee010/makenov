-- ============================================================
-- 06. 메인페이지 FAQ 테이블 + 칼럼 슬러그·SEO 필드
--     실행: Supabase 대시보드 → SQL Editor에 붙여넣고 Run (재실행 안전)
-- ============================================================

-- ---------- FAQ ----------
create table if not exists faqs (
  id         text primary key,
  page       text not null default 'home',
  q          jsonb not null default '{}'::jsonb,   -- {vi,ko,en}
  a          jsonb not null default '{}'::jsonb,
  sort       int  not null default 0,
  published  boolean not null default true,
  created_at timestamptz default now()
);
alter table faqs enable row level security;

drop policy if exists "faq_read" on faqs;
create policy "faq_read"  on faqs for select using (published);
drop policy if exists "faq_admin" on faqs;
create policy "faq_admin" on faqs for all using (is_admin()) with check (is_admin());

-- ---------- 칼럼 슬러그 · SEO ----------
alter table columns_post add column if not exists slug text;
alter table columns_post add column if not exists seo_title text;
alter table columns_post add column if not exists seo_desc text;
create unique index if not exists columns_slug_uniq
  on columns_post (slug) where slug is not null and slug <> '';

-- ---------- FAQ 시드 (data.js와 동일 내용, upsert) ----------
insert into faqs (id, page, sort, q, a) values
('f1','home',1,
 '{"vi":"Đăng ký và sử dụng có mất phí không?","ko":"가입과 이용은 무료인가요?","en":"Is it free to join and use?"}'::jsonb,
 '{"vi":"Hoàn toàn miễn phí — đăng ký, xem sản phẩm, gửi yêu cầu báo giá và xác thực doanh nghiệp đều không mất phí.","ko":"네. 가입, 제품 열람, 견적 문의, 사업자 인증 모두 무료입니다.","en":"Yes. Signing up, browsing products, sending quotation requests and business verification are all free."}'::jsonb),
('f2','home',2,
 '{"vi":"Vì sao giá và MOQ bị khóa?","ko":"가격과 최소주문수량(MOQ)이 왜 잠겨 있나요?","en":"Why are prices and MOQs locked?"}'::jsonb,
 '{"vi":"Giá, MOQ, thời gian giao hàng và điều kiện cung ứng chỉ hiển thị cho nhà mua đã xác thực doanh nghiệp. Đăng ký miễn phí và xác thực để xem ngay.","ko":"가격·MOQ·납기·공급 조건은 사업자 인증을 통과한 바이어에게만 공개됩니다. 무료 가입 후 인증하면 바로 열람할 수 있습니다.","en":"Price, MOQ, lead time and supply terms are visible only to verified buyers. Sign up free and verify your business to unlock them."}'::jsonb),
('f3','home',3,
 '{"vi":"Xác thực doanh nghiệp như thế nào?","ko":"사업자 인증은 어떻게 하나요?","en":"How does business verification work?"}'::jsonb,
 '{"vi":"Việt Nam dùng mã số thuế (MST), Hàn Quốc dùng số đăng ký kinh doanh, các quốc gia khác xác thực bằng email tên miền công ty. Thường chỉ mất khoảng 1 phút.","ko":"베트남은 세금코드(MST), 한국은 사업자등록번호, 그 외 국가는 회사 이메일 도메인으로 인증합니다. 보통 1분이면 끝납니다.","en":"Vietnam verifies by tax code (MST), Korea by business registration number, and other countries by company email domain. It usually takes about a minute."}'::jsonb),
('f4','home',4,
 '{"vi":"Có làm việc trực tiếp với nhà sản xuất không?","ko":"제조사와 직접 거래하나요?","en":"Do I deal directly with manufacturers?"}'::jsonb,
 '{"vi":"Có. Yêu cầu của bạn được chuyển thẳng đến nhà sản xuất, không qua trung gian. MAKENOV đảm nhận việc kết nối và xác thực.","ko":"네. 문의는 제조사에 직접 전달되며 중간 유통 마진이 없습니다. MAKENOV는 연결과 검증을 담당합니다.","en":"Yes. Your inquiry goes straight to the manufacturer with no middleman margins. MAKENOV handles matching and verification."}'::jsonb),
('f5','home',5,
 '{"vi":"Có thể thương lượng MOQ không?","ko":"최소주문수량은 협의할 수 있나요?","en":"Can MOQs be negotiated?"}'::jsonb,
 '{"vi":"Tùy sản phẩm, nhưng nhiều nhà sản xuất sẵn sàng thương lượng đơn hàng nhỏ để thử nghiệm thị trường. Hãy ghi số lượng mong muốn khi gửi yêu cầu báo giá.","ko":"제품마다 다르지만, 많은 제조사가 테스트 오더용 소량 주문 협의에 열려 있습니다. 견적 문의 시 희망 수량을 적어주세요.","en":"It varies by product, but many manufacturers are open to smaller trial orders. State your desired quantity in the quotation request."}'::jsonb),
('f6','home',6,
 '{"vi":"Tôi có thể gửi yêu cầu bằng ngôn ngữ nào?","ko":"어떤 언어로 문의할 수 있나요?","en":"Which languages can I use?"}'::jsonb,
 '{"vi":"Tiếng Việt, tiếng Anh và tiếng Hàn đều được. Khi cần, đội ngũ MAKENOV sẽ hỗ trợ trao đổi.","ko":"베트남어·영어·한국어 모두 가능합니다. 필요하면 MAKENOV 팀이 소통을 지원합니다.","en":"Vietnamese, English and Korean are all fine. The MAKENOV team can assist with communication when needed."}'::jsonb)
on conflict (id) do update set q=excluded.q, a=excluded.a, sort=excluded.sort;

-- ---------- 확인 ----------
-- select id, sort, q->>'ko' from faqs order by sort;
