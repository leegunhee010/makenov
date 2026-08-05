/* ============================================================
   MAKENOV 카피 오버라이드
   ------------------------------------------------------------
   사이트 문구를 코드 수정 없이 관리자에서 고치기 위한 층.

   원본은 그대로 두고(i18n.js · about-copy.js · data.js), 바꾼 것만
   settings 테이블의 key='copy' 한 줄에 모아 둔다. 부팅할 때 그 값을
   원본 객체에 덮어쓰므로 t() 나 L() 은 손댈 필요가 없다.

   경로 규칙
     ui.nav_directory          공통 UI (i18n.js 의 키)
     about.hero.h1             바이어 랜딩 (about-copy.js 의 AB)
     maker.hero.h1             공급사 랜딩 (data.js 의 MK_MAKER)
     site.topbar               상단 배너 (MK_SETTINGS)

   값은 항상 {vi, ko, en}. 원본에 없는 언어는 건드리지 않는다.
   ============================================================ */

const MK_COPY_LANGS = ['vi', 'ko', 'en'];

/* 편집 대상. 페이지마다 로드되는 파일이 달라서 없으면 건너뛴다
   (about-copy.js 는 about.html 과 관리자에서만 읽는다) */
function mkCopySources(){
  return [
    { id:'ui',    label:'공통 UI',        hint:'메뉴·버튼·라벨·안내문. 모든 페이지에 쓰인다',
      kind:'i18n', root:(typeof I18N !== 'undefined') ? I18N : null },
    { id:'about', label:'서비스 소개(바이어)', hint:'about.html 본문',
      kind:'tree', root:(typeof AB !== 'undefined') ? AB : null },
    /* maker.html 은 한국 공급사 대상이라 문구가 한국어 평문이다 */
    { id:'makerbody', label:'공급사 안내 본문', hint:'maker.html 전체 — 히어로·비교표·절차·FAQ·신청 폼',
      kind:'tree', strLeaf:true, root:(typeof MKC !== 'undefined') ? MKC : null },
    { id:'maker', label:'공급사 안내 수치',  hint:'통계 4칸·주요 시장·연락처',
      kind:'tree', strLeaf:true, root:(typeof MK_MAKER !== 'undefined') ? MK_MAKER : null },
    { id:'site',  label:'상단 배너',       hint:'전 페이지 최상단 띠',
      kind:'tree', root:(typeof MK_SETTINGS !== 'undefined') ? MK_SETTINGS : null },
  ].filter(s => s.root);
}

/* {vi,ko,en} 만 담긴 객체가 잎이다 */
function mkCopyIsLeaf(v){
  if(!v || typeof v !== 'object' || Array.isArray(v)) return false;
  const ks = Object.keys(v);
  return ks.length > 0
    && ks.every(k => MK_COPY_LANGS.includes(k))
    && ks.some(k => typeof v[k] === 'string');
}

/* strLeaf = 한국어 평문 하나가 잎인 경우(MK_MAKER). {ko:'…'} 로 감싸 같은 규격으로 다룬다 */
function mkCopyWalk(node, prefix, out, strLeaf){
  if(strLeaf && typeof node === 'string'){ out.push({ path:prefix, val:{ ko:node }, str:true }); return; }
  if(mkCopyIsLeaf(node)){ out.push({ path:prefix, val:node }); return; }
  if(Array.isArray(node)){ node.forEach((v,i)=>mkCopyWalk(v, prefix+'.'+i, out, strLeaf)); return; }
  if(node && typeof node === 'object'){
    Object.keys(node).forEach(k=>mkCopyWalk(node[k], prefix ? prefix+'.'+k : k, out, strLeaf));
  }
}

/* 편집 가능한 문구 전체 목록 [{src, path, label, val}] */
function mkCopyFields(){
  const out = [];
  mkCopySources().forEach(s => {
    if(s.kind === 'i18n'){
      const base = s.root.vi || {};
      Object.keys(base).forEach(k=>{
        const val = {};
        MK_COPY_LANGS.forEach(l=>{ if(s.root[l] && typeof s.root[l][k] === 'string') val[l] = s.root[l][k]; });
        if(Object.keys(val).length) out.push({ src:s.id, path:s.id+'.'+k, label:k, val });
      });
      return;
    }
    const found = [];
    mkCopyWalk(s.root, '', found, s.strLeaf);
    found.forEach(f => out.push({ src:s.id, path:s.id+'.'+f.path, label:f.path, val:f.val, str:f.str }));
  });
  return out;
}

/* 경로 하나에 값 쓰기 */
function mkCopyApplyOne(path, val){
  const parts = String(path).split('.');
  const src = parts.shift();
  const s = mkCopySources().find(x => x.id === src);
  if(!s || !parts.length) return false;

  if(s.kind === 'i18n'){
    const key = parts.join('.');
    MK_COPY_LANGS.forEach(l=>{
      if(val[l] != null && s.root[l]) s.root[l][key] = val[l];
    });
    return true;
  }
  let node = s.root;
  for(let i = 0; i < parts.length - 1; i++){
    node = node ? node[parts[i]] : null;
    if(!node) return false;
  }
  const last = parts[parts.length - 1];
  if(!node) return false;
  if(s.strLeaf && typeof node[last] === 'string'){
    if(val.ko != null) node[last] = val.ko;
    return true;
  }
  if(!node[last] || typeof node[last] !== 'object') return false;
  MK_COPY_LANGS.forEach(l=>{ if(val[l] != null) node[last][l] = val[l]; });
  return true;
}

/* 저장된 오버라이드를 원본 객체에 덮어쓴다. 부팅 때 한 번 */
function mkApplyCopy(map){
  if(!map) return 0;
  let n = 0;
  Object.keys(map).forEach(p=>{ if(mkCopyApplyOne(p, map[p])) n++; });
  return n;
}

/* 부팅 순서 문제 방지 — 설정이 늦게 와도 다시 적용할 수 있게 보관해 둔다 */
window.MK_COPY_OVERRIDE = window.MK_COPY_OVERRIDE || {};
