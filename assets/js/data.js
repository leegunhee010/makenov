/* MAKENOV seed data — single source of truth (admin overrides via localStorage 'mk_products_override')
   Product content fields are {vi,ko,en} objects rendered via L(). Images: placeholder (교체 예정). */

/* ============================================================
   국가별 사업자 인증 설정
   method: 'mst'    베트남 세금코드 → 국세청 조회 API (무료·무키, 회사명 자동입력)
           'brn'    한국 사업자등록번호 → 체크섬 검증(무료·오프라인) + 국세청 API(키 발급 시)
           'domain' 회사 이메일 도메인 검증 (무료·오프라인, 무료메일 차단)
   ============================================================ */
const MK_COUNTRIES = [
  { code:'VN', dial:'+84', flag:'🇻🇳', method:'mst',    messenger:'Zalo',      phEx:'0901234567',
    name:{vi:'Việt Nam', ko:'베트남', en:'Vietnam'} },
  { code:'KR', dial:'+82', flag:'🇰🇷', method:'brn',    messenger:'KakaoTalk', phEx:'01012345678',
    name:{vi:'Hàn Quốc', ko:'대한민국', en:'South Korea'} },
  { code:'US', dial:'+1',  flag:'🇺🇸', method:'domain', messenger:'WhatsApp',  phEx:'2125550123',
    name:{vi:'Hoa Kỳ', ko:'미국', en:'United States'} },
  { code:'JP', dial:'+81', flag:'🇯🇵', method:'domain', messenger:'LINE',      phEx:'9012345678',
    name:{vi:'Nhật Bản', ko:'일본', en:'Japan'} },
  { code:'CN', dial:'+86', flag:'🇨🇳', method:'domain', messenger:'WeChat',    phEx:'13812345678',
    name:{vi:'Trung Quốc', ko:'중국', en:'China'} },
  { code:'TH', dial:'+66', flag:'🇹🇭', method:'domain', messenger:'LINE',      phEx:'812345678',
    name:{vi:'Thái Lan', ko:'태국', en:'Thailand'} },
  { code:'ID', dial:'+62', flag:'🇮🇩', method:'domain', messenger:'WhatsApp',  phEx:'81234567890',
    name:{vi:'Indonesia', ko:'인도네시아', en:'Indonesia'} },
  { code:'SG', dial:'+65', flag:'🇸🇬', method:'domain', messenger:'WhatsApp',  phEx:'81234567',
    name:{vi:'Singapore', ko:'싱가포르', en:'Singapore'} },
  { code:'MY', dial:'+60', flag:'🇲🇾', method:'domain', messenger:'WhatsApp',  phEx:'123456789',
    name:{vi:'Malaysia', ko:'말레이시아', en:'Malaysia'} },
  { code:'PH', dial:'+63', flag:'🇵🇭', method:'domain', messenger:'Viber',     phEx:'9171234567',
    name:{vi:'Philippines', ko:'필리핀', en:'Philippines'} },
  { code:'IN', dial:'+91', flag:'🇮🇳', method:'domain', messenger:'WhatsApp',  phEx:'9812345678',
    name:{vi:'Ấn Độ', ko:'인도', en:'India'} },
  { code:'OT', dial:'+',   flag:'', method:'domain', messenger:'WhatsApp',  phEx:'',
    name:{vi:'Quốc gia khác', ko:'기타 국가', en:'Other country'} },
];
function mkCountry(code){ return MK_COUNTRIES.find(c=>c.code===code) || MK_COUNTRIES[0]; }

/* ============================================================
   기업(제조사) — 제품과 1:N 연결. product.companyId → company.id
   ============================================================ */
