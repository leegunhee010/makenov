-- ============================================================
--  MAKENOV 시드 데이터 — supabase/gen-seed.js 가 생성했습니다. 직접 고치지 마세요.
--  01_schema.sql 실행 후 이 파일을 실행하세요. 여러 번 실행해도 안전합니다(upsert).
--  생성 시각: 2026-07-27T16:10:08.056Z
-- ============================================================

-- ---------- 제조사 9곳 ----------
insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'lgind', 'FIRESSAK', 'tech', '{"vi":"LARGE Co., Ltd. (FIRESSAK)","ko":"(주)라지 · 파이어싹","en":"LARGE Co., Ltd. (FIRESSAK)"}'::jsonb, '{"vi":"Chăn chữa cháy chuyên dụng cho xe điện, từ nền tảng vật liệu composite ô tô","ko":"자동차 복합소재 기술로 만든 전기차 화재 진압 솔루션","en":"EV fire-suppression solutions built on automotive composite materials"}'::jsonb, '{"vi":"LARGE Co., Ltd. (thành lập 12/2009, Daegu) là nhà sản xuất linh kiện ô tô chuyên về vải sợi thủy tinh, vật liệu composite nhiệt dẻo và vật liệu cách nhiệt hệ thống xả. Công ty đạt chứng nhận IATF 16949:2016 và có viện nghiên cứu riêng từ năm 2010, từng ký thỏa thuận phát triển chung với Fraunhofer ICT (Đức) năm 2016. Thương hiệu FIRESSAK ứng dụng nền tảng vật liệu chịu nhiệt này vào chăn chữa cháy cho xe điện, đã cung cấp cho các cơ quan công như Sở PCCC Gyeongnam và Tổng công ty Phát triển Đô thị Seongnam.","ko":"(주)라지는 2009년 12월 설립된 대구 소재 자동차부품 제조사로, 유리섬유 직물·열가소성 복합재료·배기계 단열재를 주력으로 합니다. IATF 16949:2016 인증을 보유하고 2010년 기업부설연구소를 설립했으며, 2016년 독일 Fraunhofer ICT와 복합재 공동 기술개발 협약을 체결했습니다. 이 내열소재 기술을 응용한 브랜드가 파이어싹으로, 경남소방본부·성남도시개발공사 등 공공기관에 납품 실적이 있습니다.","en":"LARGE Co., Ltd. (founded Dec 2009, Daegu) manufactures automotive components centred on glass-fibre textiles, thermoplastic composites and exhaust-system insulation. It holds IATF 16949:2016, established an in-house research institute in 2010, and signed a joint composite development agreement with Germany''s Fraunhofer ICT in 2016. Its FIRESSAK brand applies that heat-resistant material base to EV fire blankets, with supply records to public bodies including the Gyeongnam Fire Department and Seongnam Urban Development Corp."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구 달성군 테크노폴리스","en":"Daegu, Korea"}'::jsonb,
  '2009', '—', '—', '503-81-87451', '박철현', '1533-3840', 'firessak.com',
  array['IATF 16949:2016','이노비즈','벤처기업','강소기업','소재부품 전문기업','기업부설연구소'], '문의', 'https://picsum.photos/seed/mkc-lgind/200/200', 'https://picsum.photos/seed/mkc-lgind-cv/1200/400', 0)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'daon', 'DAON COSMETIC', 'beauty', '{"vi":"DAON COSMETIC","ko":"다온코스메틱","en":"DAON COSMETIC"}'::jsonb, '{"vi":"12 năm OEM/ODM cho các thương hiệu K-Beauty","ko":"K-뷰티 브랜드 OEM/ODM 12년","en":"12 years of K-Beauty OEM/ODM"}'::jsonb, '{"vi":"DAON COSMETIC là nhà sản xuất mỹ phẩm tại Daegu với 12 năm kinh nghiệm OEM/ODM cho các thương hiệu K-Beauty. Nhà máy đạt chuẩn CGMP, xuất khẩu sang 14 quốc gia. Hỗ trợ đầy đủ hồ sơ công bố mỹ phẩm và phát triển công thức riêng.","ko":"다온코스메틱은 대구 소재 화장품 제조사로, K-뷰티 브랜드 OEM/ODM 12년 경력을 보유하고 있습니다. CGMP 인증 공장에서 14개국에 수출하고 있으며, 화장품 공고 서류 지원과 자체 처방 개발이 가능합니다.","en":"DAON COSMETIC is a Daegu-based manufacturer with 12 years of K-Beauty OEM/ODM experience. Its CGMP-certified factory exports to 14 countries, with full notification-dossier support and in-house formulation."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '2014', '52', '14', null, null, null, null,
  array['CGMP','CPNP','FDA','ISO 22716'], '3,000', 'https://picsum.photos/seed/mkc-daon/200/200', 'https://picsum.photos/seed/mkc-daon-cv/1200/400', 1)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'hanil', 'HANIL FOOD', 'food', '{"vi":"HANIL FOOD","ko":"하니일푸드","en":"HANIL FOOD"}'::jsonb, '{"vi":"Thực phẩm tiện lợi Hàn Quốc từ 1998","ko":"1998년부터 한국 간편식 전문","en":"Korean convenience food since 1998"}'::jsonb, '{"vi":"HANIL FOOD sản xuất thực phẩm tiện lợi Hàn Quốc từ năm 1998. Dây chuyền đạt chuẩn HACCP, sản phẩm có mặt tại CU và GS25 trên toàn Hàn Quốc. Chuyên các dòng tự sôi và ăn liền cho kênh cửa hàng tiện lợi.","ko":"하니일푸드는 1998년부터 한국 간편식품을 생산해온 기업입니다. HACCP 인증 라인을 갖추고 전국 CU·GS25에 입점해 있으며, 편의점 채널용 자체발열·즉석식 라인에 강점이 있습니다.","en":"HANIL FOOD has produced Korean convenience food since 1998. HACCP-certified lines supply CU and GS25 nationwide, with a focus on self-heating and instant lines for convenience-store channels."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '1998', '120', '9', null, null, null, null,
  array['HACCP','ISO 22000','Halal(진행중)'], '10,000', 'https://picsum.photos/seed/mkc-hanil/200/200', 'https://picsum.photos/seed/mkc-hanil-cv/1200/400', 2)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'cleanlab', 'CLEANLAB', 'living', '{"vi":"CLEANLAB","ko":"클린랩","en":"CLEANLAB"}'::jsonb, '{"vi":"Thiết bị vệ sinh nhà bếp thông minh","ko":"스마트 주방위생 가전","en":"Smart kitchen-hygiene devices"}'::jsonb, '{"vi":"CLEANLAB phát triển thiết bị vệ sinh nhà bếp thông minh, đạt giải thưởng thiết kế Hàn Quốc 2025. Sản phẩm dùng UV-C LED, có sẵn phiên bản điện áp 220V cho thị trường Đông Nam Á.","ko":"클린랩은 스마트 주방위생 가전 전문기업으로 2025 대한민국 디자인어워드 수상 기업입니다. UV-C LED 기반 제품을 개발하며 동남아 시장용 220V 사양을 보유하고 있습니다.","en":"CLEANLAB builds smart kitchen-hygiene devices and won the 2025 Korea Design Award. Its UV-C LED products ship with 220V variants for Southeast Asian markets."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '2019', '28', '6', null, null, null, null,
  array['CE','KC','RoHS'], '500', 'https://picsum.photos/seed/mkc-clean/200/200', 'https://picsum.photos/seed/mkc-clean-cv/1200/400', 3)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'jinseng', 'JINSENG HOUSE', 'health', '{"vi":"JINSENG HOUSE","ko":"진생하우스","en":"JINSENG HOUSE"}'::jsonb, '{"vi":"Hồng sâm 6 năm tuổi, xuất khẩu 20 năm","ko":"6년근 홍삼 전문, 수출 20년","en":"6-year red ginseng, 20 years exporting"}'::jsonb, '{"vi":"JINSENG HOUSE chuyên chế biến hồng sâm từ vùng trồng sâm nổi tiếng của Hàn Quốc với 20 năm kinh nghiệm xuất khẩu. Cung cấp đa dạng quy cách quà tặng, phù hợp mùa cao điểm Tết.","ko":"진생하우스는 한국 대표 인삼 산지의 홍삼 전문 제조사로 수출 경력 20년입니다. 다양한 선물 패키지 규격을 보유해 뗏(설) 성수기 대응이 가능합니다.","en":"JINSENG HOUSE processes red ginseng from Korea''s famous ginseng regions with 20 years of export experience, offering a range of gift formats for peak seasons."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '2006', '44', '20', null, null, null, null,
  array['HACCP','건강기능식품 GMP'], '1,000', 'https://picsum.photos/seed/mkc-jin/200/200', 'https://picsum.photos/seed/mkc-jin-cv/1200/400', 4)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'toto', 'TOTO KIDS', 'kids', '{"vi":"TOTO KIDS","ko":"토토키즈","en":"TOTO KIDS"}'::jsonb, '{"vi":"Đồ chơi giáo dục cho trường mầm non Hàn Quốc","ko":"한국 유치원 납품 교육완구","en":"Educational toys for Korean kindergartens"}'::jsonb, '{"vi":"TOTO KIDS sản xuất đồ chơi giáo dục trong 15 năm, cung cấp cho các trường mầm non Hàn Quốc. Vật liệu ABS không BPA, hỗ trợ in hộp theo yêu cầu.","ko":"토토키즈는 15년 경력의 교육완구 제조사로 한국 유치원·어린이집에 납품하고 있습니다. BPA-free ABS 소재를 사용하며 주문 패키지 인쇄를 지원합니다.","en":"TOTO KIDS has made educational toys for 15 years, supplying Korean kindergartens. BPA-free ABS materials with custom box printing available."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '2011', '36', '11', null, null, null, null,
  array['KC','CE','EN71'], '2,000', 'https://picsum.photos/seed/mkc-toto/200/200', 'https://picsum.photos/seed/mkc-toto-cv/1200/400', 5)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'airio', 'AIRIO', 'tech', '{"vi":"AIRIO","ko":"에어리오","en":"AIRIO"}'::jsonb, '{"vi":"Thiết bị môi trường trong nhà, giải Red Dot 2024","ko":"실내환경 가전, 2024 레드닷 수상","en":"Indoor-environment devices, Red Dot 2024"}'::jsonb, '{"vi":"AIRIO là startup thiết bị môi trường trong nhà, đạt giải Red Dot Design Award 2024. Sử dụng bộ lọc HEPA H13 và cảm biến PM2.5, tập trung vào dòng để bàn nhỏ gọn.","ko":"에어리오는 실내환경 가전 스타트업으로 2024 레드닷 디자인 어워드를 수상했습니다. HEPA H13 필터와 PM2.5 센서를 적용한 컴팩트 데스크 라인에 집중하고 있습니다.","en":"AIRIO is an indoor-environment device startup and 2024 Red Dot Design Award winner, focused on compact desktop units with HEPA H13 filters and PM2.5 sensors."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '2020', '19', '5', null, null, null, null,
  array['CE','FCC','KC'], '1,000', 'https://picsum.photos/seed/mkc-airio/200/200', 'https://picsum.photos/seed/mkc-airio-cv/1200/400', 6)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'modam', 'MODAM', 'beauty', '{"vi":"MODAM","ko":"모담","en":"MODAM"}'::jsonb, '{"vi":"Công suất 500.000 miếng mặt nạ mỗi ngày","ko":"일 50만 장 마스크팩 생산능력","en":"500,000 sheet masks per day"}'::jsonb, '{"vi":"MODAM chuyên sản xuất mặt nạ giấy với công suất 500.000 miếng mỗi ngày tại nhà máy Daegu. Nhận private label với giá vốn cạnh tranh cho các đơn hàng lớn.","ko":"모담은 대구 공장에서 일 50만 장 생산능력을 갖춘 마스크팩 전문 제조사입니다. 대량 주문에 경쟁력 있는 원가로 프라이빗 라벨을 제공합니다.","en":"MODAM specializes in sheet masks with 500,000 sheets/day capacity at its Daegu factory, offering private label at competitive cost for large orders."}'::jsonb, '{"vi":"Daegu, Hàn Quốc","ko":"대구광역시","en":"Daegu, Korea"}'::jsonb,
  '2016', '67', '8', null, null, null, null,
  array['CGMP','CPNP'], '30,000', 'https://picsum.photos/seed/mkc-modam/200/200', 'https://picsum.photos/seed/mkc-modam-cv/1200/400', 7)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  'dalsung', 'DALSUNG TEA', 'food', '{"vi":"DALSUNG TEA","ko":"달성티","en":"DALSUNG TEA"}'::jsonb, '{"vi":"Trà hữu cơ trồng và chế biến tại Dalseong","ko":"달성군 직영 유기농 차 재배·가공","en":"Organic tea grown and processed in Dalseong"}'::jsonb, '{"vi":"DALSUNG TEA trồng và chế biến trà tại vùng Dalseong, Daegu theo chuẩn hữu cơ Hàn Quốc. Chuyên dòng trà ngũ cốc không caffeine, nhận OEM quy cách túi lọc.","ko":"달성티는 대구 달성군에서 유기농 인증 기준으로 차를 재배·가공합니다. 카페인 없는 곡물차 라인이 주력이며 티백 규격 OEM이 가능합니다.","en":"DALSUNG TEA grows and processes tea in Dalseong, Daegu under Korean organic standards, specializing in caffeine-free grain teas with tea-bag OEM available."}'::jsonb, '{"vi":"Dalseong, Daegu","ko":"대구 달성군","en":"Dalseong, Daegu"}'::jsonb,
  '2009', '14', '4', null, null, null, null,
  array['유기농 인증(한국)','HACCP'], '5,000', 'https://picsum.photos/seed/mkc-dal/200/200', 'https://picsum.photos/seed/mkc-dal-cv/1200/400', 8)
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;

