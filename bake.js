/* ============================================================
   MAKENOV SEO 굽기 — 실행: node bake.js
   ------------------------------------------------------------
   1) Supabase에서 공개 콘텐츠 로드 (실패 시 data.js 시드 폴백)
   2) products/<id>.html · columns/<id>.html 정적 생성
      - 크롤러/AI봇용 사전 렌더(베트남어) + JSON-LD
      - 사용자는 같은 JS 앱이 부팅되며 라이브 데이터로 하이드레이션
   3) 모든 공개 페이지 head에 SEO 블록 주입 (title/description/
      canonical/OG/트위터카드/JSON-LD — <!-- mk:seo --> 마커로 관리,
      재실행하면 갱신됨)
   4) sitemap.xml · robots.txt 생성

   ★ 도메인이 확정되면 아래 SITE 한 곳만 바꾸고 다시 실행하면
     canonical·OG·sitemap이 전부 새 도메인으로 다시 구워진다.
   ★ 관리자에서 제품·칼럼을 추가/수정한 뒤에도 다시 실행해야
     정적 페이지와 sitemap에 반영된다.
   ★ 이 스크립트 다음에 `node prerender.js` 를 돌린다.
     JS로 그리는 7개 페이지를 크롤러용 정적 사본으로 굽는 단계다.

   ⚠ 2026-08-05 현재 makenov.com 은 아직 등록되지 않은 도메인이다(NXDOMAIN).
     지금 배포처는 https://leegunhee010.github.io/makenov/ 인데 canonical 은
     makenov.com 을 가리키므로, 도메인을 붙이기 전까지는 검색 색인이 되지 않는다.
     도메인을 살 때까지 색인을 원하면 SITE 를 배포처 주소로 바꾸면 된다.

     [도메인 연결 순서]  이 순서를 지켜야 사이트가 죽지 않는다
       1. makenov.com 구입
       2. DNS 에 A 레코드 4개 등록
          185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153
          (www 를 쓸 거면 CNAME www → leegunhee010.github.io)
       3. DNS 전파 확인:  nslookup makenov.com
       4. 그다음에야 저장소 루트에 CNAME 파일(내용: makenov.com) 추가 후 푸시
          ⚠ 3번 전에 CNAME 을 넣으면 GitHub Pages 가 현재 주소를 makenov.com 으로
            리다이렉트해버려서 사이트 전체가 접속 불가가 된다
       5. GitHub 저장소 Settings > Pages 에서 Enforce HTTPS 체크
   ============================================================ */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const SITE = 'https://makenov.com';   // 확정 도메인 (2026-08-03)
const OG_DEFAULT = '/assets/img/og.png';

/* ---------- 유틸 ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const T  = (v, lang) => (v && typeof v === 'object') ? (v[lang] || v.vi || v.ko || v.en || '') : String(v ?? '');
const stripHtml = s => String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const clip = (s, n) => { s = String(s ?? '').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; };
const absUrl = u => /^https?:\/\//.test(u || '') ? u : SITE + '/' + String(u || '').replace(/^\.?\//, '');
const read  = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, f)), { recursive: true }); fs.writeFileSync(path.join(ROOT, f), s); };
const today = new Date().toISOString().slice(0, 10);

/* HTML의 ?v= 캐시 버전을 그대로 물려받는다 */
const VER = (read('index.html').match(/\?v=([0-9a-zA-Z]+)/) || [, ''])[1];
const v = f => VER ? `${f}?v=${VER}` : f;

/* ---------- 1. 데이터 로드 ---------- */
function confVal(name){
  const m = read('assets/js/config.js').match(new RegExp(name + `\\s*=\\s*'([^']*)'`));
  return m ? m[1] : '';
}