const MK_COMPANIES = [
  /*  실제 기업 — lgind.com / firessak.com 공개정보 기준, 사업자번호 국세청 조회 완료 */
  { id:'lgind', brand:'FIRESSAK', logo:'https://picsum.photos/seed/mkc-lgind/200/200',
    cover:'https://picsum.photos/seed/mkc-lgind-cv/1200/400', cat:'tech',
    name:{vi:'LARGE Co., Ltd. (FIRESSAK)', ko:'(주)라지 · 파이어싹', en:'LARGE Co., Ltd. (FIRESSAK)'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구 달성군 테크노폴리스', en:'Daegu, Korea'},
    since:'2009', staff:'—', export:'—', moqPolicy:'문의',
    brn:'503-81-87451', ceo:'박철현', tel:'1533-3840', site:'firessak.com',
    certs:['IATF 16949:2016','이노비즈','벤처기업','강소기업','소재부품 전문기업','기업부설연구소'],
    tagline:{vi:'Chăn chữa cháy chuyên dụng cho xe điện, từ nền tảng vật liệu composite ô tô',
      ko:'자동차 복합소재 기술로 만든 전기차 화재 진압 솔루션',
      en:'EV fire-suppression solutions built on automotive composite materials'},
    intro:{vi:'LARGE Co., Ltd. (thành lập 12/2009, Daegu) là nhà sản xuất linh kiện ô tô chuyên về vải sợi thủy tinh, vật liệu composite nhiệt dẻo và vật liệu cách nhiệt hệ thống xả. Công ty đạt chứng nhận IATF 16949:2016 và có viện nghiên cứu riêng từ năm 2010, từng ký thỏa thuận phát triển chung với Fraunhofer ICT (Đức) năm 2016. Thương hiệu FIRESSAK ứng dụng nền tảng vật liệu chịu nhiệt này vào chăn chữa cháy cho xe điện, đã cung cấp cho các cơ quan công như Sở PCCC Gyeongnam và Tổng công ty Phát triển Đô thị Seongnam.',
      ko:'(주)라지는 2009년 12월 설립된 대구 소재 자동차부품 제조사로, 유리섬유 직물·열가소성 복합재료·배기계 단열재를 주력으로 합니다. IATF 16949:2016 인증을 보유하고 2010년 기업부설연구소를 설립했으며, 2016년 독일 Fraunhofer ICT와 복합재 공동 기술개발 협약을 체결했습니다. 이 내열소재 기술을 응용한 브랜드가 파이어싹으로, 경남소방본부·성남도시개발공사 등 공공기관에 납품 실적이 있습니다.',
      en:'LARGE Co., Ltd. (founded Dec 2009, Daegu) manufactures automotive components centred on glass-fibre textiles, thermoplastic composites and exhaust-system insulation. It holds IATF 16949:2016, established an in-house research institute in 2010, and signed a joint composite development agreement with Germany\'s Fraunhofer ICT in 2016. Its FIRESSAK brand applies that heat-resistant material base to EV fire blankets, with supply records to public bodies including the Gyeongnam Fire Department and Seongnam Urban Development Corp.'} },

  { id:'daon', brand:'DAON COSMETIC', logo:'https://picsum.photos/seed/mkc-daon/200/200',
    cover:'https://picsum.photos/seed/mkc-daon-cv/1200/400', cat:'beauty',
    name:{vi:'DAON COSMETIC', ko:'다온코스메틱', en:'DAON COSMETIC'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'2014', staff:'52', export:'14', moqPolicy:'3,000',
    certs:['CGMP','CPNP','FDA','ISO 22716'],
    tagline:{vi:'12 năm OEM/ODM cho các thương hiệu K-Beauty', ko:'K-뷰티 브랜드 OEM/ODM 12년', en:'12 years of K-Beauty OEM/ODM'},
    intro:{vi:'DAON COSMETIC là nhà sản xuất mỹ phẩm tại Daegu với 12 năm kinh nghiệm OEM/ODM cho các thương hiệu K-Beauty. Nhà máy đạt chuẩn CGMP, xuất khẩu sang 14 quốc gia. Hỗ trợ đầy đủ hồ sơ công bố mỹ phẩm và phát triển công thức riêng.',
      ko:'다온코스메틱은 대구 소재 화장품 제조사로, K-뷰티 브랜드 OEM/ODM 12년 경력을 보유하고 있습니다. CGMP 인증 공장에서 14개국에 수출하고 있으며, 화장품 공고 서류 지원과 자체 처방 개발이 가능합니다.',
      en:'DAON COSMETIC is a Daegu-based manufacturer with 12 years of K-Beauty OEM/ODM experience. Its CGMP-certified factory exports to 14 countries, with full notification-dossier support and in-house formulation.'} },

  { id:'hanil', brand:'HANIL FOOD', logo:'https://picsum.photos/seed/mkc-hanil/200/200',
    cover:'https://picsum.photos/seed/mkc-hanil-cv/1200/400', cat:'food',
    name:{vi:'HANIL FOOD', ko:'하니일푸드', en:'HANIL FOOD'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'1998', staff:'120', export:'9', moqPolicy:'10,000',
    certs:['HACCP','ISO 22000','Halal(진행중)'],
    tagline:{vi:'Thực phẩm tiện lợi Hàn Quốc từ 1998', ko:'1998년부터 한국 간편식 전문', en:'Korean convenience food since 1998'},
    intro:{vi:'HANIL FOOD sản xuất thực phẩm tiện lợi Hàn Quốc từ năm 1998. Dây chuyền đạt chuẩn HACCP, sản phẩm có mặt tại CU và GS25 trên toàn Hàn Quốc. Chuyên các dòng tự sôi và ăn liền cho kênh cửa hàng tiện lợi.',
      ko:'하니일푸드는 1998년부터 한국 간편식품을 생산해온 기업입니다. HACCP 인증 라인을 갖추고 전국 CU·GS25에 입점해 있으며, 편의점 채널용 자체발열·즉석식 라인에 강점이 있습니다.',
      en:'HANIL FOOD has produced Korean convenience food since 1998. HACCP-certified lines supply CU and GS25 nationwide, with a focus on self-heating and instant lines for convenience-store channels.'} },

  { id:'cleanlab', brand:'CLEANLAB', logo:'https://picsum.photos/seed/mkc-clean/200/200',
    cover:'https://picsum.photos/seed/mkc-clean-cv/1200/400', cat:'living',
    name:{vi:'CLEANLAB', ko:'클린랩', en:'CLEANLAB'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'2019', staff:'28', export:'6', moqPolicy:'500',
    certs:['CE','KC','RoHS'],
    tagline:{vi:'Thiết bị vệ sinh nhà bếp thông minh', ko:'스마트 주방위생 가전', en:'Smart kitchen-hygiene devices'},
    intro:{vi:'CLEANLAB phát triển thiết bị vệ sinh nhà bếp thông minh, đạt giải thưởng thiết kế Hàn Quốc 2025. Sản phẩm dùng UV-C LED, có sẵn phiên bản điện áp 220V cho thị trường Đông Nam Á.',
      ko:'클린랩은 스마트 주방위생 가전 전문기업으로 2025 대한민국 디자인어워드 수상 기업입니다. UV-C LED 기반 제품을 개발하며 동남아 시장용 220V 사양을 보유하고 있습니다.',
      en:'CLEANLAB builds smart kitchen-hygiene devices and won the 2025 Korea Design Award. Its UV-C LED products ship with 220V variants for Southeast Asian markets.'} },

  { id:'jinseng', brand:'JINSENG HOUSE', logo:'https://picsum.photos/seed/mkc-jin/200/200',
    cover:'https://picsum.photos/seed/mkc-jin-cv/1200/400', cat:'health',
    name:{vi:'JINSENG HOUSE', ko:'진생하우스', en:'JINSENG HOUSE'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'2006', staff:'44', export:'20', moqPolicy:'1,000',
    certs:['HACCP','건강기능식품 GMP'],
    tagline:{vi:'Hồng sâm 6 năm tuổi, xuất khẩu 20 năm', ko:'6년근 홍삼 전문, 수출 20년', en:'6-year red ginseng, 20 years exporting'},
    intro:{vi:'JINSENG HOUSE chuyên chế biến hồng sâm từ vùng trồng sâm nổi tiếng của Hàn Quốc với 20 năm kinh nghiệm xuất khẩu. Cung cấp đa dạng quy cách quà tặng, phù hợp mùa cao điểm Tết.',
      ko:'진생하우스는 한국 대표 인삼 산지의 홍삼 전문 제조사로 수출 경력 20년입니다. 다양한 선물 패키지 규격을 보유해 뗏(설) 성수기 대응이 가능합니다.',
      en:'JINSENG HOUSE processes red ginseng from Korea\'s famous ginseng regions with 20 years of export experience, offering a range of gift formats for peak seasons.'} },

  { id:'toto', brand:'TOTO KIDS', logo:'https://picsum.photos/seed/mkc-toto/200/200',
    cover:'https://picsum.photos/seed/mkc-toto-cv/1200/400', cat:'kids',
    name:{vi:'TOTO KIDS', ko:'토토키즈', en:'TOTO KIDS'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'2011', staff:'36', export:'11', moqPolicy:'2,000',
    certs:['KC','CE','EN71'],
    tagline:{vi:'Đồ chơi giáo dục cho trường mầm non Hàn Quốc', ko:'한국 유치원 납품 교육완구', en:'Educational toys for Korean kindergartens'},
    intro:{vi:'TOTO KIDS sản xuất đồ chơi giáo dục trong 15 năm, cung cấp cho các trường mầm non Hàn Quốc. Vật liệu ABS không BPA, hỗ trợ in hộp theo yêu cầu.',
      ko:'토토키즈는 15년 경력의 교육완구 제조사로 한국 유치원·어린이집에 납품하고 있습니다. BPA-free ABS 소재를 사용하며 주문 패키지 인쇄를 지원합니다.',
      en:'TOTO KIDS has made educational toys for 15 years, supplying Korean kindergartens. BPA-free ABS materials with custom box printing available.'} },

  { id:'airio', brand:'AIRIO', logo:'https://picsum.photos/seed/mkc-airio/200/200',
    cover:'https://picsum.photos/seed/mkc-airio-cv/1200/400', cat:'tech',
    name:{vi:'AIRIO', ko:'에어리오', en:'AIRIO'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'2020', staff:'19', export:'5', moqPolicy:'1,000',
    certs:['CE','FCC','KC'],
    tagline:{vi:'Thiết bị môi trường trong nhà, giải Red Dot 2024', ko:'실내환경 가전, 2024 레드닷 수상', en:'Indoor-environment devices, Red Dot 2024'},
    intro:{vi:'AIRIO là startup thiết bị môi trường trong nhà, đạt giải Red Dot Design Award 2024. Sử dụng bộ lọc HEPA H13 và cảm biến PM2.5, tập trung vào dòng để bàn nhỏ gọn.',
      ko:'에어리오는 실내환경 가전 스타트업으로 2024 레드닷 디자인 어워드를 수상했습니다. HEPA H13 필터와 PM2.5 센서를 적용한 컴팩트 데스크 라인에 집중하고 있습니다.',
      en:'AIRIO is an indoor-environment device startup and 2024 Red Dot Design Award winner, focused on compact desktop units with HEPA H13 filters and PM2.5 sensors.'} },

  { id:'modam', brand:'MODAM', logo:'https://picsum.photos/seed/mkc-modam/200/200',
    cover:'https://picsum.photos/seed/mkc-modam-cv/1200/400', cat:'beauty',
    name:{vi:'MODAM', ko:'모담', en:'MODAM'},
    location:{vi:'Daegu, Hàn Quốc', ko:'대구광역시', en:'Daegu, Korea'},
    since:'2016', staff:'67', export:'8', moqPolicy:'30,000',
    certs:['CGMP','CPNP'],
    tagline:{vi:'Công suất 500.000 miếng mặt nạ mỗi ngày', ko:'일 50만 장 마스크팩 생산능력', en:'500,000 sheet masks per day'},
    intro:{vi:'MODAM chuyên sản xuất mặt nạ giấy với công suất 500.000 miếng mỗi ngày tại nhà máy Daegu. Nhận private label với giá vốn cạnh tranh cho các đơn hàng lớn.',
      ko:'모담은 대구 공장에서 일 50만 장 생산능력을 갖춘 마스크팩 전문 제조사입니다. 대량 주문에 경쟁력 있는 원가로 프라이빗 라벨을 제공합니다.',
      en:'MODAM specializes in sheet masks with 500,000 sheets/day capacity at its Daegu factory, offering private label at competitive cost for large orders.'} },

  { id:'dalsung', brand:'DALSUNG TEA', logo:'https://picsum.photos/seed/mkc-dal/200/200',
    cover:'https://picsum.photos/seed/mkc-dal-cv/1200/400', cat:'food',
    name:{vi:'DALSUNG TEA', ko:'달성티', en:'DALSUNG TEA'},
    location:{vi:'Dalseong, Daegu', ko:'대구 달성군', en:'Dalseong, Daegu'},
    since:'2009', staff:'14', export:'4', moqPolicy:'5,000',
    certs:['유기농 인증(한국)','HACCP'],
    tagline:{vi:'Trà hữu cơ trồng và chế biến tại Dalseong', ko:'달성군 직영 유기농 차 재배·가공', en:'Organic tea grown and processed in Dalseong'},
    intro:{vi:'DALSUNG TEA trồng và chế biến trà tại vùng Dalseong, Daegu theo chuẩn hữu cơ Hàn Quốc. Chuyên dòng trà ngũ cốc không caffeine, nhận OEM quy cách túi lọc.',
      ko:'달성티는 대구 달성군에서 유기농 인증 기준으로 차를 재배·가공합니다. 카페인 없는 곡물차 라인이 주력이며 티백 규격 OEM이 가능합니다.',
      en:'DALSUNG TEA grows and processes tea in Dalseong, Daegu under Korean organic standards, specializing in caffeine-free grain teas with tea-bag OEM available.'} },

  /*  실제 기업 — 웰빙헬스팜 3wbmall.com / wh-pharm.com 공개정보 기준 (사업자번호·주소·대표 실값) */
  { id:'wellbeing', brand:'WELLBEING HEALTHFARM', logo:'https://3wbmall.com/web/upload/weskin11/kr/main/logo.png',
    cover:'https://3wbmall.com/web/upload/weskin11/kr/main/210114_pc_top.jpg', cat:'beauty',
    name:{vi:'WELLBEING HEALTHFARM', ko:'(주)웰빙헬스팜', en:'WELLBEING HEALTHFARM Co., Ltd.'},
    location:{vi:'Incheon, Hàn Quốc', ko:'인천 남동구', en:'Incheon, Korea'},
    since:'2018', staff:'—', export:'—', moqPolicy:'문의',
    brn:'118-81-22304', ceo:'박진수', tel:'070-7532-4508', site:'wh-pharm.com',
    certs:['화장품 제조판매업'],
    tagline:{vi:'Thương hiệu chăm sóc bàn chân K-Beauty — Goeunbal (Bàn chân mịn màng)',
      ko:'대표 풋케어 브랜드 명품 고운발 — 발 각질·보습 전문',
      en:'K-Beauty foot-care brand behind Goeunbal premium foot cream'},
    intro:{vi:'WELLBEING HEALTHFARM (Incheon, Hàn Quốc) là nhà sản xuất mỹ phẩm chăm sóc sức khỏe, nổi bật với thương hiệu chăm sóc bàn chân "Goeunbal". Sản phẩm chủ lực là kem dưỡng gót chân chứa urea, được bán trực tiếp qua kênh chính hãng 3wbmall và Naver, với hàng nghìn đánh giá của người dùng Hàn Quốc.',
      ko:'(주)웰빙헬스팜은 인천 남동구에 위치한 건강·화장품 제조기업으로, 대표 풋케어 브랜드 "명품 고운발"을 운영합니다. 우레아 성분 기반 발 각질·보습 크림을 자사몰(3wbmall)과 네이버에서 직접 판매하며 다수의 국내 사용후기를 보유하고 있습니다.',
      en:'WELLBEING HEALTHFARM (Incheon, Korea) is a health & cosmetics manufacturer known for its "Goeunbal" foot-care brand. Its flagship urea-based foot cream sells directly through its own mall (3wbmall) and Naver, with thousands of Korean user reviews.'} },
];
function mkCompany(id){ return MK_COMPANIES.find(c=>c.id===id); }
function mkCompanyOf(product){
  if(!product) return null;
  return MK_COMPANIES.find(c=>c.id===product.companyId)
      || MK_COMPANIES.find(c=>c.brand===product.brand) || null;
}
function mkCompanyProducts(id){
  const c = mkCompany(id); if(!c) return [];
  return MK_PRODUCTS.filter(p => p.companyId===id || p.brand===c.brand);
}

/* 무료 이메일 도메인 — 회사 도메인 인증에서 차단 */
const MK_FREE_MAIL = new Set(['gmail.com','googlemail.com','naver.com','daum.net','hanmail.net','nate.com','kakao.com',
  'yahoo.com','yahoo.co.jp','ymail.com','hotmail.com','outlook.com','live.com','msn.com','icloud.com','me.com','aol.com',
  'qq.com','163.com','126.com','sina.com','foxmail.com','proton.me','protonmail.com','mail.ru','yandex.com','gmx.com',
  'zoho.com','tutanota.com','hushmail.com','mail.com','inbox.com','fastmail.com','yopmail.com','mailinator.com']);

const MK_CATEGORIES = [
  { id:'beauty',  name:{vi:'Mỹ phẩm & Làm đẹp', ko:'뷰티·화장품', en:'Beauty & Cosmetics'} },
  { id:'food',    name:{vi:'Thực phẩm & Đồ uống', ko:'식품·음료', en:'Food & Beverage'} },
  { id:'living',  name:{vi:'Đồ gia dụng', ko:'리빙·생활용품', en:'Home & Living'} },
  { id:'health',  name:{vi:'Sức khỏe & Thể thao', ko:'헬스·건강', en:'Health & Wellness'} },
  { id:'kids',    name:{vi:'Mẹ & Bé', ko:'키즈·육아', en:'Kids & Baby'} },
  { id:'tech',    name:{vi:'Thiết bị & Công nghệ', ko:'테크·가전', en:'Tech & Devices'} },
];

const MK_PRODUCTS = [
  /*  실제 제품 — 파이어싹 질식소화덮개 FS-EV54S ((주)라지) */
  {
    id:'p0', cat:'tech', featured:true, isNew:true, createdAt:'2026-07-27',
    companyId:'lgind', brand:'FIRESSAK', origin:'Daegu, Korea',
    name:{vi:'Chăn chữa cháy xe điện FIRESSAK FS-EV54S',
          ko:'파이어싹 질식소화덮개 FS-EV54S',
          en:'FIRESSAK EV Fire Blanket FS-EV54S'},
    tagline:{vi:'Chăn phủ dập lửa xe điện — cách ly oxy, kiểm soát cháy pin lithium tại chỗ',
             ko:'전기차 화재를 덮어서 진압하는 질식소화덮개 — 산소를 차단해 현장에서 확산을 막습니다',
             en:'Smothering blanket for EV fires — cuts off oxygen to contain lithium battery fires on the spot'},
    img:'https://picsum.photos/seed/mkv-firessak/800/600',
    gallery:['https://picsum.photos/seed/mkv-firessak/800/600',
             'https://picsum.photos/seed/mkv-firessak2/800/600',
             'https://picsum.photos/seed/mkv-firessak3/800/600'],
    video:'', inquiries:0, views:0,
    price:'문의 (Ask for quotation)', moq:'문의', lead:'문의',
    terms:'모델 FS-EV54S · 시험성적서 보유 · 공공기관 납품 실적',
    brandStory:{vi:'FIRESSAK là thương hiệu của LARGE Co., Ltd., ứng dụng công nghệ vật liệu chịu nhiệt dùng trong ngành ô tô vào thiết bị chữa cháy.',
                ko:'파이어싹은 (주)라지의 브랜드로, 자동차용 내열 복합소재 기술을 화재 진압 장비에 적용한 제품입니다.',
                en:'FIRESSAK is a brand of LARGE Co., Ltd., applying automotive heat-resistant composite technology to fire-suppression equipment.'},
    detail:[
      {type:'p', text:{
        vi:'Xe điện cháy do pin lithium rất khó dập bằng nước vì hiện tượng tự bốc cháy lại. Chăn FS-EV54S phủ trùm toàn bộ phương tiện để cách ly oxy, ngăn lửa lan sang xe và công trình lân cận trong lúc chờ lực lượng chữa cháy.',
        ko:'전기차 배터리 화재는 재발화 특성 때문에 물만으로는 진압이 어렵습니다. FS-EV54S는 차량 전체를 덮어 산소를 차단함으로써, 소방대 도착 전까지 인접 차량·건물로의 확산을 막는 역할을 합니다.',
        en:'EV battery fires are hard to extinguish with water alone because of re-ignition. The FS-EV54S covers the whole vehicle to cut off oxygen, containing spread to adjacent vehicles and structures until fire crews arrive.'}},
      {type:'img', src:'https://picsum.photos/seed/mkv-firessak-d1/900/600'},
      {type:'p', text:{
        vi:'Phù hợp cho bãi đỗ xe ngầm, trạm sạc, kho logistics, bến xe và đội xe doanh nghiệp. Nhà sản xuất có chứng nhận IATF 16949:2016 và giấy chứng nhận kết quả thử nghiệm cho model này.',
        ko:'지하주차장·충전소·물류창고·차고지·법인 차량 운영처에 적합합니다. 제조사는 IATF 16949:2016 인증을 보유하고 있으며, 해당 모델의 시험성적서를 제공합니다.',
        en:'Suited to underground car parks, charging stations, logistics warehouses, depots and corporate fleets. The maker holds IATF 16949:2016 and provides a test report for this model.'}},
    ]
  },
  {
    id:'p1', cat:'beauty', featured:true, isNew:true, createdAt:'2026-07-20',
    companyId:'daon', brand:'DAON COSMETIC', origin:'Daegu, Korea',
    name:{vi:'Serum tái tạo da Daon Cica Pro', ko:'다온 시카 프로 재생 세럼', en:'Daon Cica Pro Repair Serum'},
    tagline:{vi:'Serum phục hồi da chuyên sâu với 82% chiết xuất rau má Hàn Quốc', ko:'한국산 병풀 추출물 82% 고농축 진정 세럼', en:'Intensive repair serum with 82% Korean centella extract'},
    img:'https://picsum.photos/seed/mkv-serum/800/600',
    gallery:['https://picsum.photos/seed/mkv-serum/800/600','https://picsum.photos/seed/mkv-serum2/800/600','https://picsum.photos/seed/mkv-serum3/800/600'],
    video:'', inquiries:23, views:1840,
    price:'US$ 4.20 / unit (FOB Busan)', moq:'3,000 units', lead:'30 days', terms:'OEM/ODM available · Private label OK',
    brandStory:{vi:'DAON COSMETIC là nhà sản xuất mỹ phẩm tại Daegu với 12 năm kinh nghiệm OEM/ODM cho các thương hiệu K-Beauty. Nhà máy đạt chuẩn CGMP, xuất khẩu sang 14 quốc gia.',
      ko:'다온코스메틱은 대구 소재 화장품 제조사로, K-뷰티 브랜드 OEM/ODM 12년 경력을 보유하고 있습니다. CGMP 인증 공장, 14개국 수출 실적.',
      en:'DAON COSMETIC is a Daegu-based manufacturer with 12 years of K-Beauty OEM/ODM experience. CGMP-certified factory exporting to 14 countries.'},
    detail:[
      {type:'p', text:{vi:'Chứng nhận CPNP & FDA. Không paraben, không hương liệu nhân tạo — phù hợp làn da nhạy cảm của khí hậu nhiệt đới.', ko:'CPNP·FDA 인증. 파라벤·인공향료 무첨가로 열대기후 민감성 피부에 적합합니다.', en:'CPNP & FDA certified. Paraben-free, no artificial fragrance — ideal for sensitive skin in tropical climates.'}},
      {type:'img', src:'https://picsum.photos/seed/mkv-serum-d1/900/600'},
      {type:'p', text:{vi:'Đã có mặt tại Olive Young Hàn Quốc và các chuỗi drugstore lớn. Hỗ trợ đầy đủ hồ sơ công bố mỹ phẩm tại Việt Nam.', ko:'올리브영 및 주요 드럭스토어 입점 제품. 베트남 화장품 공고 서류 지원 가능.', en:'Available in Olive Young Korea and major drugstores. Full support for Vietnam cosmetic notification dossiers.'}},
      {type:'img', src:'https://picsum.photos/seed/mkv-serum-d2/900/600'},
    ]
  },
  {
    id:'p2', cat:'food', featured:true, isNew:false, createdAt:'2026-07-14',
    companyId:'hanil', brand:'HANIL FOOD', origin:'Daegu, Korea',
    name:{vi:'Tteokbokki tự sôi HanilPot', ko:'하니포트 자체발열 즉석 떡볶이', en:'HanilPot Self-Heating Tteokbokki'},
    tagline:{vi:'Món ăn Hàn Quốc tự làm nóng trong 8 phút — không cần bếp, không cần điện', ko:'불 없이 8분, 자체발열 즉석 떡볶이', en:'Self-heating Korean street food ready in 8 minutes — no stove needed'},
    img:'https://picsum.photos/seed/mkv-tteok/800/600',
    gallery:['https://picsum.photos/seed/mkv-tteok/800/600','https://picsum.photos/seed/mkv-tteok2/800/600'],
    video:'', inquiries:41, views:3120,
    price:'US$ 1.85 / pack (FOB Busan)', moq:'10,000 packs', lead:'25 days', terms:'Halal cert. in progress · Shelf life 12 months',
    brandStory:{vi:'HANIL FOOD sản xuất thực phẩm tiện lợi Hàn Quốc từ 1998. Dây chuyền HACCP, sản phẩm có mặt tại CU, GS25 toàn Hàn Quốc.',
      ko:'하니일푸드는 1998년부터 한국 간편식품을 생산해온 기업입니다. HACCP 인증 라인, 전국 CU·GS25 입점.',
      en:'HANIL FOOD has produced Korean convenience food since 1998. HACCP-certified lines; products in CU and GS25 nationwide.'},
    detail:[
      {type:'p', text:{vi:'Cơm hộp tự sôi là xu hướng lớn tại thị trường Đông Nam Á — phù hợp cửa hàng tiện lợi, khu du lịch, đồ ăn văn phòng.', ko:'자체발열 간편식은 동남아 시장의 큰 트렌드 — 편의점·관광지·오피스 판로에 적합합니다.', en:'Self-heating meals are a major SEA trend — perfect for convenience stores, tourist areas, and office snacking.'}},
      {type:'img', src:'https://picsum.photos/seed/mkv-tteok-d1/900/600'},
    ]
  },
  {
    id:'p3', cat:'living', featured:true, isNew:true, createdAt:'2026-07-22',
    companyId:'cleanlab', brand:'CLEANLAB', origin:'Daegu, Korea',
    name:{vi:'Máy khử trùng dao thớt UV CleanLab', ko:'클린랩 UV 도마·칼 살균기', en:'CleanLab UV Cutting Board Sterilizer'},
    tagline:{vi:'Khử 99.9% vi khuẩn trên dao thớt trong 10 phút bằng UV-C LED', ko:'UV-C LED로 10분 만에 도마·칼 99.9% 살균', en:'Kills 99.9% of germs on knives & boards in 10 minutes with UV-C LED'},
    img:'https://picsum.photos/seed/mkv-uv/800/600',
    gallery:['https://picsum.photos/seed/mkv-uv/800/600','https://picsum.photos/seed/mkv-uv2/800/600'],
    video:'', inquiries:17, views:980,
    price:'US$ 28.50 / unit (FOB Busan)', moq:'500 units', lead:'35 days', terms:'CE/KC certified · 220V SEA plug available',
    brandStory:{vi:'CLEANLAB phát triển thiết bị vệ sinh nhà bếp thông minh, đạt giải thưởng thiết kế Hàn Quốc 2025.', ko:'클린랩은 스마트 주방위생 가전 전문기업으로 2025 대한민국 디자인어워드 수상 기업입니다.', en:'CLEANLAB builds smart kitchen-hygiene devices; winner of the 2025 Korea Design Award.'},
    detail:[
      {type:'p', text:{vi:'Khí hậu nóng ẩm Việt Nam khiến dụng cụ bếp dễ nhiễm khuẩn — sản phẩm giải quyết đúng nỗi lo của gia đình hiện đại.', ko:'고온다습한 베트남 기후에서 주방도구 위생 문제를 정확히 해결하는 제품입니다.', en:'Vietnam\'s hot, humid climate makes kitchen tools prone to bacteria — this solves a real worry for modern families.'}},
      {type:'img', src:'https://picsum.photos/seed/mkv-uv-d1/900/600'},
    ]
  },
  {
    id:'p4', cat:'health', featured:false, isNew:true, createdAt:'2026-07-24',
    companyId:'jinseng', brand:'JINSENG HOUSE', origin:'Daegu, Korea',
    name:{vi:'Nước hồng sâm Hàn Quốc 6 năm tuổi', ko:'6년근 고려 홍삼액 스틱', en:'6-Year Korean Red Ginseng Extract Sticks'},
    tagline:{vi:'Hồng sâm 6 năm tuổi dạng gói tiện lợi — quà biếu cao cấp được ưa chuộng', ko:'휴대가 간편한 스틱형 6년근 홍삼액', en:'Premium 6-year red ginseng in convenient stick packs'},
    img:'https://picsum.photos/seed/mkv-ginseng/800/600',
    gallery:['https://picsum.photos/seed/mkv-ginseng/800/600'],
    video:'', inquiries:35, views:2540,
    price:'US$ 12.00 / box (30 sticks)', moq:'1,000 boxes', lead:'20 days', terms:'Gift packaging · OEM available',
    brandStory:{vi:'JINSENG HOUSE chuyên chế biến hồng sâm từ vùng trồng sâm nổi tiếng của Hàn Quốc, xuất khẩu 20 năm.', ko:'진생하우스는 한국 대표 인삼 산지의 홍삼 전문 제조사로 수출 경력 20년입니다.', en:'JINSENG HOUSE processes red ginseng from Korea\'s famous ginseng regions, exporting for 20 years.'},
    detail:[
      {type:'p', text:{vi:'Hồng sâm Hàn Quốc là mặt hàng quà biếu số 1 tại Việt Nam dịp Tết. Bao bì quà tặng sang trọng, sẵn sàng cho mùa cao điểm.', ko:'홍삼은 베트남 뗏(설) 시즌 1위 선물 품목입니다. 고급 선물 패키지로 성수기 대응이 가능합니다.', en:'Korean red ginseng is the #1 gift item in Vietnam during Tet. Luxury gift packaging ready for peak season.'}},
    ]
  },
  {
    id:'p5', cat:'kids', featured:false, isNew:false, createdAt:'2026-07-10',
    companyId:'toto', brand:'TOTO KIDS', origin:'Daegu, Korea',
    name:{vi:'Bộ đồ chơi khối nam châm ToTo Block', ko:'토토블럭 자석 블록 세트', en:'ToTo Block Magnetic Building Set'},
    tagline:{vi:'Đồ chơi giáo dục STEAM an toàn — nhựa ABS không BPA, chứng nhận KC/CE', ko:'BPA-free ABS 안전 소재 STEAM 교육 자석블록', en:'Safe STEAM educational toy — BPA-free ABS, KC/CE certified'},
    img:'https://picsum.photos/seed/mkv-block/800/600',
    gallery:['https://picsum.photos/seed/mkv-block/800/600'],
    video:'', inquiries:12, views:760,
    price:'US$ 9.80 / set (64pcs)', moq:'2,000 sets', lead:'40 days', terms:'CE/KC certified · Custom box printing',
    brandStory:{vi:'TOTO KIDS sản xuất đồ chơi giáo dục 15 năm, cung cấp cho các trường mầm non Hàn Quốc.', ko:'토토키즈는 15년 경력의 교육완구 제조사로 한국 유치원·어린이집에 납품하고 있습니다.', en:'TOTO KIDS has made educational toys for 15 years, supplying Korean kindergartens.'},
    detail:[
      {type:'p', text:{vi:'Tầng lớp trung lưu Việt Nam đầu tư mạnh cho giáo dục sớm — đồ chơi STEAM Hàn Quốc có vị thế thương hiệu cao.', ko:'베트남 중산층의 조기교육 투자가 급증 — 한국 STEAM 완구의 브랜드 위상이 높습니다.', en:'Vietnam\'s middle class invests heavily in early education — Korean STEAM toys carry strong brand equity.'}},
    ]
  },
  {
    id:'p6', cat:'tech', featured:true, isNew:false, createdAt:'2026-07-05',
    companyId:'airio', brand:'AIRIO', origin:'Daegu, Korea',
    name:{vi:'Máy lọc không khí mini AIRIO Cube', ko:'에어리오 큐브 미니 공기청정기', en:'AIRIO Cube Mini Air Purifier'},
    tagline:{vi:'Máy lọc không khí để bàn với cảm biến PM2.5 — thiết kế giải thưởng Red Dot', ko:'PM2.5 센서 탑재 데스크 공기청정기 — 레드닷 수상 디자인', en:'Desktop air purifier with PM2.5 sensor — Red Dot award design'},
    img:'https://picsum.photos/seed/mkv-air/800/600',
    gallery:['https://picsum.photos/seed/mkv-air/800/600','https://picsum.photos/seed/mkv-air2/800/600'],
    video:'', inquiries:28, views:2210,
    price:'US$ 32.00 / unit (FOB Busan)', moq:'1,000 units', lead:'45 days', terms:'CE/FCC · HEPA H13 filter',
    brandStory:{vi:'AIRIO là startup thiết bị môi trường trong nhà, đạt giải Red Dot Design Award 2024.', ko:'에어리오는 실내환경 가전 스타트업으로 2024 레드닷 디자인 어워드를 수상했습니다.', en:'AIRIO is an indoor-environment device startup and 2024 Red Dot Design Award winner.'},
    detail:[
      {type:'p', text:{vi:'Ô nhiễm không khí đô thị là mối quan tâm hàng đầu tại Hà Nội và TP.HCM — thị trường máy lọc khí tăng 30%/năm.', ko:'하노이·호치민의 대기오염 이슈로 공기청정기 시장이 연 30% 성장 중입니다.', en:'Urban air pollution is a top concern in Hanoi and HCMC — the purifier market grows 30% yearly.'}},
    ]
  },
  {
    id:'p7', cat:'beauty', featured:false, isNew:false, createdAt:'2026-06-28',
    companyId:'modam', brand:'MODAM', origin:'Daegu, Korea',
    name:{vi:'Mặt nạ dưỡng ẩm collagen MODAM', ko:'모담 콜라겐 수분 마스크팩', en:'MODAM Collagen Hydration Mask Pack'},
    tagline:{vi:'Mặt nạ K-Beauty với collagen thủy phân — bán chạy trên Shopee Hàn', ko:'가수분해 콜라겐 함유 K-뷰티 마스크팩', en:'K-Beauty sheet mask with hydrolyzed collagen — Shopee bestseller'},
    img:'https://picsum.photos/seed/mkv-mask/800/600',
    gallery:['https://picsum.photos/seed/mkv-mask/800/600'],
    video:'', inquiries:19, views:1430,
    price:'US$ 0.45 / sheet (FOB Busan)', moq:'30,000 sheets', lead:'20 days', terms:'Private label OK · CPNP',
    brandStory:{vi:'MODAM chuyên sản xuất mặt nạ giấy với công suất 500,000 miếng/ngày tại nhà máy Daegu.', ko:'모담은 대구 공장에서 일 50만 장 생산능력을 갖춘 마스크팩 전문 제조사입니다.', en:'MODAM specializes in sheet masks with 500,000 sheets/day capacity at its Daegu factory.'},
    detail:[
      {type:'p', text:{vi:'Mặt nạ giấy Hàn Quốc là sản phẩm K-Beauty phổ biến nhất tại Việt Nam với giá vốn thấp, biên lợi nhuận cao.', ko:'마스크팩은 베트남에서 가장 대중적인 K-뷰티 품목 — 낮은 원가와 높은 마진이 강점입니다.', en:'Korean sheet masks are Vietnam\'s most popular K-Beauty item — low cost, high margin.'}},
    ]
  },
  {
    id:'p8', cat:'food', featured:false, isNew:true, createdAt:'2026-07-25',
    companyId:'dalsung', brand:'DALSUNG TEA', origin:'Daegu, Korea',
    name:{vi:'Trà gạo rang hữu cơ Dalsung', ko:'달성 유기농 현미 누룽지차', en:'Dalsung Organic Roasted Rice Tea'},
    tagline:{vi:'Trà gạo rang hữu cơ không caffeine — vị ấm quen thuộc với người Việt', ko:'카페인 없는 유기농 현미 누룽지차', en:'Caffeine-free organic roasted rice tea — a familiar warm taste'},
    img:'https://picsum.photos/seed/mkv-tea/800/600',
    gallery:['https://picsum.photos/seed/mkv-tea/800/600'],
    video:'', inquiries:8, views:520,
    price:'US$ 3.10 / box (20 bags)', moq:'5,000 boxes', lead:'30 days', terms:'Organic cert. (Korea) · OEM',
    brandStory:{vi:'DALSUNG TEA trồng và chế biến trà tại vùng Dalseong, Daegu theo chuẩn hữu cơ Hàn Quốc.', ko:'달성티는 대구 달성군에서 유기농 인증 기준으로 차를 재배·가공합니다.', en:'DALSUNG TEA grows and processes tea in Dalseong, Daegu under Korean organic standards.'},
    detail:[
      {type:'p', text:{vi:'Người tiêu dùng Việt ngày càng tìm đồ uống lành mạnh không caffeine — trà gạo rang Hàn Quốc đang lên xu hướng.', ko:'베트남 소비자의 건강음료 수요 증가로 한국 곡물차가 트렌드로 부상 중입니다.', en:'Vietnamese consumers increasingly seek healthy caffeine-free drinks — Korean grain teas are trending.'}},
    ]
  },
  {
    id:'p9', cat:'beauty', featured:false, isNew:true, createdAt:'2026-07-29',
    companyId:'wellbeing', brand:'WELLBEING HEALTHFARM', origin:'Incheon, Korea',
    name:{vi:'Kem dưỡng gót chân Goeunbal (Bàn chân mịn màng)', ko:'명품 고운발 풋크림', en:'Goeunbal Premium Foot Cream'},
    tagline:{vi:'Kem chứa urea làm mềm da chai sần, nứt gót chân — dưỡng ẩm cho bàn chân mịn màng',
             ko:'우레아 성분으로 굳은살·갈라진 발뒤꿈치를 부드럽게, 발 각질 관리 풋크림',
             en:'Urea foot cream that softens calluses and cracked heels while deeply moisturizing'},
    /* 이미지는 3wbmall 핫링크를 끊고 내려받아 자체 호스팅 (핫링크는 상대 서버가 막으면 그대로 깨짐) */
    img:'assets/img/products/goeunbal/main.jpg',
    gallery:['assets/img/products/goeunbal/main.jpg'],
    video:'', inquiries:0, views:0,
    price:'US$ 3.50 / tube (FOB Incheon)', negotiable:true, moq:'문의', lead:'문의',
    terms:'K-뷰티 풋케어 · 우레아 함유 · OEM/ODM 문의 · 국내 소비자가 9,900원(참고)',
    brandStory:{vi:'Goeunbal là thương hiệu chăm sóc bàn chân của WELLBEING HEALTHFARM (Incheon, Hàn Quốc), bán trực tiếp qua kênh chính hãng với nhiều đánh giá của người dùng Hàn Quốc.',
                ko:'명품 고운발은 (주)웰빙헬스팜(인천)의 풋케어 브랜드로, 자사몰 직판 및 다수의 국내 사용후기를 보유한 제품입니다.',
                en:'Goeunbal is the foot-care brand of WELLBEING HEALTHFARM (Incheon, Korea), sold directly through its own mall with many Korean user reviews.'},
    /* 본문 = 제조사 상세페이지(3wbmall) 내용을 3개 국어로 옮긴 것.
       원본 상세 이미지는 전부 한국어라 아래 seq 이미지로 붙이되,
       바이어가 실제로 읽는 정보는 텍스트 블록에 담는다. 수치는 이미지의 시험성적서 기재값. */
    detail:[
      {type:'p', text:{
        vi:'Kem chứa urea giúp làm mềm và loại bỏ da chai sần, da khô nứt nẻ ở gót chân, đồng thời cấp ẩm để giữ bàn chân mềm mịn. Kết cấu thẩm thấu nhanh, dùng hằng ngày sau khi tắm.',
        ko:'우레아 성분이 발뒤꿈치의 굳은살과 건조하게 갈라진 각질을 부드럽게 정돈하고, 동시에 수분을 공급해 매끈한 발을 유지해 줍니다. 흡수가 빠른 제형으로 목욕 후 매일 사용하기 좋습니다.',
        en:'A urea-based cream that softens and smooths calluses and dry, cracked heels while supplying moisture for soft feet. Its fast-absorbing texture suits daily use after bathing.'}},

      {type:'p', text:{
        vi:'Thành phần chính: urea làm mềm sừng, cùng chiết xuất sữa ong chúa và keo ong (propolis). Ngoài ra còn có chiết xuất hoa kim ngân, hoa cúc La Mã, acerola, gạo và natri hyaluronate. Kết cấu nhẹ, không cần chà xát hay dũa gót — phù hợp cho cả nam và nữ, mọi lứa tuổi.',
        ko:'핵심 성분은 각질을 연화시키는 우레아, 그리고 로얄젤리·프로폴리스 추출물입니다. 인동덩굴꽃·마트리카리아(캐모마일)·아세로라·쌀 추출물과 소듐하알루로네이트가 함께 들어갑니다. 가볍게 발리고, 각질을 깎거나 미는 물리적 제거가 필요 없어 남녀노소 모두 사용할 수 있습니다.',
        en:'Key actives are urea for keratin softening, plus royal jelly and propolis extracts. The formula also carries honeysuckle, chamomile, acerola and rice extracts with sodium hyaluronate. It absorbs lightly and needs no filing or scrubbing, so it suits all ages and genders.'}},

      {type:'p', text:{
        vi:'Kết quả thử nghiệm (theo phiếu kiểm nghiệm của nhà sản xuất): thử nghiệm trên người trong 2 tuần cho thấy vùng da sừng ở gót chân giảm 56,95%; 95,54% người tham gia hài lòng (20 người, tuổi trung bình 34,1 — Human Skin Clinical Trial Center, HD-P24-0036 / IRB HD-IRB-P24-0036, 26/12/2024–09/01/2025). Thử nghiệm patch test kích ứng sơ cấp cho chỉ số 0,00 — xếp loại “không kích ứng (Excellent)”. Kiểm nghiệm 6 kim loại nặng, 6 chất độc hại và giới hạn vi sinh vật: tất cả “không phát hiện” (Korea Institute of Dermatological Sciences).',
        ko:'시험 결과(제조사 시험성적서 기재값): 2주 인체적용시험에서 뒤꿈치 각질 면적 56.95% 개선, 시험대상자 만족도 95.54%(20명, 평균 34.1세 · 휴먼피부임상시험센터 HD-P24-0036 / IRB HD-IRB-P24-0036, 2024.12.26~2025.01.09). 피부첩포 일차자극 시험 자극지수 0.00 — "비자극(Excellent)" 판정. 중금속 6종·유해물질 6종·미생물 한도 시험은 전 항목 불검출(한국피부과학연구원).',
        en:'Test results as stated on the manufacturer\'s reports: a 2-week human application study showed 56.95% reduction in heel callus area and 95.54% subject satisfaction (20 subjects, mean age 34.1 — Human Skin Clinical Trial Center, HD-P24-0036 / IRB HD-IRB-P24-0036, 26 Dec 2024–09 Jan 2025). A primary skin irritation patch test returned an index of 0.00, rated "non-irritating (Excellent)". Six heavy metals, six hazardous substances and microbial limits were all reported as not detected (Korea Institute of Dermatological Sciences).'}},

      {type:'p', text:{
        vi:'Thành tích tại thị trường Hàn Quốc (theo tư liệu của nhà sản xuất): hạng 1 doanh số kem dưỡng gót chân trên 11st (12/07/2020) và hạng 1 hạng mục foot cream trong Naver BEST 100 (22/10/2020). Trích dẫn tháng 5/2025: 31.454 đánh giá trên Coupang và 9.630 đánh giá đạt 4,83/5 trên Naver Shopping. Đây là số liệu bán lẻ nội địa Hàn Quốc, dùng để tham khảo mức độ chấp nhận của người tiêu dùng.',
        ko:'한국 시장 실적(제조사 자료 기준): 11번가 풋크림 판매 BEST 1위(2020.07.12), 네이버 BEST 100 풋크림 부문 1위(2020.10.22). 2025년 5월 발췌 기준 쿠팡 상품평 31,454건, 네이버쇼핑 리뷰 9,630건 평점 4.83/5. 한국 내수 리테일 지표이며 소비자 수용도 참고용입니다.',
        en:'Korean market track record per the manufacturer\'s materials: #1 foot-cream seller on 11st (12 Jul 2020) and #1 in the foot-cream category of Naver BEST 100 (22 Oct 2020). As captured in May 2025: 31,454 reviews on Coupang and 9,630 reviews averaging 4.83/5 on Naver Shopping. These are Korean domestic retail figures, offered as a proxy for consumer acceptance.'}},

      {type:'p', text:{
        vi:'Cách dùng: da sừng ít — dùng 2–3 lần/tuần, rửa chân, lau khô rồi massage cho kem thấm. Da sừng nhiều — dùng từ 5 lần/tuần trở lên, ngâm chân nước ấm, lau khô rồi massage. Bôi trước khi ngủ và mang tất sẽ cho hiệu quả tốt hơn.',
        ko:'사용법: 각질이 적은 경우 주 2~3회 — 발을 씻고 물기를 없앤 뒤 마사지하듯 발라 흡수시킵니다. 각질이 많은 경우 주 5회 이상 — 따뜻한 물에 발을 불린 뒤 물기를 제거하고 마사지하듯 흡수시킵니다. 자기 전에 바르고 수면양말을 신으면 효과가 더 좋습니다.',
        en:'How to use: for light calluses, apply 2–3 times a week — wash feet, pat dry, then massage in until absorbed. For heavy calluses, apply 5 or more times a week — soak feet in warm water, dry, then massage in. Applying before bed and wearing socks improves results.'}},

      {type:'p', text:{
        vi:'Thông tin sản phẩm: dung tích 110g · sản xuất tại Hàn Quốc · nhà sản xuất và chịu trách nhiệm phân phối: WELLBEING HEALTHFARM Co., Ltd. · dùng được cho mọi loại da · hạn dùng sau khi mở nắp 12 tháng · số bằng sáng chế 10-1777280. Dòng sản phẩm gồm 3 phiên bản: Goeunbal Premium 110g (sữa ong chúa + keo ong), WHB Goeunbal 100g (dưỡng ẩm) và Cheongchun Goeunbal 100g.',
        ko:'제품 정보: 용량 110g · 제조국 대한민국 · 제조업자 및 책임판매업자 (주)웰빙헬스팜 · 모든 피부에 사용 · 개봉 후 사용기간 12개월 · 특허 제10-1777280호. 라인업은 명품 고운발 110g(로얄젤리·프로폴리스), WHB 고운발 100g(보습), 청춘 고운발 100g 3종입니다.',
        en:'Product information: 110g · made in Korea · manufacturer and responsible distributor WELLBEING HEALTHFARM Co., Ltd. · suitable for all skin types · 12 months after opening · patent no. 10-1777280. The line comprises Goeunbal Premium 110g (royal jelly + propolis), WHB Goeunbal 100g (moisturizing) and Cheongchun Goeunbal 100g.'}},

      {type:'p', text:{
        vi:'Khí hậu nóng ẩm và thói quen đi dép hở của người Việt khiến nhu cầu chăm sóc gót chân tăng cao — dòng foot cream Hàn Quốc có dư địa tốt tại kênh nhà thuốc, cửa hàng mỹ phẩm và bán lẻ trực tuyến.',
        ko:'덥고 습한 기후와 샌들 착용 문화로 베트남의 발 관리 수요가 높아, 한국산 풋크림은 약국·화장품 매장·온라인 리테일 채널에서 성장 여지가 큽니다.',
        en:'Vietnam\'s hot, humid climate and open-sandal culture drive strong foot-care demand — Korean foot creams have room to grow across pharmacies, cosmetics stores and online retail.'}},

      /* 제조사 원본 상세페이지 (한국어) — seq:true 라 틈 없이 이어 붙는다 */
      {type:'img', seq:true, src:'assets/img/products/goeunbal/01.jpg', w:861, h:3002},
      {type:'img', seq:true, src:'assets/img/products/goeunbal/03.jpg', w:861, h:2006},
      {type:'img', seq:true, src:'assets/img/products/goeunbal/04.jpg', w:861, h:3561},
      {type:'img', seq:true, src:'assets/img/products/goeunbal/05.jpg', w:861, h:3201},
      {type:'img', seq:true, src:'assets/img/products/goeunbal/06.jpg', w:861, h:2921},
      {type:'img', seq:true, src:'assets/img/products/goeunbal/02.jpg', w:861, h:2010},
      {type:'img', seq:true, src:'assets/img/products/goeunbal/07.jpg', w:861, h:2986},
    ]
  },
];

const MK_COLUMNS = [
  {
    id:'c1', cat:{vi:'Xu hướng', ko:'트렌드', en:'Trends'}, date:'2026-07-21',
    img:'https://picsum.photos/seed/mkv-col1/800/450',
    title:{vi:'5 ngành hàng Hàn Quốc tăng trưởng nhanh nhất tại Việt Nam 2026', ko:'2026 베트남에서 가장 빠르게 성장하는 한국 제품 카테고리 5', en:'5 fastest-growing Korean product categories in Vietnam, 2026'},
    excerpt:{vi:'Từ mỹ phẩm đến thực phẩm tiện lợi — dữ liệu nhập khẩu cho thấy nhu cầu hàng Hàn tại Việt Nam đang bùng nổ ở những ngành nào.', ko:'화장품부터 간편식까지 — 수입 데이터로 보는 베트남 내 한국 제품 수요 급증 카테고리.', en:'From cosmetics to convenience food — import data shows where Korean product demand is booming in Vietnam.'},
    body:{vi:'<p>Kim ngạch xuất khẩu hàng tiêu dùng Hàn Quốc sang Việt Nam tiếp tục tăng mạnh. Trong bài viết này, MAKENOV phân tích 5 ngành hàng có tốc độ tăng trưởng nhanh nhất: mỹ phẩm, thực phẩm tiện lợi, đồ gia dụng thông minh, thực phẩm chức năng và đồ chơi giáo dục.</p><p>Đặc biệt, các sản phẩm có chứng nhận (CPNP, HACCP, CE) và câu chuyện thương hiệu rõ ràng có tỷ lệ chốt đơn cao hơn 3 lần.</p>',
      ko:'<p>한국 소비재의 베트남 수출이 계속 급증하고 있습니다. 이번 칼럼에서는 화장품, 간편식, 스마트 리빙가전, 건강기능식품, 교육완구 등 성장 상위 5개 카테고리를 분석합니다.</p><p>특히 인증(CPNP·HACCP·CE)과 명확한 브랜드 스토리를 갖춘 제품의 성약률이 3배 높았습니다.</p>',
      en:'<p>Korean consumer goods exports to Vietnam keep surging. In this article, MAKENOV analyzes the 5 fastest-growing categories: cosmetics, convenience food, smart living appliances, health supplements, and educational toys.</p><p>Notably, products with certifications (CPNP, HACCP, CE) and a clear brand story close deals 3x more often.</p>'}
  },
  {
    id:'c2', cat:{vi:'Hướng dẫn', ko:'가이드', en:'Guide'}, date:'2026-07-15',
    img:'https://picsum.photos/seed/mkv-col2/800/450',
    title:{vi:'Nhà mua hàng Việt Nam cần chuẩn bị gì khi nhập hàng Hàn Quốc lần đầu?', ko:'베트남 바이어가 한국 제품 첫 수입 시 준비해야 할 것들', en:'What Vietnamese buyers should prepare for their first Korean import'},
    excerpt:{vi:'Thủ tục công bố sản phẩm, MOQ, điều kiện thanh toán — hướng dẫn từng bước cho nhà mua hàng lần đầu nhập hàng Hàn.', ko:'제품 공고 절차, MOQ, 결제 조건 — 첫 수입 바이어를 위한 단계별 가이드.', en:'Product notification, MOQ, payment terms — a step-by-step guide for first-time importers.'},
    body:{vi:'<p>Nhập khẩu hàng Hàn Quốc lần đầu không khó nếu bạn chuẩn bị đúng: (1) xác định mã HS và thuế nhập khẩu theo VKFTA, (2) yêu cầu nhà cung cấp hỗ trợ hồ sơ công bố, (3) đàm phán MOQ linh hoạt cho đơn hàng thử nghiệm.</p><p>MAKENOV kết nối bạn trực tiếp với nhà sản xuất — không qua trung gian.</p>',
      ko:'<p>첫 수입도 준비만 잘하면 어렵지 않습니다: (1) VKFTA 기준 HS코드·관세 확인, (2) 공급사에 공고 서류 지원 요청, (3) 테스트 오더용 유연한 MOQ 협상.</p><p>MAKENOV는 중간상 없이 제조사와 직접 연결합니다.</p>',
      en:'<p>First imports are manageable with the right prep: (1) check HS codes and VKFTA tariffs, (2) ask suppliers for notification dossier support, (3) negotiate flexible MOQs for trial orders.</p><p>MAKENOV connects you directly with manufacturers — no middlemen.</p>'}
  },
  {
    id:'c3', cat:{vi:'Câu chuyện', ko:'스토리', en:'Story'}, date:'2026-07-08',
    img:'https://picsum.photos/seed/mkv-col3/800/450',
    title:{vi:'Vì sao Daegu là thủ phủ sản xuất mới của K-Beauty và K-Food?', ko:'대구가 K-뷰티·K-푸드의 새로운 제조 허브인 이유', en:'Why Daegu is the new manufacturing hub of K-Beauty and K-Food'},
    excerpt:{vi:'Thành phố lớn thứ 4 Hàn Quốc sở hữu hệ sinh thái sản xuất mạnh — và những thương hiệu ẩn mình đang chờ được khám phá.', ko:'한국 4대 도시 대구의 제조 생태계, 그리고 아직 알려지지 않은 강소 브랜드들.', en:'Korea\'s 4th-largest city has a powerful manufacturing ecosystem — with hidden brands waiting to be discovered.'},
    body:{vi:'<p>Daegu từ lâu là trung tâm dệt may và cơ khí của Hàn Quốc, nay chuyển mình thành cứ điểm của mỹ phẩm, thực phẩm và thiết bị thông minh. Chi phí sản xuất cạnh tranh hơn Seoul 20-30% trong khi chất lượng tương đương.</p><p>MAKENOV khởi đầu từ Daegu — giới thiệu những nhà sản xuất thực lực chưa từng xuất hiện trên các nền tảng toàn cầu.</p>',
      ko:'<p>섬유·기계의 도시 대구가 화장품·식품·스마트기기 제조 거점으로 변신 중입니다. 서울 대비 20~30% 낮은 생산비용에 동등한 품질이 강점입니다.</p><p>MAKENOV는 대구에서 시작합니다 — 글로벌 플랫폼에 소개된 적 없는 실력 있는 제조사들을 발굴합니다.</p>',
      en:'<p>Long Korea\'s textile and machinery hub, Daegu is transforming into a base for cosmetics, food, and smart devices. Production costs run 20-30% below Seoul at equal quality.</p><p>MAKENOV starts from Daegu — surfacing capable manufacturers never before seen on global platforms.</p>'}
  },
];

/* spotlight feed — kind: new|inquiry|webinar, ts: ISO date */
const MK_SPOTLIGHT = [
  { kind:'inquiry', ts:'2026-07-27T09:10:00', pid:'p2' },
  { kind:'new',     ts:'2026-07-25T14:00:00', pid:'p8' },
  { kind:'inquiry', ts:'2026-07-25T11:30:00', pid:'p4' },
  { kind:'new',     ts:'2026-07-24T10:00:00', pid:'p4' },
  { kind:'inquiry', ts:'2026-07-23T16:20:00', pid:'p6' },
  { kind:'new',     ts:'2026-07-22T09:00:00', pid:'p3' },
];

/* ---------- 히어로 메시지 (홈 최상단 슬라이더) ----------
   제품 자랑이 아니라 "왜 메이크노브인가"를 말하는 자리.
   art  = 배경 그래픽(브랜드 컬러로 직접 그린 SVG, assets/img/hero/)
   link = CTA가 아닌 배경 클릭 시 이동할 곳
   kicker/title/sub = 3개 국어 (title의 \n은 줄바꿈) */
const MK_HERO = [
  { art:'assets/img/hero/hero-global.svg', link:'directory.html',
    kicker:{ vi:'Không cần bay, không cần hội chợ', ko:'전시회, 수출상담회', en:'No flights. No trade fairs.' },
    title:{ vi:'Đi hội chợ đến bao giờ?\nMột cú click là đủ.',
            ko:'전시회, 수출상담회\n언제까지 다니실 건가요?',
            en:'How long will you keep\nflying to trade shows?' },
    sub:{ vi:'Ngồi tại văn phòng, click một lần — thông tin sản phẩm đổi mới từ khắp thế giới đến với bạn.',
          ko:'사무실에 앉아서 클릭 한 번이면, 전 세계 혁신제품 정보가 찾아옵니다.',
          en:'Stay at your desk. One click brings the world\'s innovative products to you.' } },

  { art:'assets/img/hero/hero-scale.svg', link:'directory.html',
    kicker:{ vi:'Chi phí một chuyến công tác', ko:'출장 한 번 비용으로', en:'The cost of one business trip' },
    title:{ vi:'Một chuyến công tác gặp 5 nhà máy.\nỞ đây gặp hàng trăm.',
            ko:'출장 한 번에 공장 다섯 곳,\n여기선 수백 개 제품.',
            en:'One trip: five factories.\nHere: hundreds of products.' },
    sub:{ vi:'Vé máy bay, khách sạn, thông dịch — thay bằng danh mục mở 24 giờ mỗi ngày.',
          ko:'항공권·숙박·통역 대신, 24시간 열려 있는 제품 디렉토리로.',
          en:'Skip the airfare, hotels and interpreters — browse a directory that never closes.' } },

  { art:'assets/img/hero/hero-spec.svg', link:'companies.html',
    kicker:{ vi:'Chỉ nhà sản xuất đã xác thực', ko:'검증된 제조사만', en:'Verified manufacturers only' },
    title:{ vi:'Giá, MOQ, thời gian giao hàng\ntrên cùng một màn hình.',
            ko:'가격, MOQ, 납기까지\n한 화면에서 확인하세요.',
            en:'Price, MOQ and lead time\non a single screen.' },
    sub:{ vi:'Mọi nhà sản xuất đều qua xác thực doanh nghiệp. Không còn phải dò hỏi từng nơi.',
          ko:'모든 제조사가 사업자 인증을 거칩니다. 하나하나 수소문할 필요 없습니다.',
          en:'Every manufacturer passes business verification. No more chasing down each supplier.' } },

  { art:'assets/img/hero/hero-inquiry.svg', link:'mypage.html',
    kicker:{ vi:'Gửi yêu cầu hàng loạt', ko:'일괄 견적 요청', en:'Bulk inquiry' },
    title:{ vi:'Chọn sản phẩm quan tâm,\ngửi báo giá một lần.',
            ko:'관심 제품을 담고,\n한 번에 견적을 받으세요.',
            en:'Save what interests you,\nrequest every quote at once.' },
    sub:{ vi:'Không cần liên hệ từng nhà sản xuất. Thêm vào danh sách rồi gửi yêu cầu cùng lúc.',
          ko:'제조사마다 따로 연락할 필요 없습니다. 담아두고 한 번에 문의하세요.',
          en:'Stop emailing suppliers one by one. Add to your list and send a single request.' } },
];

/* ---------- 제조사 유치 랜딩(maker.html) 설정 ----------
   ⚠️ stats 수치는 랜딩에 그대로 노출됩니다. 제조사는 반드시 근거를 묻습니다.
      공개 전에 실제 값으로 바꾸거나, 근거를 댈 수 있는 지표(광고 도달수 등)로 교체하세요.
      숫자를 바꿀 곳은 여기 한 곳뿐입니다. */
const MK_MAKER = {
  stats: [
    { n:'10,000+', label:'등록 바이어',   note:'플랫폼·팬페이지 통합' },
    { n:'4개국',   label:'주요 진출국',   note:'베트남 · 중국 · 미얀마 · 한국' },
    { n:'3개 국어', label:'제품 노출 언어', note:'베트남어 · 영어 · 한국어' },
    { n:'365일',   label:'상시 노출',     label2:'', note:'전시회는 3일' },
  ],
  markets: [
    { name:'베트남', desc:'1차 집중 시장. 호치민·하노이 유통·도매 바이어 중심.' },
    { name:'중국',   desc:'광저우·이우 도매상, 크로스보더 셀러.' },
    { name:'미얀마', desc:'양곤 수입상. 한국 소비재 수요 확대 구간.' },
    { name:'한국',   desc:'국내 벤더·수출대행사. 해외 채널 보유 바이어.' },
  ],
  contactEmail: 'contact@makenov.com',
  contactTel: '',
};

/* ---------- 메인페이지 FAQ (바이어용) ----------
   관리자 FAQ 탭에서 편집. Supabase 모드에선 faqs 테이블이 이 시드를 덮어쓴다. */
const MK_FAQ = [
  { id:'f1', page:'home', sort:1, published:true,
    q:{vi:'Đăng ký và sử dụng có mất phí không?', ko:'가입과 이용은 무료인가요?', en:'Is it free to join and use?'},
    a:{vi:'Hoàn toàn miễn phí — đăng ký, xem sản phẩm, gửi yêu cầu báo giá và xác thực doanh nghiệp đều không mất phí.',
       ko:'네. 가입, 제품 열람, 견적 문의, 사업자 인증 모두 무료입니다.',
       en:'Yes. Signing up, browsing products, sending quotation requests and business verification are all free.'} },
  { id:'f2', page:'home', sort:2, published:true,
    q:{vi:'Vì sao giá và MOQ bị khóa?', ko:'가격과 최소주문수량(MOQ)이 왜 잠겨 있나요?', en:'Why are prices and MOQs locked?'},
    a:{vi:'Giá, MOQ, thời gian giao hàng và điều kiện cung ứng chỉ hiển thị cho nhà mua đã xác thực doanh nghiệp. Đăng ký miễn phí và xác thực để xem ngay.',
       ko:'가격·MOQ·납기·공급 조건은 사업자 인증을 통과한 바이어에게만 공개됩니다. 무료 가입 후 인증하면 바로 열람할 수 있습니다.',
       en:'Price, MOQ, lead time and supply terms are visible only to verified buyers. Sign up free and verify your business to unlock them.'} },
  { id:'f3', page:'home', sort:3, published:true,
    q:{vi:'Xác thực doanh nghiệp như thế nào?', ko:'사업자 인증은 어떻게 하나요?', en:'How does business verification work?'},
    a:{vi:'Việt Nam dùng mã số thuế (MST), Hàn Quốc dùng số đăng ký kinh doanh, các quốc gia khác xác thực bằng email tên miền công ty. Thường chỉ mất khoảng 1 phút.',
       ko:'베트남은 세금코드(MST), 한국은 사업자등록번호, 그 외 국가는 회사 이메일 도메인으로 인증합니다. 보통 1분이면 끝납니다.',
       en:'Vietnam verifies by tax code (MST), Korea by business registration number, and other countries by company email domain. It usually takes about a minute.'} },
  { id:'f4', page:'home', sort:4, published:true,
    q:{vi:'Có làm việc trực tiếp với nhà sản xuất không?', ko:'제조사와 직접 거래하나요?', en:'Do I deal directly with manufacturers?'},
    a:{vi:'Có. Yêu cầu của bạn được chuyển thẳng đến nhà sản xuất, không qua trung gian. MAKENOV đảm nhận việc kết nối và xác thực.',
       ko:'네. 문의는 제조사에 직접 전달되며 중간 유통 마진이 없습니다. MAKENOV는 연결과 검증을 담당합니다.',
       en:'Yes. Your inquiry goes straight to the manufacturer with no middleman margins. MAKENOV handles matching and verification.'} },
  { id:'f5', page:'home', sort:5, published:true,
    q:{vi:'Có thể thương lượng MOQ không?', ko:'최소주문수량은 협의할 수 있나요?', en:'Can MOQs be negotiated?'},
    a:{vi:'Tùy sản phẩm, nhưng nhiều nhà sản xuất sẵn sàng thương lượng đơn hàng nhỏ để thử nghiệm thị trường. Hãy ghi số lượng mong muốn khi gửi yêu cầu báo giá.',
       ko:'제품마다 다르지만, 많은 제조사가 테스트 오더용 소량 주문 협의에 열려 있습니다. 견적 문의 시 희망 수량을 적어주세요.',
       en:'It varies by product, but many manufacturers are open to smaller trial orders. State your desired quantity in the quotation request.'} },
  { id:'f6', page:'home', sort:6, published:true,
    q:{vi:'Tôi có thể gửi yêu cầu bằng ngôn ngữ nào?', ko:'어떤 언어로 문의할 수 있나요?', en:'Which languages can I use?'},
    a:{vi:'Tiếng Việt, tiếng Anh và tiếng Hàn đều được. Khi cần, đội ngũ MAKENOV sẽ hỗ trợ trao đổi.',
       ko:'베트남어·영어·한국어 모두 가능합니다. 필요하면 MAKENOV 팀이 소통을 지원합니다.',
       en:'Vietnamese, English and Korean are all fine. The MAKENOV team can assist with communication when needed.'} },
];

/* ---------- 사이트 설정 (관리자 '설정' 탭에서 편집) ----------
   지금은 상단 띠배너만. 문구를 코드(i18n.js)에 박아두면 운영 중에 못 바꾸므로
   여기로 뺐다. Supabase 모드에선 settings 테이블이 이 값을 덮어쓴다. */
const MK_SETTINGS = {
  topbarOn: true,
  topbarLink: '',            // 비우면 링크 없는 안내 배너
  topbar: {
    vi: 'Doanh nghiệp Hàn Quốc đang tìm nhà phân phối — xác thực miễn phí để xem giá',
    ko: '해외 유통 파트너를 찾는 제조사 모집 중 — 사업자 인증하면 가격 열람 무료',
    en: 'Makers are looking for distribution partners — verify free to unlock pricing',
  },
};

/* ---------- 관리자 오버라이드 (관리자에서 저장하면 여기로 들어옴) ----------
   원본 시드는 위 배열, 관리자 편집분은 localStorage. 배포 시 '내보내기'로 data.js에 구움. */
(function(){
  try{
    const p = JSON.parse(localStorage.getItem('mk_products_override')||'null');
    if(Array.isArray(p)) { MK_PRODUCTS.length = 0; p.forEach(x=>MK_PRODUCTS.push(x)); }
  }catch(e){}
  try{
    const c = JSON.parse(localStorage.getItem('mk_columns_override')||'null');
    if(Array.isArray(c)) { MK_COLUMNS.length = 0; c.forEach(x=>MK_COLUMNS.push(x)); }
  }catch(e){}
  try{
    const s = JSON.parse(localStorage.getItem('mk_spotlight_override')||'null');
    if(Array.isArray(s)) { MK_SPOTLIGHT.length = 0; s.forEach(x=>MK_SPOTLIGHT.push(x)); }
  }catch(e){}
  try{
    const h = JSON.parse(localStorage.getItem('mk_hero_override')||'null');
    if(Array.isArray(h)) { MK_HERO.length = 0; h.forEach(x=>MK_HERO.push(x)); }
  }catch(e){}
  try{
    const f = JSON.parse(localStorage.getItem('mk_faqs_override')||'null');
    if(Array.isArray(f)) { MK_FAQ.length = 0; f.forEach(x=>MK_FAQ.push(x)); }
  }catch(e){}
  try{
    const st = JSON.parse(localStorage.getItem('mk_settings_override')||'null');
    if(st && typeof st === 'object') Object.assign(MK_SETTINGS, st);
  }catch(e){}
})();

const MK_STATS = { products: MK_PRODUCTS.length, inquiries: MK_PRODUCTS.reduce((s,p)=>s+p.inquiries,0), buyers: 87 };

function mkProduct(id){ return MK_PRODUCTS.find(p=>p.id===id); }
function mkCat(id){ return MK_CATEGORIES.find(c=>c.id===id); }
function mkColumn(id){ return MK_COLUMNS.find(c=>c.id===id); }