-- ---------- 제품 9개 ----------
insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p0', 'lgind', 'tech', 'FIRESSAK', 'Daegu, Korea',
  '{"vi":"Chăn chữa cháy xe điện FIRESSAK FS-EV54S","ko":"파이어싹 질식소화덮개 FS-EV54S","en":"FIRESSAK EV Fire Blanket FS-EV54S"}'::jsonb, '{"vi":"Chăn phủ dập lửa xe điện — cách ly oxy, kiểm soát cháy pin lithium tại chỗ","ko":"전기차 화재를 덮어서 진압하는 질식소화덮개 — 산소를 차단해 현장에서 확산을 막습니다","en":"Smothering blanket for EV fires — cuts off oxygen to contain lithium battery fires on the spot"}'::jsonb, '{"vi":"FIRESSAK là thương hiệu của LARGE Co., Ltd., ứng dụng công nghệ vật liệu chịu nhiệt dùng trong ngành ô tô vào thiết bị chữa cháy.","ko":"파이어싹은 (주)라지의 브랜드로, 자동차용 내열 복합소재 기술을 화재 진압 장비에 적용한 제품입니다.","en":"FIRESSAK is a brand of LARGE Co., Ltd., applying automotive heat-resistant composite technology to fire-suppression equipment."}'::jsonb,
  'https://picsum.photos/seed/mkv-firessak/800/600', array['https://picsum.photos/seed/mkv-firessak/800/600','https://picsum.photos/seed/mkv-firessak2/800/600','https://picsum.photos/seed/mkv-firessak3/800/600'], '', '[{"type":"p","text":{"vi":"Xe điện cháy do pin lithium rất khó dập bằng nước vì hiện tượng tự bốc cháy lại. Chăn FS-EV54S phủ trùm toàn bộ phương tiện để cách ly oxy, ngăn lửa lan sang xe và công trình lân cận trong lúc chờ lực lượng chữa cháy.","ko":"전기차 배터리 화재는 재발화 특성 때문에 물만으로는 진압이 어렵습니다. FS-EV54S는 차량 전체를 덮어 산소를 차단함으로써, 소방대 도착 전까지 인접 차량·건물로의 확산을 막는 역할을 합니다.","en":"EV battery fires are hard to extinguish with water alone because of re-ignition. The FS-EV54S covers the whole vehicle to cut off oxygen, containing spread to adjacent vehicles and structures until fire crews arrive."}},{"type":"img","src":"https://picsum.photos/seed/mkv-firessak-d1/900/600"},{"type":"p","text":{"vi":"Phù hợp cho bãi đỗ xe ngầm, trạm sạc, kho logistics, bến xe và đội xe doanh nghiệp. Nhà sản xuất có chứng nhận IATF 16949:2016 và giấy chứng nhận kết quả thử nghiệm cho model này.","ko":"지하주차장·충전소·물류창고·차고지·법인 차량 운영처에 적합합니다. 제조사는 IATF 16949:2016 인증을 보유하고 있으며, 해당 모델의 시험성적서를 제공합니다.","en":"Suited to underground car parks, charging stations, logistics warehouses, depots and corporate fleets. The maker holds IATF 16949:2016 and provides a test report for this model."}}]'::jsonb,
  0, 0, true, true, '2026-07-27')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p0', '문의 (Ask for quotation)', '문의', '문의', '모델 FS-EV54S · 시험성적서 보유 · 공공기관 납품 실적')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p1', 'daon', 'beauty', 'DAON COSMETIC', 'Daegu, Korea',
  '{"vi":"Serum tái tạo da Daon Cica Pro","ko":"다온 시카 프로 재생 세럼","en":"Daon Cica Pro Repair Serum"}'::jsonb, '{"vi":"Serum phục hồi da chuyên sâu với 82% chiết xuất rau má Hàn Quốc","ko":"한국산 병풀 추출물 82% 고농축 진정 세럼","en":"Intensive repair serum with 82% Korean centella extract"}'::jsonb, '{"vi":"DAON COSMETIC là nhà sản xuất mỹ phẩm tại Daegu với 12 năm kinh nghiệm OEM/ODM cho các thương hiệu K-Beauty. Nhà máy đạt chuẩn CGMP, xuất khẩu sang 14 quốc gia.","ko":"다온코스메틱은 대구 소재 화장품 제조사로, K-뷰티 브랜드 OEM/ODM 12년 경력을 보유하고 있습니다. CGMP 인증 공장, 14개국 수출 실적.","en":"DAON COSMETIC is a Daegu-based manufacturer with 12 years of K-Beauty OEM/ODM experience. CGMP-certified factory exporting to 14 countries."}'::jsonb,
  'https://picsum.photos/seed/mkv-serum/800/600', array['https://picsum.photos/seed/mkv-serum/800/600','https://picsum.photos/seed/mkv-serum2/800/600','https://picsum.photos/seed/mkv-serum3/800/600'], '', '[{"type":"p","text":{"vi":"Chứng nhận CPNP & FDA. Không paraben, không hương liệu nhân tạo — phù hợp làn da nhạy cảm của khí hậu nhiệt đới.","ko":"CPNP·FDA 인증. 파라벤·인공향료 무첨가로 열대기후 민감성 피부에 적합합니다.","en":"CPNP & FDA certified. Paraben-free, no artificial fragrance — ideal for sensitive skin in tropical climates."}},{"type":"img","src":"https://picsum.photos/seed/mkv-serum-d1/900/600"},{"type":"p","text":{"vi":"Đã có mặt tại Olive Young Hàn Quốc và các chuỗi drugstore lớn. Hỗ trợ đầy đủ hồ sơ công bố mỹ phẩm tại Việt Nam.","ko":"올리브영 및 주요 드럭스토어 입점 제품. 베트남 화장품 공고 서류 지원 가능.","en":"Available in Olive Young Korea and major drugstores. Full support for Vietnam cosmetic notification dossiers."}},{"type":"img","src":"https://picsum.photos/seed/mkv-serum-d2/900/600"}]'::jsonb,
  23, 1840, true, true, '2026-07-20')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p1', 'US$ 4.20 / unit (FOB Busan)', '3,000 units', '30 days', 'OEM/ODM available · Private label OK')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p2', 'hanil', 'food', 'HANIL FOOD', 'Daegu, Korea',
  '{"vi":"Tteokbokki tự sôi HanilPot","ko":"하니포트 자체발열 즉석 떡볶이","en":"HanilPot Self-Heating Tteokbokki"}'::jsonb, '{"vi":"Món ăn Hàn Quốc tự làm nóng trong 8 phút — không cần bếp, không cần điện","ko":"불 없이 8분, 자체발열 즉석 떡볶이","en":"Self-heating Korean street food ready in 8 minutes — no stove needed"}'::jsonb, '{"vi":"HANIL FOOD sản xuất thực phẩm tiện lợi Hàn Quốc từ 1998. Dây chuyền HACCP, sản phẩm có mặt tại CU, GS25 toàn Hàn Quốc.","ko":"하니일푸드는 1998년부터 한국 간편식품을 생산해온 기업입니다. HACCP 인증 라인, 전국 CU·GS25 입점.","en":"HANIL FOOD has produced Korean convenience food since 1998. HACCP-certified lines; products in CU and GS25 nationwide."}'::jsonb,
  'https://picsum.photos/seed/mkv-tteok/800/600', array['https://picsum.photos/seed/mkv-tteok/800/600','https://picsum.photos/seed/mkv-tteok2/800/600'], '', '[{"type":"p","text":{"vi":"Cơm hộp tự sôi là xu hướng lớn tại thị trường Đông Nam Á — phù hợp cửa hàng tiện lợi, khu du lịch, đồ ăn văn phòng.","ko":"자체발열 간편식은 동남아 시장의 큰 트렌드 — 편의점·관광지·오피스 판로에 적합합니다.","en":"Self-heating meals are a major SEA trend — perfect for convenience stores, tourist areas, and office snacking."}},{"type":"img","src":"https://picsum.photos/seed/mkv-tteok-d1/900/600"}]'::jsonb,
  41, 3120, true, false, '2026-07-14')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p2', 'US$ 1.85 / pack (FOB Busan)', '10,000 packs', '25 days', 'Halal cert. in progress · Shelf life 12 months')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p3', 'cleanlab', 'living', 'CLEANLAB', 'Daegu, Korea',
  '{"vi":"Máy khử trùng dao thớt UV CleanLab","ko":"클린랩 UV 도마·칼 살균기","en":"CleanLab UV Cutting Board Sterilizer"}'::jsonb, '{"vi":"Khử 99.9% vi khuẩn trên dao thớt trong 10 phút bằng UV-C LED","ko":"UV-C LED로 10분 만에 도마·칼 99.9% 살균","en":"Kills 99.9% of germs on knives & boards in 10 minutes with UV-C LED"}'::jsonb, '{"vi":"CLEANLAB phát triển thiết bị vệ sinh nhà bếp thông minh, đạt giải thưởng thiết kế Hàn Quốc 2025.","ko":"클린랩은 스마트 주방위생 가전 전문기업으로 2025 대한민국 디자인어워드 수상 기업입니다.","en":"CLEANLAB builds smart kitchen-hygiene devices; winner of the 2025 Korea Design Award."}'::jsonb,
  'https://picsum.photos/seed/mkv-uv/800/600', array['https://picsum.photos/seed/mkv-uv/800/600','https://picsum.photos/seed/mkv-uv2/800/600'], '', '[{"type":"p","text":{"vi":"Khí hậu nóng ẩm Việt Nam khiến dụng cụ bếp dễ nhiễm khuẩn — sản phẩm giải quyết đúng nỗi lo của gia đình hiện đại.","ko":"고온다습한 베트남 기후에서 주방도구 위생 문제를 정확히 해결하는 제품입니다.","en":"Vietnam''s hot, humid climate makes kitchen tools prone to bacteria — this solves a real worry for modern families."}},{"type":"img","src":"https://picsum.photos/seed/mkv-uv-d1/900/600"}]'::jsonb,
  17, 980, true, true, '2026-07-22')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p3', 'US$ 28.50 / unit (FOB Busan)', '500 units', '35 days', 'CE/KC certified · 220V SEA plug available')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p4', 'jinseng', 'health', 'JINSENG HOUSE', 'Daegu, Korea',
  '{"vi":"Nước hồng sâm Hàn Quốc 6 năm tuổi","ko":"6년근 고려 홍삼액 스틱","en":"6-Year Korean Red Ginseng Extract Sticks"}'::jsonb, '{"vi":"Hồng sâm 6 năm tuổi dạng gói tiện lợi — quà biếu cao cấp được ưa chuộng","ko":"휴대가 간편한 스틱형 6년근 홍삼액","en":"Premium 6-year red ginseng in convenient stick packs"}'::jsonb, '{"vi":"JINSENG HOUSE chuyên chế biến hồng sâm từ vùng trồng sâm nổi tiếng của Hàn Quốc, xuất khẩu 20 năm.","ko":"진생하우스는 한국 대표 인삼 산지의 홍삼 전문 제조사로 수출 경력 20년입니다.","en":"JINSENG HOUSE processes red ginseng from Korea''s famous ginseng regions, exporting for 20 years."}'::jsonb,
  'https://picsum.photos/seed/mkv-ginseng/800/600', array['https://picsum.photos/seed/mkv-ginseng/800/600'], '', '[{"type":"p","text":{"vi":"Hồng sâm Hàn Quốc là mặt hàng quà biếu số 1 tại Việt Nam dịp Tết. Bao bì quà tặng sang trọng, sẵn sàng cho mùa cao điểm.","ko":"홍삼은 베트남 뗏(설) 시즌 1위 선물 품목입니다. 고급 선물 패키지로 성수기 대응이 가능합니다.","en":"Korean red ginseng is the #1 gift item in Vietnam during Tet. Luxury gift packaging ready for peak season."}}]'::jsonb,
  35, 2540, false, true, '2026-07-24')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p4', 'US$ 12.00 / box (30 sticks)', '1,000 boxes', '20 days', 'Gift packaging · OEM available')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p5', 'toto', 'kids', 'TOTO KIDS', 'Daegu, Korea',
  '{"vi":"Bộ đồ chơi khối nam châm ToTo Block","ko":"토토블럭 자석 블록 세트","en":"ToTo Block Magnetic Building Set"}'::jsonb, '{"vi":"Đồ chơi giáo dục STEAM an toàn — nhựa ABS không BPA, chứng nhận KC/CE","ko":"BPA-free ABS 안전 소재 STEAM 교육 자석블록","en":"Safe STEAM educational toy — BPA-free ABS, KC/CE certified"}'::jsonb, '{"vi":"TOTO KIDS sản xuất đồ chơi giáo dục 15 năm, cung cấp cho các trường mầm non Hàn Quốc.","ko":"토토키즈는 15년 경력의 교육완구 제조사로 한국 유치원·어린이집에 납품하고 있습니다.","en":"TOTO KIDS has made educational toys for 15 years, supplying Korean kindergartens."}'::jsonb,
  'https://picsum.photos/seed/mkv-block/800/600', array['https://picsum.photos/seed/mkv-block/800/600'], '', '[{"type":"p","text":{"vi":"Tầng lớp trung lưu Việt Nam đầu tư mạnh cho giáo dục sớm — đồ chơi STEAM Hàn Quốc có vị thế thương hiệu cao.","ko":"베트남 중산층의 조기교육 투자가 급증 — 한국 STEAM 완구의 브랜드 위상이 높습니다.","en":"Vietnam''s middle class invests heavily in early education — Korean STEAM toys carry strong brand equity."}}]'::jsonb,
  12, 760, false, false, '2026-07-10')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p5', 'US$ 9.80 / set (64pcs)', '2,000 sets', '40 days', 'CE/KC certified · Custom box printing')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p6', 'airio', 'tech', 'AIRIO', 'Daegu, Korea',
  '{"vi":"Máy lọc không khí mini AIRIO Cube","ko":"에어리오 큐브 미니 공기청정기","en":"AIRIO Cube Mini Air Purifier"}'::jsonb, '{"vi":"Máy lọc không khí để bàn với cảm biến PM2.5 — thiết kế giải thưởng Red Dot","ko":"PM2.5 센서 탑재 데스크 공기청정기 — 레드닷 수상 디자인","en":"Desktop air purifier with PM2.5 sensor — Red Dot award design"}'::jsonb, '{"vi":"AIRIO là startup thiết bị môi trường trong nhà, đạt giải Red Dot Design Award 2024.","ko":"에어리오는 실내환경 가전 스타트업으로 2024 레드닷 디자인 어워드를 수상했습니다.","en":"AIRIO is an indoor-environment device startup and 2024 Red Dot Design Award winner."}'::jsonb,
  'https://picsum.photos/seed/mkv-air/800/600', array['https://picsum.photos/seed/mkv-air/800/600','https://picsum.photos/seed/mkv-air2/800/600'], '', '[{"type":"p","text":{"vi":"Ô nhiễm không khí đô thị là mối quan tâm hàng đầu tại Hà Nội và TP.HCM — thị trường máy lọc khí tăng 30%/năm.","ko":"하노이·호치민의 대기오염 이슈로 공기청정기 시장이 연 30% 성장 중입니다.","en":"Urban air pollution is a top concern in Hanoi and HCMC — the purifier market grows 30% yearly."}}]'::jsonb,
  28, 2210, true, false, '2026-07-05')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p6', 'US$ 32.00 / unit (FOB Busan)', '1,000 units', '45 days', 'CE/FCC · HEPA H13 filter')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p7', 'modam', 'beauty', 'MODAM', 'Daegu, Korea',
  '{"vi":"Mặt nạ dưỡng ẩm collagen MODAM","ko":"모담 콜라겐 수분 마스크팩","en":"MODAM Collagen Hydration Mask Pack"}'::jsonb, '{"vi":"Mặt nạ K-Beauty với collagen thủy phân — bán chạy trên Shopee Hàn","ko":"가수분해 콜라겐 함유 K-뷰티 마스크팩","en":"K-Beauty sheet mask with hydrolyzed collagen — Shopee bestseller"}'::jsonb, '{"vi":"MODAM chuyên sản xuất mặt nạ giấy với công suất 500,000 miếng/ngày tại nhà máy Daegu.","ko":"모담은 대구 공장에서 일 50만 장 생산능력을 갖춘 마스크팩 전문 제조사입니다.","en":"MODAM specializes in sheet masks with 500,000 sheets/day capacity at its Daegu factory."}'::jsonb,
  'https://picsum.photos/seed/mkv-mask/800/600', array['https://picsum.photos/seed/mkv-mask/800/600'], '', '[{"type":"p","text":{"vi":"Mặt nạ giấy Hàn Quốc là sản phẩm K-Beauty phổ biến nhất tại Việt Nam với giá vốn thấp, biên lợi nhuận cao.","ko":"마스크팩은 베트남에서 가장 대중적인 K-뷰티 품목 — 낮은 원가와 높은 마진이 강점입니다.","en":"Korean sheet masks are Vietnam''s most popular K-Beauty item — low cost, high margin."}}]'::jsonb,
  19, 1430, false, false, '2026-06-28')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p7', 'US$ 0.45 / sheet (FOB Busan)', '30,000 sheets', '20 days', 'Private label OK · CPNP')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  'p8', 'dalsung', 'food', 'DALSUNG TEA', 'Daegu, Korea',
  '{"vi":"Trà gạo rang hữu cơ Dalsung","ko":"달성 유기농 현미 누룽지차","en":"Dalsung Organic Roasted Rice Tea"}'::jsonb, '{"vi":"Trà gạo rang hữu cơ không caffeine — vị ấm quen thuộc với người Việt","ko":"카페인 없는 유기농 현미 누룽지차","en":"Caffeine-free organic roasted rice tea — a familiar warm taste"}'::jsonb, '{"vi":"DALSUNG TEA trồng và chế biến trà tại vùng Dalseong, Daegu theo chuẩn hữu cơ Hàn Quốc.","ko":"달성티는 대구 달성군에서 유기농 인증 기준으로 차를 재배·가공합니다.","en":"DALSUNG TEA grows and processes tea in Dalseong, Daegu under Korean organic standards."}'::jsonb,
  'https://picsum.photos/seed/mkv-tea/800/600', array['https://picsum.photos/seed/mkv-tea/800/600'], '', '[{"type":"p","text":{"vi":"Người tiêu dùng Việt ngày càng tìm đồ uống lành mạnh không caffeine — trà gạo rang Hàn Quốc đang lên xu hướng.","ko":"베트남 소비자의 건강음료 수요 증가로 한국 곡물차가 트렌드로 부상 중입니다.","en":"Vietnamese consumers increasingly seek healthy caffeine-free drinks — Korean grain teas are trending."}}]'::jsonb,
  8, 520, false, true, '2026-07-25')
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  'p8', 'US$ 3.10 / box (20 bags)', '5,000 boxes', '30 days', 'Organic cert. (Korea) · OEM')
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();