async function loadFromSupabase(){
  const url = confVal('MK_SUPABASE_URL'), anon = confVal('MK_SUPABASE_ANON');
  if(!url || !anon) return null;
  const H = { apikey: anon, Authorization: 'Bearer ' + anon };
  const get = async q => {
    const r = await fetch(url.replace(/\/$/, '') + '/rest/v1/' + q, { headers: H });
    if(!r.ok) throw new Error(q + ' → HTTP ' + r.status);
    return r.json();
  };
  const [pr, co, cl] = await Promise.all([
    get('products?select=*&published=eq.true&order=created_at.desc'),
    get('companies?select=*&order=sort'),
    get('columns_post?select=*&published=eq.true&order=date.desc'),
  ]);
  /* faqs 테이블은 06_faq_seo.sql 이후에만 존재 — 없으면 시드 폴백 */
  let fq = null;
  try { fq = await get('faqs?select=*&published=eq.true&order=sort'); } catch (e) {}
  return {
    faqs: fq,
    source: 'supabase',
    products: pr.map(p => ({
      id: p.id, companyId: p.company_id, cat: p.cat, brand: p.brand, origin: p.origin,
      name: p.name, tagline: p.tagline, brandStory: p.brand_story,
      img: p.img, gallery: p.gallery || [], video: p.video || '', detail: p.detail || [],
      createdAt: String(p.created_at || '').slice(0, 10),
    })),
    companies: co.map(c => ({
      id: c.id, brand: c.brand, name: c.name, location: c.location,
      certs: c.certs || [], logo: c.logo, since: c.since,
    })),
    columns: cl.map(c => ({
      id: c.id, cat: c.cat, title: c.title, excerpt: c.excerpt, body: c.body,
      img: c.img, date: String(c.date || '').slice(0, 10),
      slug: c.slug || '', seoTitle: c.seo_title || '', seoDesc: c.seo_desc || '',
    })),
  };
}

function loadFromSeed(){
  const sandbox = { localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext(read('assets/js/data.js') +
    '\n;__out = { MK_PRODUCTS, MK_COMPANIES, MK_COLUMNS, MK_FAQ: typeof MK_FAQ!=="undefined"?MK_FAQ:[] };', sandbox);
  const { MK_PRODUCTS, MK_COMPANIES, MK_COLUMNS, MK_FAQ } = sandbox.__out;
  return { source: 'data.js(시드)', products: MK_PRODUCTS, companies: MK_COMPANIES, columns: MK_COLUMNS, faqs: MK_FAQ };
}

/* ---------- 2. 공통 head 블록 ---------- */
function seoBlock({ title, desc, canonical, ogImage, ogType, robots, jsonld }){
  const lines = [];
  lines.push(`<title>${esc(title)}</title>`);
  if(desc)      lines.push(`<meta name="description" content="${esc(desc)}">`);
  if(robots)    lines.push(`<meta name="robots" content="${robots}">`);
  if(canonical) lines.push(`<link rel="canonical" href="${canonical}">`);
  if(canonical){
    lines.push(`<meta property="og:type" content="${ogType || 'website'}">`);
    lines.push(`<meta property="og:site_name" content="MAKENOV">`);
    lines.push(`<meta property="og:title" content="${esc(title)}">`);
    if(desc) lines.push(`<meta property="og:description" content="${esc(desc)}">`);
    lines.push(`<meta property="og:url" content="${canonical}">`);
    lines.push(`<meta property="og:image" content="${absUrl(ogImage || OG_DEFAULT)}">`);
    lines.push(`<meta name="twitter:card" content="summary_large_image">`);
    lines.push(`<meta name="twitter:title" content="${esc(title)}">`);
    if(desc) lines.push(`<meta name="twitter:description" content="${esc(desc)}">`);
    lines.push(`<meta name="twitter:image" content="${absUrl(ogImage || OG_DEFAULT)}">`);
  }
  (Array.isArray(jsonld) ? jsonld : jsonld ? [jsonld] : []).forEach(j =>
    lines.push(`<script type="application/ld+json">${JSON.stringify(j)}</script>`));
  return `<!-- mk:seo (bake.js가 관리 — 직접 수정 금지) -->\n${lines.join('\n')}\n<!-- /mk:seo -->`;
}

/* 기존 페이지의 head에 SEO 블록을 심는다(재실행 시 교체) */
function injectSeo(file, cfg){
  let html = read(file);
  html = html.replace(/<!-- mk:seo[\s\S]*?<!-- \/mk:seo -->\n?/, '');      // 이전 블록 제거
  html = html.replace(/^<title>.*<\/title>\r?\n?/m, '');                    // 기존 title 제거
  html = html.replace(/^<meta name="description"[^>]*>\r?\n?/m, '');        // 기존 description 제거
  if(cfg.lang) html = html.replace(/<html lang="[^"]*">/, `<html lang="${cfg.lang}">`);
  html = html.replace(/<\/head>/, seoBlock(cfg) + '\n</head>');
  write(file, html);
  console.log('  head 주입:', file);
}

/* ---------- 3. 정적 페이지 템플릿 ---------- */
const SCRIPTS = () => [
  'assets/js/config.js', 'assets/js/pixel.js', null /* supabase CDN */,
  'assets/js/i18n.js', 'assets/js/data.js',
  'assets/js/store.js', 'assets/js/verify.js', 'assets/js/upload.js',
  'assets/js/store-supabase.js', 'assets/js/app.js',
].map(s => s === null
  ? `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>`
  : `<script src="${v(s)}"></script>`).join('\n');

function productPage(p, co){
  const name = T(p.name, 'vi'), tagline = T(p.tagline, 'vi');
  const title = `${name} — ${p.brand} | MAKENOV`;
  const canonical = `${SITE}/products/${p.id}.html`;
  const gallery = (p.gallery && p.gallery.length ? p.gallery : [p.img]).filter(Boolean);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Product',
    name, alternateName: [T(p.name, 'ko'), T(p.name, 'en')].filter(x => x && x !== name),
    description: tagline, image: gallery.map(absUrl), url: canonical,
    brand: { '@type': 'Brand', name: p.brand },
    ...(co ? { manufacturer: { '@type': 'Organization', name: T(co.name, 'en') || T(co.name, 'ko') } } : {}),
    countryOfOrigin: p.origin,
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MAKENOV', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Danh mục sản phẩm', item: SITE + '/directory.html' },
      { '@type': 'ListItem', position: 3, name, item: canonical },
    ],
  }];

  /* 크롤러용 사전 렌더(베트남어) — 부팅 후 같은 구조로 하이드레이션됨 */
  const detailHtml = (p.detail || []).map(b => {
    if(b.type === 'p')   return `<p>${esc(T(b.text, 'vi'))}</p>`;
    if(b.type === 'img') return `<img src="${esc(b.src)}" alt="${esc(name)}" loading="lazy">`;
    return '';
  }).join('\n        ');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<base href="../">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoBlock({ title, desc: clip(tagline, 155), canonical, ogImage: p.img, ogType: 'product', jsonld })}
