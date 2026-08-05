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
      tagline: c.tagline, intro: c.intro, cover: c.cover, moq: c.moq,
    })),
    columns: cl.map(c => ({
      id: c.id, cat: c.cat, title: c.title, excerpt: c.excerpt, body: c.body,
      img: c.img, date: String(c.date || '').slice(0, 10),
      slug: c.slug || '', seoTitle: c.seo_title || '', seoDesc: c.seo_desc || '',
    })),
  };
}

function runSeed(){
  const sandbox = { localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
  vm.createContext(sandbox);
  vm.runInContext(read('assets/js/data.js') +
    '\n;__out = { MK_PRODUCTS, MK_COMPANIES, MK_COLUMNS, MK_CATEGORIES,'
    + ' MK_FAQ: typeof MK_FAQ!=="undefined"?MK_FAQ:[] };', sandbox);
  return sandbox.__out;
}

function loadFromSeed(){
  const { MK_PRODUCTS, MK_COMPANIES, MK_COLUMNS, MK_FAQ } = runSeed();
  return { source: 'data.js(시드)', products: MK_PRODUCTS, companies: MK_COMPANIES, columns: MK_COLUMNS, faqs: MK_FAQ };
}

/* 카테고리는 DB가 아니라 data.js 에만 있으므로 어느 경로로 로드하든 여기서 가져온다 */
const CATS = runSeed().MK_CATEGORIES || [];
const catName = id => { const c = CATS.find(x => x.id === id); return c ? T(c.name, 'vi') : ''; };

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

function productPage(p, co, related){
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
${staticProdLinks(p, co, related)}
</main>

<footer class="mk-footer" id="mk-footer"></footer>

${SCRIPTS()}
<script>window.MK_PID=${JSON.stringify(p.id)};</script>
<script src="${v('assets/js/page-product.js')}"></script>
</body>
</html>
`;
}

/* ---------- 공급사 정적 페이지 ----------
   회사 프로필은 company.html?id= 로만 볼 수 있어서 크롤러가 읽을 내용이 0이었다.
   기업 자체가 하나의 엔티티라 AI 답변 엔진에도 필요한 문서다. */
function companyPage(co, prods){
  const name = T(co.name, 'vi') || co.brand;
  const canonical = `${SITE}/companies/${co.id}.html`;
  const intro = stripHtml(T(co.intro, 'vi'));
  const desc = clip(T(co.tagline, 'vi') || intro || name, 155);
  const certs = (co.certs || []).filter(Boolean);

  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Organization',
    '@id': canonical + '#org',
    name, alternateName: co.brand, url: canonical,
    ...(co.logo ? { logo: absUrl(co.logo) } : {}),
    ...(intro ? { description: clip(intro, 300) } : {}),
    ...(T(co.location, 'vi') ? { address: { '@type': 'PostalAddress', addressLocality: T(co.location, 'vi') } } : {}),
    ...(co.since ? { foundingDate: String(co.since) } : {}),
    ...(certs.length ? { hasCredential: certs } : {}),
    parentOrganization: { '@id': SITE + '/#organization' },
  }, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'MAKENOV', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Nhà cung cấp', item: SITE + '/companies.html' },
      { '@type': 'ListItem', position: 3, name, item: canonical },
    ],
  }];

  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<base href="../">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoBlock({ title: `${name} | MAKENOV`, desc, canonical, ogImage: co.cover || co.logo, jsonld })}
<link rel="stylesheet" href="${v('assets/css/style.css')}">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
</head>
<body>
<header class="mk-header" id="mk-header"></header>
<main class="wrap" id="co-root">
  <nav class="blog-breadcrumb"><a href="index.html">Trang chủ</a> - <a href="companies.html">Nhà cung cấp</a> - <span>${esc(name)}</span></nav>
  <h1>${esc(name)}</h1>
  ${T(co.tagline, 'vi') ? `<p class="tagline">${esc(T(co.tagline, 'vi'))}</p>` : ''}
  <ul class="sm-list">
    ${T(co.location, 'vi') ? `<li>Địa điểm <span class="sm-meta">${esc(T(co.location, 'vi'))}</span></li>` : ''}
    ${co.since ? `<li>Thành lập <span class="sm-meta">${esc(co.since)}</span></li>` : ''}
    ${certs.length ? `<li>Chứng nhận <span class="sm-meta">${esc(certs.join(' · '))}</span></li>` : ''}
    ${co.moq ? `<li>MOQ tham khảo <span class="sm-meta">${esc(co.moq)}</span></li>` : ''}
  </ul>
  ${intro ? `<div class="pd-sec"><h2>Giới thiệu</h2><div class="pd-body"><p>${esc(intro)}</p></div></div>` : ''}
  ${!prods.length ? '' : `<div class="pd-sec">
    <h2>Sản phẩm (${prods.length})</h2>
    <ul class="sm-list">
      ${prods.map(p => `<li><a href="products/${esc(p.id)}.html">${esc(T(p.name, 'vi'))}</a> <span class="sm-meta">${esc(p.brand)}</span></li>`).join('\n      ')}
    </ul>
  </div>`}
  <nav class="pd-links">
    <a href="companies.html">Danh bạ nhà cung cấp</a>
    <a href="directory.html">Danh mục sản phẩm</a>
    <a href="maker.html">Đăng sản phẩm</a>
  </nav>
</main>
<footer class="mk-footer" id="mk-footer"></footer>
${SCRIPTS()}
<script>window.MK_COID=${JSON.stringify(co.id)};</script>
<script src="${v('assets/js/page-company.js')}"></script>
</body>
</html>
`;
}

/* 제품 페이지 정적 링크 묶음.
   page-product.js 가 #pd-root 를 통째로 다시 그리므로 그 바깥(main 끝)에 둔다.
   제품 페이지의 내부 링크가 '../' 하나뿐이라 크롤러가 여기서 더 갈 데가 없었다. */
function staticProdLinks(p, co, related){
  const cat = catName(p.cat);
  const links = [
    `<a href="directory.html">Danh mục sản phẩm</a>`,
    cat ? `<a href="directory.html?category=${esc(p.cat)}">${esc(cat)}</a>` : '',
    co ? `<a href="company.html?id=${esc(co.id)}">${esc(T(co.name, 'vi'))}</a>` : '',
    `<a href="companies.html">Danh bạ nhà cung cấp</a>`,
    `<a href="columns.html">Bài viết &amp; hướng dẫn</a>`,
  ].filter(Boolean);

  return `
  <nav class="pd-links">
    ${links.join('\n    ')}
  </nav>${!related || !related.length ? '' : `
  <section class="pd-sec">
    <h2>Sản phẩm cùng danh mục</h2>
    <div class="grid">
      ${related.map(r => `<a class="p-card" href="products/${esc(r.id)}.html"><div class="thumb"><img src="${esc(r.img)}" alt="${esc(T(r.name, 'vi'))}" loading="lazy"></div><div class="body"><span class="brand">${esc(r.brand)}</span><h3>${esc(T(r.name, 'vi'))}</h3><div class="meta"><span class="left">${esc(r.origin || '')}</span></div></div></a>`).join('\n      ')}
    </div>
  </section>`}`;
}

function colFile(c){ return c.slug || c.id; }   // 슬러그가 있으면 columns/<슬러그>.html

/* ---------- 칼럼 정적 부속물 ----------
   셋 다 #col-root 안이거나 main 자식이라 page-column.js 가 부팅하면 다시 그린다.
   JS를 실행하지 않는 크롤러에게만 의미가 있는 사본이다.
   FAQ는 그동안 JSON-LD 에만 있고 화면 텍스트로는 없었다. 답변 엔진이 본문을 읽을 때
   질문과 답이 통째로 빠져 있었다는 뜻이라, 여기서 <details> 로 같이 굽는다. */
function staticColFaq(faqs){
  if(!faqs || !faqs.length) return '';
  return `
  <section class="blog-faq">
    <h2>Câu hỏi thường gặp</h2>
    ${faqs.map(f => `<details><summary>${esc(T(f.q, 'vi'))}</summary><div>${esc(T(f.a, 'vi'))}</div></details>`).join('\n    ')}
  </section>`;
}

function staticColNav(prev, next){
  if(!prev && !next) return '';
  return `
  <div class="blog-nav">
    ${prev ? `<a href="columns/${colFile(prev)}.html"><div class="dir">Bài trước</div><b>${esc(T(prev.title, 'vi'))}</b></a>` : '<span></span>'}
    ${next ? `<a class="next" href="columns/${colFile(next)}.html"><div class="dir">Bài sau</div><b>${esc(T(next.title, 'vi'))}</b></a>` : '<span></span>'}
  </div>`;
}

function staticColOthers(others){
  if(!others || !others.length) return '';
  /* ⚠ id 는 반드시 col-others 여야 한다.
     page-column.js 가 #col-others 를 지운 뒤 자기 것을 붙이므로,
     id 가 없으면 사용자 화면에 '다른 칼럼' 섹션이 두 개로 겹친다. */
  return `
<section class="blog-main" id="col-others" style="margin-top:56px">
  <div class="sec-head"><h2>Bài viết khác</h2><a class="more" href="columns.html">Xem thêm</a></div>
  <div class="blog-list">
    ${others.map(o => `<div class="blog-item"><a class="blog-item-link" href="columns/${colFile(o)}.html"><div class="blog-item-thumb"><img src="${esc(o.img)}" alt="${esc(T(o.title, 'vi'))}" loading="lazy"></div><div class="blog-item-info"><div class="blog-item-cat">${esc(T(o.cat, 'vi'))}</div><h3 class="blog-item-tit">${esc(T(o.title, 'vi'))}</h3><div class="blog-item-meta"><span>${esc(o.date)}</span></div></div></a></div>`).join('\n    ')}
  </div>
</section>`;
}

function columnPage(c, colFaqs, prev, next, others){
  const title = T(c.title, 'vi'), cat = T(c.cat, 'vi');
  const canonical = `${SITE}/columns/${colFile(c)}.html`;
  const desc = clip(c.seoDesc || T(c.excerpt, 'vi') || stripHtml(T(c.body, 'vi')), 155);
  const jsonld = [{
    '@context': 'https://schema.org', '@type': 'Article',
    headline: title, alternativeHeadline: T(c.title, 'en'),
    description: desc, image: absUrl(c.img),
    datePublished: c.date, dateModified: c.updatedAt || c.date,
    inLanguage: 'vi', mainEntityOfPage: canonical,
    /* 신선도·출처 신호. 저자를 조직으로 두되 발행처와 구분해 둔다 */
    author: { '@type': 'Organization', name: 'MAKENOV', url: SITE + '/' },
    publisher: { '@type': 'Organization', name: 'MAKENOV', url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/assets/img/logo.png' } },
    isAccessibleForFree: true,
    articleSection: cat,
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
${staticColFaq(colFaqs)}${staticColNav(prev, next)}
</article>
${staticColOthers(others)}
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
  ['products', 'columns', 'companies'].forEach(dir => {
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
  data.products.forEach(p => {
    /* 같은 카테고리 제품 3개를 정적으로 연결한다 */
    const related = data.products.filter(x => x.id !== p.id && x.cat === p.cat).slice(0, 3);
    write(`products/${p.id}.html`, productPage(p, coMap[p.companyId], related));
  });
  console.log(`products/*.html ${data.products.length}개 생성`);
  let colFaqCount = 0;
  data.columns.forEach((c, i) => {
    const cf = faqsFor(c.id);
    colFaqCount += cf.length;
    /* 이전·다음·다른 칼럼을 정적으로 깔아 칼럼끼리 링크가 이어지게 한다.
       이전에는 칼럼 페이지의 내부 링크가 2개(홈·목록)뿐이라 크롤러가 다음 문서로 갈 길이 없었다 */
    const others = data.columns.filter(x => x.id !== c.id).slice(0, 2);
    write(`columns/${colFile(c)}.html`,
      columnPage(c, cf, data.columns[i - 1], data.columns[i + 1], others));
  });
  console.log(`columns/*.html ${data.columns.length}개 생성 (${data.columns.filter(c=>c.slug).length}개 슬러그 사용, 칼럼 FAQ ${colFaqCount}개)`);
  data.companies.forEach(co =>
    write(`companies/${co.id}.html`,
      companyPage(co, data.products.filter(p => p.companyId === co.id))));
  console.log(`companies/*.html ${data.companies.length}개 생성`);
  console.log(`FAQ ${faqs.length}개 → 홈 FAQPage 스키마\n`);

  /* 공개 페이지 head 주입 */
  /* 엔티티 정의. @id 를 붙여 다른 스키마가 이 조직을 참조하게 한다.
     ⚠ 확인되지 않은 값은 넣지 않는다. 주소·설립연도·SNS 계정은 확정되면 추가할 것
        (푸터 SNS 링크는 아직 전부 '#' 자리표시자라 sameAs 에 못 넣는다) */
  const ORG = {
    '@context': 'https://schema.org', '@type': 'Organization',
    '@id': SITE + '/#organization',
    name: 'MAKENOV', url: SITE + '/', logo: SITE + '/assets/img/logo.png',
    description: 'Nền tảng B2B tập hợp sản phẩm đổi mới của các nhà cung cấp toàn cầu. '
      + 'Đơn giá và số lượng đặt tối thiểu được mở cho nhà mua hàng đã xác thực doanh nghiệp, '
      + 'và yêu cầu được chuyển thẳng tới nhà cung cấp, không qua trung gian.',
    knowsLanguage: ['vi', 'ko', 'en'],
    areaServed: [
      { '@type': 'Country', name: 'Vietnam' },
      { '@type': 'Country', name: 'South Korea' },
    ],
    contactPoint: {
      '@type': 'ContactPoint', contactType: 'customer support',
      email: 'contact@makenov.com', availableLanguage: ['Vietnamese', 'Korean', 'English'],
    },
  };
  const PAGES = [
    { file: 'index.html', lang: 'vi', ogType: 'website',
      title: 'MAKENOV — Nền tảng B2B sản phẩm sáng tạo toàn cầu',
      desc: 'MAKENOV kết nối sản phẩm sáng tạo từ các nhà sản xuất toàn cầu với nhà mua hàng đã xác thực. Xác thực doanh nghiệp miễn phí để xem giá và gửi yêu cầu báo giá.',
      canonical: SITE + '/',
      jsonld: [ORG, {
        '@context': 'https://schema.org', '@type': 'WebSite',
        '@id': SITE + '/#website',
        name: 'MAKENOV', url: SITE + '/',
        publisher: { '@id': SITE + '/#organization' },
        inLanguage: ['vi', 'ko', 'en'],
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
      canonical: SITE + '/support.html',
      /* FAQ 탭이 이 페이지에 실제로 있으므로 스키마도 여기 둔다 */
      jsonld: [...(faqs.length ? [{
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({ '@type': 'Question', name: T(f.q, 'vi'),
          acceptedAnswer: { '@type': 'Answer', text: T(f.a, 'vi') } })),
      }] : []), {
        '@context': 'https://schema.org', '@type': 'ContactPage',
        url: SITE + '/support.html', isPartOf: { '@id': SITE + '/#website' },
        publisher: { '@id': SITE + '/#organization' },
      }] },
    /* ?id= 로 보는 뷰어 화면. 같은 내용의 정식 주소는
       products/ · columns/ · companies/ 쪽이라 색인은 막고 링크만 따라가게 둔다.
       안 그러면 같은 제품이 두 주소로 크롤링된다. */
    { file: 'product.html', lang: 'vi',
      title: 'Sản phẩm | MAKENOV',
      desc: 'Chi tiết sản phẩm trên MAKENOV.', robots: 'noindex,follow' },
    { file: 'company.html', lang: 'vi',
      title: 'Nhà cung cấp | MAKENOV',
      desc: 'Hồ sơ nhà cung cấp trên MAKENOV.', robots: 'noindex,follow' },
    { file: 'column.html', lang: 'vi',
      title: 'Bài viết | MAKENOV',
      desc: 'Bài viết trên MAKENOV.', robots: 'noindex,follow' },
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

  /* sitemap.xml — 공개 페이지는 빠짐없이 넣는다.
     about/guide/support 가 빠져 있었다. 셋 다 내용이 있는 색인 대상이다. */
  const urls = [
    { loc: SITE + '/', lastmod: today },
    { loc: SITE + '/directory.html', lastmod: today },
    { loc: SITE + '/companies.html', lastmod: today },
    { loc: SITE + '/columns.html', lastmod: today },
    { loc: SITE + '/about.html', lastmod: today },
    { loc: SITE + '/guide.html', lastmod: today },
    { loc: SITE + '/support.html', lastmod: today },
    { loc: SITE + '/sitemap.html', lastmod: today },
    { loc: SITE + '/maker.html', lastmod: today },
    ...data.products.map(p => ({ loc: `${SITE}/products/${p.id}.html`, lastmod: p.createdAt || today })),
    ...data.columns.map(c => ({ loc: `${SITE}/columns/${colFile(c)}.html`, lastmod: c.date || today })),
    ...data.companies.map(c => ({ loc: `${SITE}/companies/${c.id}.html`, lastmod: today })),
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

  /* sitemap.html — 사람도 크롤러도 읽는 전체 목록.
     제품·칼럼 카드가 전부 product.html?id= / column.html?id= 로 링크해서,
     정작 색인 대상인 products/*.html · columns/*.html 로 가는 내부 링크가
     sitemap.xml 밖에 없었다. 푸터에서 이 페이지를 걸어 모든 페이지가 이어지게 한다. */
  const smHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoBlock({
    title: 'Sơ đồ trang | MAKENOV',
    desc: 'Toàn bộ trang của MAKENOV — sản phẩm, nhà cung cấp, bài viết và hướng dẫn.',
    canonical: SITE + '/sitemap.html',
    jsonld: [{ '@context': 'https://schema.org', '@type': 'WebPage',
      url: SITE + '/sitemap.html', name: 'Sơ đồ trang',
      isPartOf: { '@id': SITE + '/#website' } }],
  })}
<link rel="stylesheet" href="${v('assets/css/style.css')}">
<link rel="icon" type="image/svg+xml" href="assets/img/favicon.svg">
</head>
<body>
<header class="mk-header" id="mk-header"></header>
<main class="wrap">
  <div class="dir-top"><h1>Sơ đồ trang</h1><p>Toàn bộ trang công khai của MAKENOV.</p></div>

  <section class="sec"><h2>Trang chính</h2>
    <ul class="sm-list">
      <li><a href="index.html">Trang chủ</a></li>
      <li><a href="directory.html">Danh mục sản phẩm</a></li>
      <li><a href="companies.html">Danh bạ nhà cung cấp</a></li>
      <li><a href="columns.html">Bài viết &amp; hướng dẫn</a></li>
      <li><a href="about.html">Giới thiệu dịch vụ (nhà mua hàng)</a></li>
      <li><a href="maker.html">Đăng sản phẩm (nhà cung cấp)</a></li>
      <li><a href="guide.html">Hướng dẫn sử dụng</a></li>
      <li><a href="support.html">Hỗ trợ khách hàng</a></li>
    </ul>
  </section>

  <section class="sec"><h2>Sản phẩm (${data.products.length})</h2>
    <ul class="sm-list">
      ${data.products.map(p => `<li><a href="products/${esc(p.id)}.html">${esc(T(p.name, 'vi'))}</a> <span class="sm-meta">${esc(p.brand)}${catName(p.cat) ? ' · ' + esc(catName(p.cat)) : ''}</span></li>`).join('\n      ')}
    </ul>
  </section>

  <section class="sec"><h2>Bài viết (${data.columns.length})</h2>
    <ul class="sm-list">
      ${data.columns.map(c => `<li><a href="columns/${colFile(c)}.html">${esc(T(c.title, 'vi'))}</a> <span class="sm-meta">${esc(c.date)}</span></li>`).join('\n      ')}
    </ul>
  </section>

  <section class="sec"><h2>Nhà cung cấp (${data.companies.length})</h2>
    <ul class="sm-list">
      ${data.companies.map(c => `<li><a href="companies/${esc(c.id)}.html">${esc(T(c.name, 'vi'))}</a> <span class="sm-meta">${esc(T(c.location, 'vi'))}</span></li>`).join('\n      ')}
    </ul>
  </section>
</main>
<footer class="mk-footer" id="mk-footer"></footer>
${SCRIPTS()}
</body>
</html>
`;
  write('sitemap.html', smHtml);
  console.log('sitemap.html 생성 (제품·칼럼 정적 페이지로 가는 내부 링크)');

  /* llms.txt — AI 답변 엔진용 안내 파일.
     검색 크롤러가 robots.txt 를 보듯, 요즘 LLM 도구들이 이 파일을 먼저 본다.
     사이트가 무엇이고 어느 문서를 읽어야 하는지를 사람이 읽는 문장으로 적는다. */
  const llms =
`# MAKENOV

> 전 세계 공급사의 혁신 제품을 한자리에 모아 두고, 사업자 인증을 통과한 해외 바이어에게
> 단가와 최소주문수량을 공개하는 B2B 소싱 플랫폼입니다. 문의는 중간상 없이 공급사에
> 바로 전달되며, 필요하면 화상 미팅도 요청할 수 있습니다.

주요 이용자는 베트남을 비롯한 해외 바이어와, 해외 판로를 찾는 공급사입니다.
제품 정보는 베트남어·영어·한국어로 제공됩니다.

## 알아두어야 할 것

- 가격, 최소주문수량(MOQ), 납기는 기본적으로 가려져 있습니다. 사업자 인증을 통과한
  계정에만 열립니다. 그래서 제품 페이지에 단가가 보이지 않는 것은 오류가 아닙니다.
- 인증 방식은 국가별로 다릅니다. 베트남은 세금코드(MST), 한국은 사업자등록번호 상태조회,
  그 외 국가는 회사 도메인 이메일로 확인합니다.
- 가입, 인증, 제품 열람, 견적 요청은 모두 무료입니다.
- 공급사에게 제품 등록비를 받지 않으며 독점 조건을 요구하지 않습니다.

## 문서

- [서비스 소개(바이어)](${SITE}/about.html): 바이어가 무엇을 할 수 있는지
- [공급사 안내](${SITE}/maker.html): 제품 등록 절차와 조건. 한국어
- [이용 가이드](${SITE}/guide.html): 가입부터 견적 요청까지 기능별 설명
- [제품 목록](${SITE}/directory.html): 카테고리별 등록 제품
- [공급사 목록](${SITE}/companies.html): 등록 기업 프로필
- [고객센터](${SITE}/support.html): 공지사항, 자주 묻는 질문, 1:1 문의

## 칼럼

${data.columns.map(c => `- [${T(c.title, 'ko') || T(c.title, 'vi')}](${SITE}/columns/${colFile(c)}.html): ${clip(T(c.excerpt, 'ko') || T(c.excerpt, 'vi'), 120)}`).join('\n')}

## 연락

- 이메일: contact@makenov.com
- 사이트맵: ${SITE}/sitemap.xml
`;
  write('llms.txt', llms);
  console.log('llms.txt 생성');

  console.log('\n완료. (제품·칼럼을 관리자에서 수정했다면 이 스크립트를 다시 실행해야 반영됩니다)');
})();