-- ---------- 칼럼 3건 ----------
insert into columns_post (id,cat,title,excerpt,body,img,date) values (
  'c1', '{"vi":"Xu hướng","ko":"트렌드","en":"Trends"}'::jsonb, '{"vi":"5 ngành hàng Hàn Quốc tăng trưởng nhanh nhất tại Việt Nam 2026","ko":"2026 베트남에서 가장 빠르게 성장하는 한국 제품 카테고리 5","en":"5 fastest-growing Korean product categories in Vietnam, 2026"}'::jsonb, '{"vi":"Từ mỹ phẩm đến thực phẩm tiện lợi — dữ liệu nhập khẩu cho thấy nhu cầu hàng Hàn tại Việt Nam đang bùng nổ ở những ngành nào.","ko":"화장품부터 간편식까지 — 수입 데이터로 보는 베트남 내 한국 제품 수요 급증 카테고리.","en":"From cosmetics to convenience food — import data shows where Korean product demand is booming in Vietnam."}'::jsonb, '{"vi":"<p>Kim ngạch xuất khẩu hàng tiêu dùng Hàn Quốc sang Việt Nam tiếp tục tăng mạnh. Trong bài viết này, MAKENOV phân tích 5 ngành hàng có tốc độ tăng trưởng nhanh nhất: mỹ phẩm, thực phẩm tiện lợi, đồ gia dụng thông minh, thực phẩm chức năng và đồ chơi giáo dục.</p><p>Đặc biệt, các sản phẩm có chứng nhận (CPNP, HACCP, CE) và câu chuyện thương hiệu rõ ràng có tỷ lệ chốt đơn cao hơn 3 lần.</p>","ko":"<p>한국 소비재의 베트남 수출이 계속 급증하고 있습니다. 이번 칼럼에서는 화장품, 간편식, 스마트 리빙가전, 건강기능식품, 교육완구 등 성장 상위 5개 카테고리를 분석합니다.</p><p>특히 인증(CPNP·HACCP·CE)과 명확한 브랜드 스토리를 갖춘 제품의 성약률이 3배 높았습니다.</p>","en":"<p>Korean consumer goods exports to Vietnam keep surging. In this article, MAKENOV analyzes the 5 fastest-growing categories: cosmetics, convenience food, smart living appliances, health supplements, and educational toys.</p><p>Notably, products with certifications (CPNP, HACCP, CE) and a clear brand story close deals 3x more often.</p>"}'::jsonb, 'https://picsum.photos/seed/mkv-col1/800/450', '2026-07-21')