<link rel="stylesheet" href="${v('assets/css/style.css')}">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
</head>
<body>
<header class="mk-header" id="mk-header"></header>

<main class="pd-wrap" id="pd-root">
  <div class="pd-row">
    <div class="pd-main">
      <div class="pd-gallery"><div class="main"><img src="${esc(gallery[0])}" alt="${esc(name)}"></div></div>
      <div class="pd-sec">
        <h2>Chi tiết sản phẩm</h2>
        <div class="pd-body">
        ${detailHtml || `<p>${esc(tagline)}</p>`}
        </div>
      </div>
      <div class="pd-sec">
        <h2>Về thương hiệu</h2>
        <div class="pd-body"><p>${esc(T(p.brandStory, 'vi'))}</p></div>
        ${co ? `<p class="pd-co-static">${esc(T(co.name, 'vi'))} · ${esc(T(co.location, 'vi'))} · ${esc((co.certs || []).slice(0, 3).join(' · '))}</p>` : ''}
      </div>
    </div>
    <aside class="pd-side">
      <div class="box">
        <div class="brand">${esc(p.brand)}</div>
        <h1>${esc(name)}</h1>
        <p class="tagline">${esc(tagline)}</p>
        <p class="tagline">${esc(T(p.tagline, 'en'))}</p>
      </div>
    </aside>
  </div>
</main>

<footer class="mk-footer" id="mk-footer"></footer>

