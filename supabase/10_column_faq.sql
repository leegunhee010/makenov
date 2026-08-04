-- ============================================================
-- 10. 칼럼별 FAQ — faqs.page 에 칼럼 id를 넣으면 그 칼럼 본문 아래에 붙는다
--     실행: node db.js supabase/10_column_faq.sql   (재실행 안전)
--
--     page='home'  → 메인페이지 하단 FAQ
--     page='c1'    → 칼럼 c1 본문 아래
--     bake.js 가 각 칼럼 페이지에 FAQPage 스키마도 같이 넣는다.
-- ============================================================

insert into faqs (id, page, sort, q, a) values

-- ---------- c1 · 2026 베트남에서 가장 빠르게 성장하는 한국 제품 카테고리 5 ----------
('c1f1','c1',1,
 '{"vi":"Số liệu trong bài lấy từ đâu?","ko":"이 글의 수치는 어디서 온 것인가요?","en":"Where do the figures in this article come from?"}'::jsonb,
 '{"vi":"Bài viết dựa trên dữ liệu nhập khẩu công khai và yêu cầu báo giá thực tế mà MAKENOV nhận được. Con số theo từng danh mục có thể thay đổi theo kỳ thống kê, nên hãy dùng làm tham chiếu xu hướng thay vì con số tuyệt đối.","ko":"공개된 수입 통계와 MAKENOV가 실제로 받은 견적 문의를 함께 봤습니다. 카테고리별 수치는 통계 시점에 따라 달라질 수 있어 절대값보다 흐름으로 보시는 편이 맞습니다.","en":"It draws on public import statistics together with the quotation requests MAKENOV actually receives. Category figures shift with the reporting period, so read them as direction rather than absolute numbers."}'::jsonb),
('c1f2','c1',2,
 '{"vi":"Tôi muốn nhập một trong các danh mục này thì bắt đầu từ đâu?","ko":"여기 나온 카테고리를 수입하려면 무엇부터 하나요?","en":"If I want to import one of these categories, where do I start?"}'::jsonb,
 '{"vi":"Xác thực doanh nghiệp miễn phí trên MAKENOV rồi mở danh mục sản phẩm. Sau khi xác thực, bạn xem được giá, MOQ, thời gian giao hàng và gửi yêu cầu báo giá thẳng tới nhà sản xuất.","ko":"MAKENOV에서 무료로 사업자 인증을 한 뒤 제품 목록을 보시면 됩니다. 인증하면 가격·MOQ·납기가 열리고 제조사에 바로 견적 문의를 보낼 수 있습니다.","en":"Verify your business free on MAKENOV, then browse the product list. Verification unlocks price, MOQ and lead time, and lets you send a quotation request straight to the manufacturer."}'::jsonb),
('c1f3','c1',3,
 '{"vi":"Danh mục nào phù hợp với đơn hàng thử số lượng nhỏ?","ko":"소량 테스트 오더에 맞는 카테고리는 무엇인가요?","en":"Which categories suit a small trial order?"}'::jsonb,
 '{"vi":"Mỹ phẩm và thực phẩm chế biến thường dễ thử với số lượng nhỏ vì đơn vị đóng gói nhỏ và vòng quay nhanh. Thiết bị gia dụng và hàng an toàn thường có MOQ cao hơn, nên trao đổi điều kiện trước khi đặt.","ko":"화장품과 가공식품이 포장 단위가 작고 회전이 빨라 소량 테스트에 적합한 편입니다. 생활가전이나 안전용품은 MOQ가 높은 경우가 많아 사전에 조건을 협의하시는 편이 좋습니다.","en":"Cosmetics and processed foods are usually the easiest to trial in small volumes — small pack sizes and fast turnover. Home appliances and safety goods tend to carry higher MOQs, so agree terms up front."}'::jsonb),

-- ---------- c2 · 베트남 바이어가 한국 제품 첫 수입 시 준비해야 할 것들 ----------
('c2f1','c2',1,
 '{"vi":"Lần đầu nhập khẩu cần chuẩn bị giấy tờ gì?","ko":"첫 수입에는 어떤 서류가 필요한가요?","en":"What documents do I need for a first import?"}'::jsonb,
 '{"vi":"Thông thường cần hợp đồng mua bán, hóa đơn thương mại, phiếu đóng gói, vận đơn và giấy chứng nhận xuất xứ (C/O). Mỹ phẩm và thực phẩm cần thêm thủ tục công bố sản phẩm tại Việt Nam — hãy hỏi nhà sản xuất về hồ sơ kỹ thuật ngay từ đầu.","ko":"보통 매매계약서, 상업송장, 패킹리스트, 선하증권, 원산지증명서(C/O)가 필요합니다. 화장품·식품은 베트남 현지 제품 공고 절차가 추가되므로 제조사에 기술 자료를 처음부터 요청하시는 게 좋습니다.","en":"Typically a sales contract, commercial invoice, packing list, bill of lading and certificate of origin. Cosmetics and food add a product declaration step in Vietnam, so ask the manufacturer for the technical dossier from the start."}'::jsonb),