on conflict (id) do update set
  cat=excluded.cat, title=excluded.title, excerpt=excluded.excerpt,
  body=excluded.body, img=excluded.img, date=excluded.date;

insert into columns_post (id,cat,title,excerpt,body,img,date) values (
  'c2', '{"vi":"Hướng dẫn","ko":"가이드","en":"Guide"}'::jsonb, '{"vi":"Nhà mua hàng Việt Nam cần chuẩn bị gì khi nhập hàng Hàn Quốc lần đầu?","ko":"베트남 바이어가 한국 제품 첫 수입 시 준비해야 할 것들","en":"What Vietnamese buyers should prepare for their first Korean import"}'::jsonb, '{"vi":"Thủ tục công bố sản phẩm, MOQ, điều kiện thanh toán — hướng dẫn từng bước cho nhà mua hàng lần đầu nhập hàng Hàn.","ko":"제품 공고 절차, MOQ, 결제 조건 — 첫 수입 바이어를 위한 단계별 가이드.","en":"Product notification, MOQ, payment terms — a step-by-step guide for first-time importers."}'::jsonb, '{"vi":"<p>Nhập khẩu hàng Hàn Quốc lần đầu không khó nếu bạn chuẩn bị đúng: (1) xác định mã HS và thuế nhập khẩu theo VKFTA, (2) yêu cầu nhà cung cấp hỗ trợ hồ sơ công bố, (3) đàm phán MOQ linh hoạt cho đơn hàng thử nghiệm.</p><p>MAKENOV kết nối bạn trực tiếp với nhà sản xuất — không qua trung gian.</p>","ko":"<p>첫 수입도 준비만 잘하면 어렵지 않습니다: (1) VKFTA 기준 HS코드·관세 확인, (2) 공급사에 공고 서류 지원 요청, (3) 테스트 오더용 유연한 MOQ 협상.</p><p>MAKENOV는 중간상 없이 제조사와 직접 연결합니다.</p>","en":"<p>First imports are manageable with the right prep: (1) check HS codes and VKFTA tariffs, (2) ask suppliers for notification dossier support, (3) negotiate flexible MOQs for trial orders.</p><p>MAKENOV connects you directly with manufacturers — no middlemen.</p>"}'::jsonb, 'https://picsum.photos/seed/mkv-col2/800/450', '2026-07-15')