${SCRIPTS()}
<script>window.MK_PID=${JSON.stringify(p.id)};</script>
<script src="${v('assets/js/page-product.js')}"></script>
</body>
</html>
`;
}

function colFile(c){ return c.slug || c.id; }   // 슬러그가 있으면 columns/<슬러그>.html

function columnPage(c, colFaqs){
  const title = T(c.title, 'vi'), cat = T(c.cat, 'vi');
  const canonical = `${SITE}/columns/${colFile(c)}.html`;
  const desc = clip(c.seoDesc || T(c.excerpt, 'vi') || stripHtml(T(c.body, 'vi')), 155);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, alternativeHeadline: T(c.title, 'en'),
    description: desc, image: absUrl(c.img), datePublished: c.date,
    inLanguage: 'vi', mainEntityOfPage: canonical,
    author: { '@type': 'Organization', name: 'MAKENOV' },
    publisher: { '@type': 'Organization', name: 'MAKENOV', logo: { '@type': 'ImageObject', url: SITE + '/assets/img/logo.png' } },
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MAKENOV', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Bài viết', item: SITE + '/columns.html' },
      { '@type': 'ListItem', position: 3, name: title, item: canonical },
    ],
  }];

  /* 이 칼럼에 달린 FAQ가 있으면 FAQPage 스키마도 같이 넣는다 — AI·검색이 읽는 부분 */
  if(colFaqs && colFaqs.length){
    jsonld.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: colFaqs.map(f => ({
        '@type': 'Question', name: T(f.q, 'vi'),
        acceptedAnswer: { '@type': 'Answer', text: T(f.a, 'vi') },
      })),
    });
  }

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<base href="../">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoBlock({ title: c.seoTitle ? `${c.seoTitle} | MAKENOV` : `${title} | MAKENOV`, desc, canonical, ogImage: c.img, ogType: 'article', jsonld })}
<link rel="stylesheet" href="${v('assets/css/style.css')}">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
</head>
<body>
<div class="blog-progress"><div class="blog-progress-bar" id="progress-bar"></div></div>
<header class="mk-header" id="mk-header"></header>
<main class="wrap">
<article class="blog-single" id="col-root">
  <nav class="blog-breadcrumb"><a href="index.html">Trang chủ</a> - <a href="columns.html">Bài viết</a> - <span>${esc(title)}</span></nav>
  <span class="blog-single-cat">${esc(cat)}</span>
  <h1>${esc(title)}</h1>
  <div class="blog-single-meta"><span>${esc(c.date)}</span></div>
  <div class="blog-cover"><img src="${esc(c.img)}" alt="${esc(title)}"></div>
  <div class="blog-body">${T(c.body, 'vi')}</div>
</article>
</main>
<footer class="mk-footer" id="mk-footer"></footer>

${SCRIPTS()}
<script>window.MK_CID=${JSON.stringify(c.id)};</script>
<script src="${v('assets/js/page-column.js')}"></script>
</body>
</html>
`;
}

