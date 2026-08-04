-- ============================================================
-- 11. 공지사항 게시판 (고객센터)
--     실행: node db.js supabase/11_notices.sql   (재실행 안전)
--
--     신제품 등록·업데이트 소식이 쌓이는 게시판.
--     지금은 관리자 공지사항 탭에서 수동 작성 — 제품 등록 시 자동 발행은
--     아직 붙이지 않는다(사용자 지시).
-- ============================================================

create table if not exists notices (
  id         text primary key,
  title      jsonb not null default '{}'::jsonb,   -- {vi,ko,en}
  body       jsonb not null default '{}'::jsonb,   -- {vi,ko,en} HTML
  date       date  not null default current_date,
  published  boolean not null default true,
  created_at timestamptz default now()
);
alter table notices enable row level security;

drop policy if exists "notices_read" on notices;
create policy "notices_read"  on notices for select using (published);
drop policy if exists "notices_admin" on notices;
create policy "notices_admin" on notices for all using (is_admin()) with check (is_admin());

-- ---------- 시드 (data.js MK_NOTICES와 동일, upsert) ----------
insert into notices (id, date, title, body) values
('n1','2026-07-29',
 '{"vi":"MAKENOV chính thức mở cửa","ko":"메이크노브 오픈 안내","en":"MAKENOV is open"}'::jsonb,
 '{"vi":"<p>MAKENOV — nền tảng B2B kết nối sản phẩm sáng tạo Hàn Quốc với nhà mua toàn cầu — đã chính thức hoạt động. Đăng ký và xác thực doanh nghiệp miễn phí để xem giá và gửi yêu cầu báo giá.</p>","ko":"<p>한국 혁신제품과 해외 바이어를 잇는 B2B 플랫폼 메이크노브가 문을 열었습니다. 무료 가입·사업자 인증 후 가격 열람과 견적 문의를 이용하실 수 있습니다.</p>","en":"<p>MAKENOV — the B2B platform connecting innovative Korean products with global buyers — is live. Sign up and verify free to unlock pricing and send quotation requests.</p>"}'::jsonb),
('n2','2026-08-04',
 '{"vi":"Kem dưỡng gót chân Goeunbal — trang chi tiết đầy đủ","ko":"명품 고운발 풋크림 상세페이지 공개","en":"Goeunbal foot cream — full detail page published"}'::jsonb,
 '{"vi":"<p>Trang chi tiết đầy đủ của kem dưỡng gót chân Goeunbal (WELLBEING HEALTHFARM) đã lên: kết quả thử nghiệm 4 tuần, chứng nhận không kích ứng và thành tích bán hàng tại Hàn Quốc.</p>","ko":"<p>웰빙헬스팜 명품 고운발 풋크림의 상세페이지가 공개됐습니다. 2주 인체적용시험 결과, 비자극 판정, 한국 리테일 실적까지 담았습니다.</p>","en":"<p>The full detail page for Goeunbal foot cream (WELLBEING HEALTHFARM) is up — four-week test results, non-irritation rating and Korean retail track record included.</p>"}'::jsonb),
('n3','2026-08-04',
 '{"vi":"Ra mắt 3 sản phẩm MIRALET của INCORE (Daegu)","ko":"인코아 더마코스메틱 미라렛 3종 등록","en":"Three MIRALET dermacosmetics by INCORE now listed"}'::jsonb,
 '{"vi":"<p>Nhà sản xuất thiết bị y tế INCORE (Daegu) đã đăng dòng dermacosmetic MIRALET: tinh chất Phyto Intensive Ampoule 30ml (PDRN thực vật 20.000ppm), Skinbooster 2,0ml×4 (100.000ppm) và Phyto Double Mist 50g. Xác thực doanh nghiệp để xem điều kiện giao dịch.</p>","ko":"<p>대구 의료기기 제조사 (주)인코아의 더마코스메틱 브랜드 미라렛이 등록됐습니다. 피토 인텐시브 앰플 30ml(식물성 PDRN 20,000ppm), 스킨부스터 2.0ml×4, 피토 더블 미스트 50g 3종입니다. 사업자 인증 후 거래 조건을 확인하세요.</p>","en":"<p>MIRALET, the dermacosmetic brand of Daegu medical-device maker INCORE, is now listed: Phyto Intensive Ampoule 30ml (plant PDRN 20,000ppm), Skinbooster 2.0ml×4 and Phyto Double Mist 50g. Verify your business to see trade terms.</p>"}'::jsonb)
on conflict (id) do update set title=excluded.title, body=excluded.body, date=excluded.date;

-- ---------- 확인 ----------
-- select id, date, title->>'ko' from notices order by date desc;