on conflict (id) do update set
  cat=excluded.cat, title=excluded.title, excerpt=excluded.excerpt,
  body=excluded.body, img=excluded.img, date=excluded.date;

insert into columns_post (id,cat,title,excerpt,body,img,date) values (
  'c3', '{"vi":"Câu chuyện","ko":"스토리","en":"Story"}'::jsonb, '{"vi":"Vì sao Daegu là thủ phủ sản xuất mới của K-Beauty và K-Food?","ko":"대구가 K-뷰티·K-푸드의 새로운 제조 허브인 이유","en":"Why Daegu is the new manufacturing hub of K-Beauty and K-Food"}'::jsonb, '{"vi":"Thành phố lớn thứ 4 Hàn Quốc sở hữu hệ sinh thái sản xuất mạnh — và những thương hiệu ẩn mình đang chờ được khám phá.","ko":"한국 4대 도시 대구의 제조 생태계, 그리고 아직 알려지지 않은 강소 브랜드들.","en":"Korea''s 4th-largest city has a powerful manufacturing ecosystem — with hidden brands waiting to be discovered."}'::jsonb, '{"vi":"<p>Daegu từ lâu là trung tâm dệt may và cơ khí của Hàn Quốc, nay chuyển mình thành cứ điểm của mỹ phẩm, thực phẩm và thiết bị thông minh. Chi phí sản xuất cạnh tranh hơn Seoul 20-30% trong khi chất lượng tương đương.</p><p>MAKENOV khởi đầu từ Daegu — giới thiệu những nhà sản xuất thực lực chưa từng xuất hiện trên các nền tảng toàn cầu.</p>","ko":"<p>섬유·기계의 도시 대구가 화장품·식품·스마트기기 제조 거점으로 변신 중입니다. 서울 대비 20~30% 낮은 생산비용에 동등한 품질이 강점입니다.</p><p>MAKENOV는 대구에서 시작합니다 — 글로벌 플랫폼에 소개된 적 없는 실력 있는 제조사들을 발굴합니다.</p>","en":"<p>Long Korea''s textile and machinery hub, Daegu is transforming into a base for cosmetics, food, and smart devices. Production costs run 20-30% below Seoul at equal quality.</p><p>MAKENOV starts from Daegu — surfacing capable manufacturers never before seen on global platforms.</p>"}'::jsonb, 'https://picsum.photos/seed/mkv-col3/800/450', '2026-07-08')