/* ---------- 4. 실행 ---------- */
(async () => {
  let data;
  try { data = await loadFromSupabase(); } catch (e) { console.log('Supabase 로드 실패(' + e.message + ') → 시드 폴백'); }
  if(!data) data = loadFromSeed();
  const coMap = {};
  data.companies.forEach(c => coMap[c.id] = c);
  console.log(`데이터: ${data.source} — 제품 ${data.products.length} · 칼럼 ${data.columns.length} · 기업 ${data.companies.length}\n`);

  /* 이전 산출물 정리 — 슬러그가 바뀌면 옛 파일이 남아 중복 URL이 되므로 싹 지우고 다시 굽는다 */
  ['products', 'columns'].forEach(dir => {
    const d = path.join(ROOT, dir);
    if(fs.existsSync(d)) fs.readdirSync(d).filter(f => f.endsWith('.html'))
      .forEach(f => fs.unlinkSync(path.join(d, f)));
  });

  /* FAQ — 홈/칼럼 FAQPage 스키마용 (Supabase faqs → 테이블 없거나 비면 data.js 시드).
     칼럼을 굽기 전에 읽어야 칼럼별 FAQ를 그 페이지 스키마에 넣을 수 있다. */
  let faqData = data.faqs;
  if(!faqData || !faqData.length){
    try { faqData = loadFromSeed().faqs; } catch (e) { faqData = []; }
  }
  const livingFaqs = (faqData || []).filter(f => f.published !== false)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const faqsFor = page => livingFaqs.filter(f => (f.page || 'home') === page);
  const faqs = faqsFor('home');

  /* 제품·칼럼 정적 생성 */
  data.products.forEach(p => write(`products/${p.id}.html`, productPage(p, coMap[p.companyId])));
  console.log(`products/*.html ${data.products.length}개 생성`);
  let colFaqCount = 0;
  data.columns.forEach(c => {
    const cf = faqsFor(c.id);
    colFaqCount += cf.length;
    write(`columns/${colFile(c)}.html`, columnPage(c, cf));
  });
  console.log(`columns/*.html ${data.columns.length}개 생성 (${data.columns.filter(c=>c.slug).length}개 슬러그 사용, 칼럼 FAQ ${colFaqCount}개)`);
  console.log(`FAQ ${faqs.length}개 → 홈 FAQPage 스키마\n`);

  /* 공개 페이지 head 주입 */
  const ORG = {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: 'MAKENOV', url: SITE + '/', logo: SITE + '/assets/img/logo.png',
  };
  const PAGES = [
    { file: 'index.html', lang: 'vi', ogType: 'website',
      title: 'MAKENOV — Nền tảng B2B sản phẩm sáng tạo toàn cầu',
      desc: 'MAKENOV kết nối sản phẩm sáng tạo từ các nhà sản xuất toàn cầu với nhà mua hàng đã xác thực. Xác thực doanh nghiệp miễn phí để xem giá và gửi yêu cầu báo giá.',
      canonical: SITE + '/',
      jsonld: [ORG, {
        '@context': 'https://schema.org', '@type': 'WebSite',
        name: 'MAKENOV', url: SITE + '/',
        potentialAction: { '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: SITE + '/directory.html?q={search_term_string}' },
          'query-input': 'required name=search_term_string' },
      }, ...(faqs.length ? [{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: T(f.q, 'vi'),
          acceptedAnswer: { '@type': 'Answer', text: T(f.a, 'vi') } })),
      }] : [])] },
    { file: 'directory.html', lang: 'vi',
      title: 'Danh mục sản phẩm | MAKENOV',
      desc: 'Khám phá sản phẩm sáng tạo theo danh mục — mỹ phẩm, thực phẩm, đồ gia dụng, sức khỏe, mẹ & bé, công nghệ. Thông tin bằng tiếng Việt, Hàn, Anh.',
      canonical: SITE + '/directory.html' },
    { file: 'columns.html', lang: 'vi',
      title: 'Bài viết & Insights | MAKENOV',
      desc: 'Xu hướng nhập khẩu, hướng dẫn sourcing và câu chuyện thương hiệu dành cho nhà mua hàng.',
      canonical: SITE + '/columns.html' },
    { file: 'companies.html', lang: 'vi',
      title: 'Nhà sản xuất | MAKENOV',
      desc: 'Danh bạ nhà sản xuất đã đăng sản phẩm trên MAKENOV — chứng nhận, năng lực sản xuất, thành tích xuất khẩu.',
      canonical: SITE + '/companies.html' },
    { file: 'about.html', lang: 'vi',
      title: 'Giới thiệu MAKENOV — Nhà mua và nhà sản xuất đều đã xác thực',
      desc: 'MAKENOV mở giá, MOQ và thời gian giao hàng cho nhà mua đã xác thực doanh nghiệp, và chuyển yêu cầu thẳng tới nhà sản xuất — không hội chợ, không trung gian.',
      canonical: SITE + '/about.html' },
    { file: 'guide.html', lang: 'vi',
      title: 'Hướng dẫn sử dụng | MAKENOV',
      desc: 'Từ đăng ký, xác thực doanh nghiệp, xem giá đến gửi yêu cầu báo giá — bốn bước cho nhà mua và bốn bước cho nhà sản xuất.',
      canonical: SITE + '/guide.html' },
    { file: 'support.html', lang: 'vi',
      title: 'Hỗ trợ khách hàng | MAKENOV',
      desc: 'Liên hệ MAKENOV — email, đăng sản phẩm, câu hỏi thường gặp và giờ làm việc. Chúng tôi trả lời trong hai ngày làm việc.',
      canonical: SITE + '/support.html' },
    /* 동적 조회 페이지 — 개별 콘텐츠의 정식 URL은 구운 페이지 쪽 */
    { file: 'company.html', lang: 'vi',
      title: 'Hồ sơ nhà sản xuất | MAKENOV',
      desc: 'Thông tin nhà sản xuất trên MAKENOV.', canonical: SITE + '/companies.html' },
    { file: 'product.html', lang: 'vi',
      title: 'Sản phẩm | MAKENOV',
      desc: 'Chi tiết sản phẩm trên MAKENOV.', canonical: SITE + '/directory.html' },
    { file: 'column.html', lang: 'vi',
      title: 'Bài viết | MAKENOV',
      desc: 'Bài viết trên MAKENOV.', canonical: SITE + '/columns.html' },
    /* 한국 공급사 대상 랜딩 — 한국어 + FAQ 스키마 */
    { file: 'maker.html', lang: 'ko',
      title: '제품 등록 문의 | MAKENOV · 전시회 없이 해외 바이어를 만나는 방법',
      desc: '부스비도, 항공권도, 통역도 없이. 사업자 인증을 마친 해외 바이어에게 제품을 상시 노출하고 견적 문의를 받으세요. 등록비 없음, 3개 국어 상세페이지 제작.',
      canonical: SITE + '/maker.html',
      jsonld: [{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: [
          ['등록 비용이 있나요?', '제품 등록과 상세페이지 제작에는 등록비를 받지 않습니다. 광고 집행을 별도로 원하시는 경우에만 협의합니다. 상담 시 정확히 안내드립니다.'],
          ['제품 사진이 변변치 않은데요.', '현재 가지고 계신 사진과 카탈로그를 먼저 보내주세요. 사용 가능한 수준인지 확인하고, 부족하면 어떤 컷이 더 필요한지 목록으로 알려드립니다.'],
          ['수출 경험이 전혀 없습니다.', '문제되지 않습니다. 다만 수출 단가와 최소주문수량은 정해두셔야 합니다. 바이어가 가장 먼저 묻는 두 가지이고, 이것이 없으면 문의가 와도 대화가 진행되지 않습니다.'],
          ['단가를 공개하고 싶지 않습니다.', '가격·MOQ·납기·공급 조건은 기본적으로 가려져 있고, 사업자 인증을 통과한 바이어에게만 열립니다. 그마저도 원치 않으시면 "문의 시 안내"로 표기할 수 있습니다.'],
          ['등록까지 얼마나 걸리나요?', '자료를 모두 받은 시점부터 통상 영업일 5일 이내에 게시됩니다. 제품 수가 많거나 번역 분량이 큰 경우 일정을 미리 안내드립니다.'],
          ['어떤 제품이 반응이 좋나요?', '현지에서 대체재를 구하기 어렵고, 한 번 도입하면 반복 구매가 일어나는 제품입니다. 소비재·안전용품·뷰티·식품 가공품에서 문의가 많습니다.'],
          ['이미 다른 플랫폼에 올라가 있어도 되나요?', '가능합니다. 독점 조건을 요구하지 않습니다.'],
        ].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      }] },
    /* 비공개·준비 중 페이지 — 색인 제외 */
    { file: 'mypage.html',  lang: 'vi', title: 'Trang của tôi | MAKENOV', robots: 'noindex,nofollow' },
    { file: 'admin/index.html', title: 'MAKENOV 관리자', robots: 'noindex,nofollow' },
  ];
  PAGES.forEach(p => injectSeo(p.file, p));

  /* sitemap.xml */
  const urls = [
    { loc: SITE + '/', lastmod: today },
    { loc: SITE + '/directory.html', lastmod: today },
    { loc: SITE + '/companies.html', lastmod: today },
    { loc: SITE + '/columns.html', lastmod: today },
    { loc: SITE + '/maker.html', lastmod: today },
    ...data.products.map(p => ({ loc: `${SITE}/products/${p.id}.html`, lastmod: p.createdAt || today })),
    ...data.columns.map(c => ({ loc: `${SITE}/columns/${colFile(c)}.html`, lastmod: c.date || today })),
  ];
  write('sitemap.xml',
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n') +
    `\n</urlset>\n`);
  console.log(`\nsitemap.xml — URL ${urls.length}개`);

  /* robots.txt */
  write('robots.txt',
`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /mypage.html

Sitemap: ${SITE}/sitemap.xml
`);
  console.log('robots.txt 생성');
  console.log('\n완료. (제품·칼럼을 관리자에서 수정했다면 이 스크립트를 다시 실행해야 반영됩니다)');
})();
