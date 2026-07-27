/* data.js 의 현재 내용을 Supabase 시드 SQL(02_seed.sql)로 굽는다.
   실행: node supabase/gen-seed.js     (makenov 폴더에서)
   관리자에서 편집한 내용을 반영하려면 먼저 '설정 → data.js 내보내기'로 파일을 교체하세요. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'assets/js/data.js'), 'utf8');

/* data.js 는 브라우저용이라 그대로 require 할 수 없다.
   localStorage / document 를 흉내 낸 샌드박스에서 평가한다. */
const sandbox = {
  localStorage: { getItem: () => null, setItem: () => {} },
  console,
};
const vm = require('vm');
vm.createContext(sandbox);
/* data.js 는 const 로 선언하므로 컨텍스트 객체에 자동으로 붙지 않는다. 끝에 수동으로 노출시킨다. */
vm.runInContext(src + `
;globalThis.__out = { MK_COMPANIES, MK_PRODUCTS, MK_COLUMNS, MK_HERO };`, sandbox);

const { MK_COMPANIES, MK_PRODUCTS, MK_COLUMNS, MK_HERO } = sandbox.__out;

const q = v => v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`;
const j = v => `'${JSON.stringify(v ?? {}).replace(/'/g, "''")}'::jsonb`;
const arr = v => !v || !v.length ? `'{}'` : `array[${v.map(q).join(',')}]`;
const b = v => v ? 'true' : 'false';

let out = `-- ============================================================
--  MAKENOV 시드 데이터 — supabase/gen-seed.js 가 생성했습니다. 직접 고치지 마세요.
--  01_schema.sql 실행 후 이 파일을 실행하세요. 여러 번 실행해도 안전합니다(upsert).
--  생성 시각: ${new Date().toISOString()}
-- ============================================================

`;

out += `-- ---------- 제조사 ${MK_COMPANIES.length}곳 ----------\n`;
MK_COMPANIES.forEach((c, i) => {
  out += `insert into companies (id,brand,cat,name,tagline,intro,location,since,staff,export,brn,ceo,tel,site,certs,moq_policy,logo,cover,sort) values (
  ${q(c.id)}, ${q(c.brand)}, ${q(c.cat)}, ${j(c.name)}, ${j(c.tagline)}, ${j(c.intro)}, ${j(c.location)},
  ${q(c.since)}, ${q(c.staff)}, ${q(c.export)}, ${q(c.brn)}, ${q(c.ceo)}, ${q(c.tel)}, ${q(c.site)},
  ${arr(c.certs)}, ${q(c.moqPolicy)}, ${q(c.logo)}, ${q(c.cover)}, ${i})
on conflict (id) do update set
  brand=excluded.brand, cat=excluded.cat, name=excluded.name, tagline=excluded.tagline,
  intro=excluded.intro, location=excluded.location, since=excluded.since, staff=excluded.staff,
  export=excluded.export, brn=excluded.brn, ceo=excluded.ceo, tel=excluded.tel, site=excluded.site,
  certs=excluded.certs, moq_policy=excluded.moq_policy, logo=excluded.logo, cover=excluded.cover;\n\n`;
});

out += `-- ---------- 제품 ${MK_PRODUCTS.length}개 ----------\n`;
MK_PRODUCTS.forEach(p => {
  out += `insert into products (id,company_id,cat,brand,origin,name,tagline,brand_story,img,gallery,video,detail,inquiries,views,featured,is_new,created_at) values (
  ${q(p.id)}, ${q(p.companyId)}, ${q(p.cat)}, ${q(p.brand)}, ${q(p.origin)},
  ${j(p.name)}, ${j(p.tagline)}, ${j(p.brandStory)},
  ${q(p.img)}, ${arr(p.gallery)}, ${q(p.video)}, ${j(p.detail || [])},
  ${p.inquiries || 0}, ${p.views || 0}, ${b(p.featured)}, ${b(p.isNew)}, ${q(p.createdAt)})
on conflict (id) do update set
  company_id=excluded.company_id, cat=excluded.cat, brand=excluded.brand, origin=excluded.origin,
  name=excluded.name, tagline=excluded.tagline, brand_story=excluded.brand_story,
  img=excluded.img, gallery=excluded.gallery, video=excluded.video, detail=excluded.detail,
  featured=excluded.featured, is_new=excluded.is_new;

insert into product_terms (product_id,price,moq,lead,terms) values (
  ${q(p.id)}, ${q(p.price)}, ${q(p.moq)}, ${q(p.lead)}, ${q(p.terms)})
on conflict (product_id) do update set
  price=excluded.price, moq=excluded.moq, lead=excluded.lead, terms=excluded.terms, updated_at=now();\n\n`;
});

out += `-- ---------- 칼럼 ${MK_COLUMNS.length}건 ----------\n`;
MK_COLUMNS.forEach(c => {
  out += `insert into columns_post (id,cat,title,excerpt,body,img,date) values (
  ${q(c.id)}, ${j(c.cat)}, ${j(c.title)}, ${j(c.excerpt)}, ${j(c.body)}, ${q(c.img)}, ${q(c.date)})
on conflict (id) do update set
  cat=excluded.cat, title=excluded.title, excerpt=excluded.excerpt,
  body=excluded.body, img=excluded.img, date=excluded.date;\n\n`;
});

out += `-- ---------- 홈 히어로 ${MK_HERO.length}장 ----------\n`;
MK_HERO.forEach((h, i) => {
  out += `insert into hero_slides (id,art,link,kicker,title,sub,sort) values (
  ${q('h' + (i + 1))}, ${q(h.art)}, ${q(h.link)}, ${j(h.kicker)}, ${j(h.title)}, ${j(h.sub)}, ${i})
on conflict (id) do update set
  art=excluded.art, link=excluded.link, kicker=excluded.kicker,
  title=excluded.title, sub=excluded.sub, sort=excluded.sort;\n\n`;
});

out += `-- ============================================================
--  마지막 단계 — 관리자 계정 지정
--  1) Supabase → Authentication → Users → Add user 로 관리자 계정을 만듭니다.
--  2) 그 계정의 UID 를 복사해 아래 주석을 풀고 실행하세요.
-- ============================================================
-- insert into admins (user_id) values ('여기에-관리자-UID-붙여넣기')
-- on conflict do nothing;
`;

fs.writeFileSync(path.join(__dirname, '02_seed.sql'), out, 'utf8');
console.log(`02_seed.sql 생성 완료 — 제조사 ${MK_COMPANIES.length} / 제품 ${MK_PRODUCTS.length} / 칼럼 ${MK_COLUMNS.length} / 히어로 ${MK_HERO.length}`);
console.log(`크기 ${(out.length / 1024).toFixed(1)} KB`);