on conflict (id) do update set
  cat=excluded.cat, title=excluded.title, excerpt=excluded.excerpt,
  body=excluded.body, img=excluded.img, date=excluded.date;

-- ---------- 홈 히어로 4장 ----------
insert into hero_slides (id,art,link,kicker,title,sub,sort) values (
  'h1', 'assets/img/hero/hero-global.svg', 'directory.html', '{"vi":"Không cần bay, không cần hội chợ","ko":"전시회, 수출상담회","en":"No flights. No trade fairs."}'::jsonb, '{"vi":"Đi hội chợ đến bao giờ?\nMột cú click là đủ.","ko":"전시회, 수출상담회\n언제까지 다니실 건가요?","en":"How long will you keep\nflying to trade shows?"}'::jsonb, '{"vi":"Ngồi tại văn phòng, click một lần — thông tin sản phẩm đổi mới từ khắp thế giới đến với bạn.","ko":"사무실에 앉아서 클릭 한 번이면, 전 세계 혁신제품 정보가 찾아옵니다.","en":"Stay at your desk. One click brings the world''s innovative products to you."}'::jsonb, 0)
on conflict (id) do update set
  art=excluded.art, link=excluded.link, kicker=excluded.kicker,
  title=excluded.title, sub=excluded.sub, sort=excluded.sort;

