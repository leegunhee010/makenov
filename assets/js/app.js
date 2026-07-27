/* MAKENOV common — header/footer render, lang toggle, cart badge, auth modal (MST verify), inquiry modal, lock gating */

/* ---------- helpers ---------- */
function esc(s){ return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function timeAgo(iso){
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff/36e5);
  if(h < 1) return t('just_now');
  if(h < 24) return h + ' ' + t('hours_ago');
  return Math.floor(h/24) + ' ' + t('days_ago');
}
/* 읽기 시간 추정 — HTML 제거 후 글자수 기준 (한국어 약 450자/분) */
function readTime(html){
  const txt = String(html||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const min = Math.max(1, Math.round(txt.length / 450));
  return min + t('read_min');
}
/* 에셋 캐시 버전 — HTML의 ?v= 를 그대로 물려받는다.
   이미지·SVG처럼 HTML에 직접 안 적히는 파일에도 같은 버전을 붙이기 위함. */
const MK_V = (()=>{
  const s = document.querySelector('script[src*="data.js"]');
  const m = s && s.getAttribute('src').match(/[?&]v=([^&]+)/);
  return m ? m[1] : '';
})();
function mkAsset(path){ return MK_V ? path + (path.includes('?')?'&':'?') + 'v=' + MK_V : path; }

/* 영상 URL → 임베드 주소. 관리자가 유튜브 주소를 그대로 붙여넣어도 동작하게 변환한다.
   지원: youtube.com/watch?v= · youtu.be/ · /embed/ · vimeo.com/ · 그 외는 입력값 그대로 */
function ytEmbed(url){
  const u = String(url||'').trim();
  if(!u) return '';
  let m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if(m) return 'https://www.youtube.com/embed/' + m[1];
  m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if(m) return 'https://player.vimeo.com/video/' + m[1];
  return u;
}
function toast(msg){
  let el = document.querySelector('.toast');
  if(!el){ el = document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
  el.textContent = msg; el.classList.add('show');
  clearTimeout(el._t); el._t = setTimeout(()=>el.classList.remove('show'), 2600);
}

/* ---------- header / footer ---------- */
function renderChrome(active){
  const s = Store.session();

  /* 상단 띠배너 (헤더 바깥 · 스티키 아님) */
  const hdr = document.getElementById('mk-header');
  if(!document.getElementById('mk-topbar') && !sessionStorage.getItem('mk_topbar_off')){
    const tb = document.createElement('div');
    tb.id = 'mk-topbar'; tb.className = 'topbar';
    tb.innerHTML = `<div class="wrap"><span data-i18n="topbar_msg"></span><button class="x" onclick="sessionStorage.setItem('mk_topbar_off','1');this.closest('.topbar').remove()">✕</button></div>`;
    hdr.parentNode.insertBefore(tb, hdr);
  }

  hdr.innerHTML = `
  <div class="wrap"><a class="mk-logo" href="index.html">MAKE<b>NOV</b></a><div class="mk-search"><input id="mk-search-input" type="search" data-i18n-ph="search_ph"
        onkeydown="if(event.key==='Enter'&&this.value.trim())location.href='directory.html?q='+encodeURIComponent(this.value.trim())"></div><nav class="mk-nav"><a href="directory.html" data-i18n="nav_directory"></a><a href="companies.html" data-i18n="nav_companies"></a><a href="columns.html" data-i18n="nav_columns"></a><a href="webinar.html" data-i18n="nav_webinar"></a></nav><div class="mk-head-right"><div class="mk-lang"><button data-lang="vi" onclick="setLang('vi')">VI</button><button data-lang="ko" onclick="setLang('ko')">KO</button><button data-lang="en" onclick="setLang('en')">EN</button></div><a class="mk-cart" href="mypage.html" title="Wishlist">♡<span class="badge" id="cart-badge">0</span></a>
      ${s
        ? `<a class="mk-auth" href="mypage.html">${esc(s.contactName||s.email.split('@')[0])}</a><button class="mk-auth" onclick="Store.logout();location.reload()" data-i18n="logout"></button>`
        : `<button class="mk-auth" onclick="openAuth('login')" data-i18n="login"></button><button class="btn btn-primary btn-sm" onclick="openAuth('signup')" data-i18n="signup"></button>`}
    </div></div>`;
  document.getElementById('mk-footer').innerHTML = `
  <div class="wrap"><div><div class="logo">MAKE<b>NOV</b></div><p class="desc" data-i18n="ft_desc"></p><div class="social"><a href="#" title="Facebook">f</a><a href="#" title="TikTok">t</a><a href="#" title="YouTube">▶</a><a href="#" title="Instagram">◎</a><a href="#" title="Zalo">Z</a></div></div><div><h4 data-i18n="ft_platform"></h4><a href="directory.html" data-i18n="nav_directory"></a><a href="columns.html" data-i18n="nav_columns"></a><a href="webinar.html" data-i18n="nav_webinar"></a></div><div><h4 data-i18n="ft_support"></h4><a href="#" data-i18n="ft_faq"></a><a href="mailto:contact@makenov.com" data-i18n="ft_contact"></a></div><div><h4 data-i18n="ft_company"></h4><a href="#" data-i18n="ft_about"></a><a href="maker.html" data-i18n="ft_kr"></a></div></div><div class="base">© 2026 MAKENOV. All rights reserved. · Innovative Korean products for global buyers.</div>`;
  updateCartBadge();
  applyI18n();
}
function updateCartBadge(){
  const b = document.getElementById('cart-badge');
  if(b) b.textContent = Store.cart().length;
}

/* ---------- lock gating: CTA requires verified session ---------- */
function requireAuth(fn){
  if(Store.session()) { fn(); return; }
  toast(t('auth_need'));
  openAuth('signup');
}
function unlockIfAuthed(){
  if(Store.session()) document.querySelectorAll('.lockval').forEach(el=>el.classList.add('open'));
}

/* ---------- cart ---------- */
function toggleCart(pid, btn){
  requireAuth(()=>{
    const added = Store.cartToggle(pid);
    toast(added ? t('added_cart') : t('removed_cart'));
    updateCartBadge();
    if(btn){ btn.classList.toggle('on', added); }
    document.dispatchEvent(new CustomEvent('mk:cart'));
  });
}

/* ---------- modals ---------- */
function mkModal(html){
  let back = document.getElementById('mk-modal-back');
  if(!back){
    back = document.createElement('div'); back.id='mk-modal-back'; back.className='modal-back';
    back.addEventListener('click', e=>{ if(e.target===back) closeModal(); });
    document.body.appendChild(back);
  }
  back.innerHTML = `<div class="modal">${html}<button class="x" onclick="closeModal()">✕</button></div>`;
  back.classList.add('open');
  applyI18n(back);
}
function closeModal(){ const b=document.getElementById('mk-modal-back'); if(b) b.classList.remove('open'); }

/* ---------- auth modal (country-driven 3-step signup) ---------- */
let _verified = null;          // 인증 통과 결과
let _suCountry = 'VN';         // 선택된 국가

function openAuth(mode){
  if(mode==='login'){
    mkModal(`
      <h2 data-i18n="auth_login_title"></h2><p class="sub" data-i18n="auth_signup_sub"></p><div class="f-row"><label data-i18n="auth_email"></label><input id="li-email" type="email" autocomplete="email"></div><div class="f-row"><label data-i18n="auth_password"></label><input id="li-pw" type="password"></div><button class="btn btn-primary btn-block" onclick="doLogin()" data-i18n="login"></button><p class="switch-auth"><span data-i18n="auth_none"></span> <a onclick="openAuth('signup')" data-i18n="signup"></a></p>`);
    return;
  }
  _verified = null;
  _suCountry = MK_LANG === 'ko' ? 'KR' : (MK_LANG === 'en' ? 'US' : 'VN');
  mkModal(`
    <h2 data-i18n="auth_signup_title"></h2><p class="sub" data-i18n="auth_signup_sub"></p><div class="steps"><i class="on" id="bar1"></i><i id="bar2"></i><i id="bar3"></i></div><div id="su-step1"><div class="f-row"><label data-i18n="auth_country"></label><select id="su-country" onchange="_suCountry=this.value">
          ${MK_COUNTRIES.map(c=>`<option value="${c.code}">${c.flag} ${esc(L(c.name))}</option>`).join('')}
        </select></div><div class="f-row"><label data-i18n="auth_email"></label><input id="su-email" type="email" autocomplete="email"></div><div class="f-row"><label data-i18n="auth_password"></label><input id="su-pw" type="password" autocomplete="new-password"></div><button class="btn btn-primary btn-block" onclick="suNext()" data-i18n="auth_next"></button></div><div id="su-step2" style="display:none"></div><div id="su-step3" style="display:none"><div class="mst-result" id="ok-box" style="display:block"></div><div class="f-row"><label data-i18n="auth_contact_name"></label><input id="su-name"></div><div class="f-row"><label data-i18n="auth_position"></label><input id="su-position"></div><div class="f-row"><label data-i18n="auth_phone"></label><div class="mst-row"><input id="su-dial" readonly style="max-width:78px;text-align:center"><input id="su-phone" inputmode="tel"></div></div><div class="f-row"><label id="lbl-msgr"></label><input id="su-msgr" inputmode="tel"></div><button class="btn btn-primary btn-block" onclick="suDone()" data-i18n="auth_done"></button></div><p class="switch-auth"><span data-i18n="auth_have"></span> <a onclick="openAuth('login')" data-i18n="login"></a></p>`);
  const sel = document.getElementById('su-country');
  if(sel) sel.value = _suCountry;
}

/* 1단계 → 국가별 인증 화면 생성 */
function suNext(){
  const email = document.getElementById('su-email').value.trim();
  const pw = document.getElementById('su-pw').value;
  if(!/^\S+@\S+\.\S+$/.test(email) || pw.length < 4){ toast(t('auth_need_basic')); return; }
  _suCountry = document.getElementById('su-country').value;
  const c = mkCountry(_suCountry);

  let inner = '';
  if(c.method === 'mst'){
    inner = `
      <div class="f-row"><label data-i18n="auth_mst"></label><div class="mst-row"><input id="v-regno" inputmode="numeric" maxlength="14" placeholder="0100109106"><button class="btn btn-soft" id="v-btn" onclick="runVerify()" data-i18n="auth_mst_check"></button></div><p class="f-hint" data-i18n="auth_mst_hint"></p></div>`;
  } else if(c.method === 'brn'){
    inner = `
      <div class="f-row"><label data-i18n="auth_brn"></label><input id="v-regno" inputmode="numeric" maxlength="12" placeholder="123-45-67890"
               oninput="this.value=formatBRN(this.value)"><p class="f-hint" data-i18n="auth_brn_hint2"></p></div><div class="f-row"><label data-i18n="auth_company"></label><input id="v-company" placeholder="(주)메이크노브"></div><button class="btn btn-soft btn-block" id="v-btn" onclick="runVerify()" data-i18n="auth_mst_check"></button>`;
  } else {
    inner = `
      <div class="f-row"><label data-i18n="auth_company"></label><input id="v-company"></div><div class="f-row"><label data-i18n="auth_biz_email"></label><input id="v-email" type="email" value="${esc(email)}"><p class="f-hint" data-i18n="auth_domain_hint"></p></div><button class="btn btn-soft btn-block" id="v-btn" onclick="runVerify()" data-i18n="auth_mst_check"></button>`;
  }
  document.getElementById('su-step2').innerHTML = inner + `<div class="mst-result" id="v-result"></div>`;
  document.getElementById('su-step1').style.display='none';
  document.getElementById('su-step2').style.display='block';
  document.getElementById('bar2').classList.add('on');
  applyI18n(document.getElementById('su-step2'));
}

/* 국가별 인증 실행 */
async function runVerify(){
  const c = mkCountry(_suCountry);
  const box = document.getElementById('v-result');
  const btn = document.getElementById('v-btn');
  const val = id => { const el=document.getElementById(id); return el ? el.value.trim() : ''; };

  // 재인증 시작 시 직전 결과를 반드시 폐기 — 실패 후 이전 통과분으로 가입되는 것을 차단
  _verified = null;
  document.getElementById('su-step3').style.display = 'none';
  document.getElementById('bar3').classList.remove('on');

  btn.disabled = true; btn.textContent = t('auth_verifying');
  box.style.display = 'none';

  const res = await verifyBusiness(_suCountry, {
    regNo: val('v-regno'), company: val('v-company'),
    ownerName: val('v-owner'), email: val('v-email') || val('su-email'),
  });

  btn.disabled = false; btn.textContent = t('auth_mst_check');
  box.style.display = 'block';

  if(!res.ok){
    const key = 'err_' + res.err;
    const dict = I18N[MK_LANG] || I18N.vi;
    box.className = 'mst-result err';
    box.textContent = dict[key] || I18N.vi[key] || t('auth_mst_fail');
    return;
  }
  _verified = { ...res, country:_suCountry, regNo: val('v-regno') };

  // 3단계로 이동
  document.getElementById('su-step2').style.display='none';
  document.getElementById('su-step3').style.display='block';
  document.getElementById('bar3').classList.add('on');
  document.getElementById('ok-box').innerHTML =
    `✓ <b>${t('auth_mst_ok')}</b><br>${esc(res.company)}` +
    (res.address ? `<br><span style="color:var(--mk-muted)">${esc(res.address)}</span>` : '') +
    (res.status  ? `<br><span style="color:var(--mk-muted);font-size:12px">${esc(res.status)}</span>` : '');
  document.getElementById('su-dial').value = c.dial;
  document.getElementById('su-phone').placeholder = c.phEx;
  document.getElementById('lbl-msgr').textContent = c.messenger;
  applyI18n(document.getElementById('su-step3'));
}

function suDone(){
  if(!_verified){ toast(t('auth_mst_fail')); return; }
  const c = mkCountry(_suCountry);
  const name = document.getElementById('su-name').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  if(!name || !phone){ toast(t('auth_need_basic')); return; }
  const res = Store.signup({
    // 도메인 인증 국가는 인증에 쓴 회사 이메일이 계정 이메일이 된다
    email: (_verified.accountEmail || document.getElementById('su-email').value.trim()).toLowerCase(),
    password: document.getElementById('su-pw').value,
    country: _suCountry, countryName: L(c.name),
    regNo: _verified.regNo, mst: _verified.regNo,        // mst = 하위호환 필드
    company: _verified.company, address: _verified.address, status: _verified.status,
    verifiedBy: _verified.checked,                        // gov | nts | checksum | domain
    contactName: name, position: document.getElementById('su-position').value.trim(),
    phone: c.dial + ' ' + phone,
    messenger: c.messenger, messengerId: document.getElementById('su-msgr').value.trim(),
    zalo: c.dial + ' ' + phone,                           // zalo = 하위호환 필드
  });
  if(!res.ok){ toast(' ' + (res.err==='exists'?'Email already registered':'Error')); return; }
  closeModal(); toast(t('auth_welcome'));
  setTimeout(()=>location.reload(), 700);
}
function doLogin(){
  const res = Store.login(document.getElementById('li-email').value.trim(), document.getElementById('li-pw').value);
  if(!res.ok){ toast(''); return; }
  closeModal(); setTimeout(()=>location.reload(), 400);
}

/* ---------- inquiry modal ---------- */
function openInquiry(pids){    // pids: array of product ids
  requireAuth(()=>{
    const items = pids.map(id=>mkProduct(id)).filter(Boolean);
    mkModal(`
      <h2 data-i18n="inq_title"></h2><p class="sub">${items.map(p=>esc(L(p.name))).join(' · ')}</p><div class="f-row"><label data-i18n="inq_message"></label><textarea id="inq-msg" rows="4" data-i18n-ph="inq_message_ph"></textarea></div><button class="btn btn-primary btn-block" onclick="sendInquiry('${pids.join(',')}')" data-i18n="inq_send"></button>`);
  });
}
function sendInquiry(pidCsv){
  const msg = document.getElementById('inq-msg').value.trim();
  const pids = pidCsv.split(',');
  pids.forEach(pid=>Store.addInquiry(pid, msg));
  closeModal(); toast(t('inq_ok'));
  document.dispatchEvent(new CustomEvent('mk:inquiry'));
}
function openCatalog(pid){
  requireAuth(()=>{ toast(t('catalog_ok')); });
}

/* ---------- shared renderers ---------- */
function companyCard(c){
  const n = mkCompanyProducts(c.id).length;
  return `
  <a class="co-card" href="company.html?id=${c.id}"><div class="cv"><img src="${c.cover}" alt="" loading="lazy"></div><div class="bd"><img class="lg" src="${c.logo}" alt="" loading="lazy"><h3>${esc(L(c.name))}</h3><p class="tag">${esc(L(c.tagline))}</p><div class="meta"><span>${esc(L(c.location))}</span><i></i><span><b>${n}</b> <span data-i18n="co_prod_unit"></span></span><i></i><span>since ${esc(c.since)}</span></div></div></a>`;
}
function productCard(p){
  const inCart = Store.cartHas(p.id);
  const flag = p.isNew ? `<span class="flag" data-i18n="spot_new"></span>` : (p.featured?`<span class="flag">FEATURED</span>`:'');
  return `
  <a class="p-card" href="product.html?id=${p.id}"><div class="thumb"><img src="${p.img}" alt="" loading="lazy">${flag}
      <button class="heart ${inCart?'on':''}" onclick="event.preventDefault();event.stopPropagation();toggleCart('${p.id}',this)">${inCart?'♥':'♡'}</button></div><div class="body"><span class="brand">${esc(p.brand)}</span><h3>${esc(L(p.name))}</h3><div class="meta"><span class="rate">${p.inquiries}<span data-i18n="inquiries_count"></span></span><span class="amt">${p.views.toLocaleString()}</span><span class="left">${esc(p.origin)}</span></div></div></a>`;
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  document.documentElement.lang = MK_LANG;
  /* Supabase 모드면 세션·콘텐츠를 먼저 받아 전역 배열을 채운다 (렌더 코드는 동기라서) */
  if(typeof MkData !== 'undefined'){
    try{ await MkData.boot(); await Store.loadCart(); }
    catch(e){ console.error('MAKENOV 백엔드 연결 실패 — 시드 데이터로 표시합니다', e); }
  }
  /* 관리자에서 업로드한 이미지(mkimg: 참조)를 실제 이미지로 바꾼 뒤 렌더한다 */
  if(typeof MkImg !== 'undefined'){ try{ await MkImg.hydrate(); }catch(e){} }
  renderChrome();
  if(typeof pageInit === 'function') pageInit();
  applyI18n();
  unlockIfAuthed();
  document.addEventListener('mk:lang', ()=>{ renderChrome(); if(typeof pageInit==='function') pageInit(); applyI18n(); unlockIfAuthed(); });
});