('c2f2','c2',2,
 '{"vi":"Điều kiện thanh toán nào là thông lệ?","ko":"결제 조건은 보통 어떻게 하나요?","en":"What payment terms are customary?"}'::jsonb,
 '{"vi":"Đơn đầu tiên thường là T/T đặt cọc 30% và thanh toán 70% còn lại trước khi giao hàng. Khi đã có lịch sử giao dịch, nhiều nhà sản xuất chấp nhận L/C hoặc nới điều kiện. Hãy chốt điều kiện bằng văn bản trước khi sản xuất.","ko":"첫 거래는 T/T 선금 30%, 선적 전 잔금 70%가 일반적입니다. 거래 이력이 쌓이면 L/C나 조건 완화가 가능한 제조사가 많습니다. 생산 전에 조건을 문서로 확정해두세요.","en":"A first order is commonly 30% T/T deposit with the 70% balance before shipment. Once a track record exists, many manufacturers accept L/C or ease terms. Fix the terms in writing before production starts."}'::jsonb),
('c2f3','c2',3,
 '{"vi":"MOQ cao quá thì thương lượng được không?","ko":"MOQ가 너무 높으면 협의할 수 있나요?","en":"Can I negotiate if the MOQ is too high?"}'::jsonb,
 '{"vi":"Có thể. Nhiều nhà sản xuất sẵn sàng giảm MOQ cho đơn thử thị trường. Khi gửi yêu cầu báo giá, hãy ghi rõ số lượng mong muốn và kế hoạch đặt lại — điều đó giúp thương lượng nhiều hơn là chỉ hỏi giảm giá.","ko":"가능합니다. 시장 테스트용 소량 주문에 열려 있는 제조사가 많습니다. 견적 문의 시 희망 수량과 재주문 계획을 같이 적어주시면, 단순히 깎아달라는 것보다 협의가 잘 됩니다.","en":"Often yes. Many manufacturers are open to smaller market-test orders. State your target quantity and reorder plan in the quotation request — that negotiates better than simply asking for a discount."}'::jsonb),

-- ---------- c3 · 대구가 K-뷰티·K-푸드의 새로운 제조 허브인 이유 ----------
('c3f1','c3',1,
 '{"vi":"Vì sao lại là Daegu chứ không phải Seoul?","ko":"왜 서울이 아니라 대구인가요?","en":"Why Daegu rather than Seoul?"}'::jsonb,
 '{"vi":"Daegu là thành phố lớn thứ tư Hàn Quốc, có nền công nghiệp dệt và cơ khí lâu đời nên hạ tầng sản xuất dày. Chi phí thấp hơn vùng thủ đô, và nhiều nhà máy vừa và nhỏ ở đây nhận đơn hàng nhỏ hơn.","ko":"대구는 한국 4대 도시로 섬유·기계 산업 기반이 오래돼 제조 인프라가 두껍습니다. 수도권보다 비용이 낮고, 중소 규모 공장이 많아 상대적으로 작은 물량도 받아줍니다.","en":"Daegu is Korea’s fourth-largest city with a long textile and machinery base, so its manufacturing infrastructure runs deep. Costs sit below the capital region, and its many small and mid-sized plants accept smaller runs."}'::jsonb),
('c3f2','c3',2,
 '{"vi":"Nhà sản xuất Daegu có kinh nghiệm xuất khẩu không?","ko":"대구 제조사는 수출 경험이 있나요?","en":"Do Daegu manufacturers have export experience?"}'::jsonb,
 '{"vi":"Tùy công ty. Có nơi đã xuất khẩu nhiều năm, cũng có nơi mạnh về sản phẩm nhưng chưa có kênh ra nước ngoài — đó chính là lý do MAKENOV tồn tại. Hồ sơ từng nhà sản xuất trên trang có ghi chứng nhận và lịch sử cung ứng.","ko":"회사마다 다릅니다. 수년째 수출 중인 곳도 있고, 제품은 좋은데 해외 채널이 없는 곳도 있습니다 — MAKENOV가 있는 이유이기도 합니다. 각 제조사 페이지에 보유 인증과 납품 이력을 적어두었습니다.","en":"It varies. Some have exported for years; others have strong products but no overseas channel — which is why MAKENOV exists. Each manufacturer page lists certifications and supply history."}'::jsonb),
('c3f3','c3',3,
 '{"vi":"Tôi có thể đến thăm nhà máy không?","ko":"공장을 직접 방문할 수 있나요?","en":"Can I visit the factory?"}'::jsonb,
 '{"vi":"Được, sau khi trao đổi cụ thể. Hãy gửi yêu cầu báo giá trước để xác nhận sản phẩm và điều kiện, sau đó MAKENOV sẽ hỗ trợ sắp xếp lịch thăm nhà máy với nhà sản xuất.","ko":"구체적인 논의 이후 가능합니다. 먼저 견적 문의로 제품과 조건을 확인하시면, MAKENOV가 제조사와 공장 방문 일정을 조율해 드립니다.","en":"Yes, once discussions are concrete. Send a quotation request first to confirm product and terms, and MAKENOV will help arrange a factory visit with the manufacturer."}'::jsonb)

on conflict (id) do update set
  page=excluded.page, sort=excluded.sort, q=excluded.q, a=excluded.a;

-- ---------- 확인 ----------
-- select page, count(*) from faqs group by page order by page;