insert into hero_slides (id,art,link,kicker,title,sub,sort) values (
  'h2', 'assets/img/hero/hero-scale.svg', 'directory.html', '{"vi":"Chi phí một chuyến công tác","ko":"출장 한 번 비용으로","en":"The cost of one business trip"}'::jsonb, '{"vi":"Một chuyến công tác gặp 5 nhà máy.\nỞ đây gặp hàng trăm.","ko":"출장 한 번에 공장 다섯 곳,\n여기선 수백 개 제품.","en":"One trip: five factories.\nHere: hundreds of products."}'::jsonb, '{"vi":"Vé máy bay, khách sạn, thông dịch — thay bằng danh mục mở 24 giờ mỗi ngày.","ko":"항공권·숙박·통역 대신, 24시간 열려 있는 제품 디렉토리로.","en":"Skip the airfare, hotels and interpreters — browse a directory that never closes."}'::jsonb, 1)
on conflict (id) do update set
  art=excluded.art, link=excluded.link, kicker=excluded.kicker,
  title=excluded.title, sub=excluded.sub, sort=excluded.sort;

insert into hero_slides (id,art,link,kicker,title,sub,sort) values (
  'h3', 'assets/img/hero/hero-spec.svg', 'companies.html', '{"vi":"Chỉ nhà sản xuất đã xác thực","ko":"검증된 제조사만","en":"Verified manufacturers only"}'::jsonb, '{"vi":"Giá, MOQ, thời gian giao hàng\ntrên cùng một màn hình.","ko":"가격, MOQ, 납기까지\n한 화면에서 확인하세요.","en":"Price, MOQ and lead time\non a single screen."}'::jsonb, '{"vi":"Mọi nhà sản xuất đều qua xác thực doanh nghiệp. Không còn phải dò hỏi từng nơi.","ko":"모든 제조사가 사업자 인증을 거칩니다. 하나하나 수소문할 필요 없습니다.","en":"Every manufacturer passes business verification. No more chasing down each supplier."}'::jsonb, 2)
on conflict (id) do update set
  art=excluded.art, link=excluded.link, kicker=excluded.kicker,
  title=excluded.title, sub=excluded.sub, sort=excluded.sort;

insert into hero_slides (id,art,link,kicker,title,sub,sort) values (
  'h4', 'assets/img/hero/hero-inquiry.svg', 'mypage.html', '{"vi":"Gửi yêu cầu hàng loạt","ko":"일괄 견적 요청","en":"Bulk inquiry"}'::jsonb, '{"vi":"Chọn sản phẩm quan tâm,\ngửi báo giá một lần.","ko":"관심 제품을 담고,\n한 번에 견적을 받으세요.","en":"Save what interests you,\nrequest every quote at once."}'::jsonb, '{"vi":"Không cần liên hệ từng nhà sản xuất. Thêm vào danh sách rồi gửi yêu cầu cùng lúc.","ko":"제조사마다 따로 연락할 필요 없습니다. 담아두고 한 번에 문의하세요.","en":"Stop emailing suppliers one by one. Add to your list and send a single request."}'::jsonb, 3)
on conflict (id) do update set
  art=excluded.art, link=excluded.link, kicker=excluded.kicker,
  title=excluded.title, sub=excluded.sub, sort=excluded.sort;

-- ============================================================
--  마지막 단계 — 관리자 계정 지정
--  1) Supabase → Authentication → Users → Add user 로 관리자 계정을 만듭니다.
--  2) 그 계정의 UID 를 복사해 아래 주석을 풀고 실행하세요.
-- ============================================================
-- insert into admins (user_id) values ('여기에-관리자-UID-붙여넣기')
-- on conflict do nothing;
