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

/* 헤더 아이콘 — 전부 인라인 SVG.
   이모지를 쓰면 기기마다 모양이 달라지고 사이트가 가벼워 보인다(사용자 지시로 이모지 금지). */
const MK_ICO = {
  search:  `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`,
  heart:   `<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.5-7-9.5A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 3.5c0 5-7 9.5-7 9.5z"/></svg>`,
  user:    `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.9-3.6 4-5.6 7.5-5.6s6.6 2 7.5 5.6"/></svg>`,
  logout:  `<svg viewBox="0 0 24 24"><path d="M14 4H6a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 6 20h8"/><path d="M17 15l3-3-3-3"/><path d="M20 12H10"/></svg>`,
  factory: `<svg viewBox="0 0 24 24"><path d="M3 20V11l5 3V11l5 3V6l8 5v9z"/><path d="M3 20h18"/></svg>`,
};

/* ---------- header / footer ---------- */
function renderChrome(active){
  const s = Store.session();

  /* 상단 띠배너 (헤더 바깥 · 스티키 아님)
     문구·노출여부·링크는 관리자 설정(MK_SETTINGS)에서 온다.
     설정이 비어 있으면 i18n 기본 문구로 되돌아간다. */
  const hdr = document.getElementById('mk-header');
  const cfg = (typeof MK_SETTINGS !== 'undefined') ? MK_SETTINGS : {};
  const tbMsg = L(cfg.topbar) || t('topbar_msg');
  const tbOn  = cfg.topbarOn !== false && !!tbMsg;

  const old = document.getElementById('mk-topbar');
  if(old && !tbOn) old.remove();                       // 관리자에서 껐다가 언어 전환 시 반영
  if(tbOn && !old && !sessionStorage.getItem('mk_topbar_off')){
    const tb = document.createElement('div');
    tb.id = 'mk-topbar'; tb.className = 'topbar';
    const body = cfg.topbarLink
      ? `<a href="${esc(cfg.topbarLink)}">${esc(tbMsg)}</a>`
      : `<span>${esc(tbMsg)}</span>`;
    tb.innerHTML = `<div class="wrap">${body}<button class="x" onclick="sessionStorage.setItem('mk_topbar_off','1');this.closest('.topbar').remove()">✕</button></div>`;
    hdr.parentNode.insertBefore(tb, hdr);
  }else if(tbOn && old){
    const slot = old.querySelector('.wrap > a, .wrap > span');
    if(slot) slot.textContent = tbMsg;                 // 언어 전환 시 문구만 교체
  }

  /* 헤더 = 상단행(로고 · 알약 검색 · 유틸 아이콘) + 메뉴행. addwel.co.kr 구조를 따랐다. */
  const doSearch = `if(this.value===undefined){var el=document.getElementById('mk-search-input')}else{var el=this}
      if(el.value.trim()){mkTrack('Search',{search_string:el.value.trim()});location.href='directory.html?q='+encodeURIComponent(el.value.trim())}`;

  hdr.innerHTML = `
  <div class="wrap"><div class="mk-head-top"><a class="mk-logo" href="index.html"><img src="${mkAsset('assets/img/logo.png')}" alt="MAKENOV"
        onerror="this.parentNode.classList.add(&quot;txt&quot;);this.remove()"><span>MAKE<b>NOV</b></span></a><div class="mk-search"><input id="mk-search-input" type="search" data-i18n-ph="search_ph"
        onkeydown="if(event.key==='Enter'){${doSearch}}"><span class="ico" role="button" tabindex="0" onclick="${doSearch}">${MK_ICO.search}</span></div><div class="mk-head-right"><div class="mk-lang"><button data-lang="vi" onclick="setLang('vi')">VI</button><button data-lang="ko" onclick="setLang('ko')">KO</button><button data-lang="en" onclick="setLang('en')">EN</button></div><a class="mk-util opt" href="maker.html">${MK_ICO.factory}<span class="lb" data-i18n="util_maker"></span></a><a class="mk-util" href="mypage.html">${MK_ICO.heart}<span class="badge" id="cart-badge">0</span><span class="lb" data-i18n="util_wish"></span></a>
      ${s
        ? `<a class="mk-util" href="mypage.html">${MK_ICO.user}<span class="lb">${esc(s.contactName||s.email.split('@')[0])}</span></a><a class="mk-util" onclick="Store.logout();location.reload()" style="cursor:pointer">${MK_ICO.logout}<span class="lb" data-i18n="logout"></span></a>`
        : `<a class="mk-util" onclick="openAuth('login')" style="cursor:pointer">${MK_ICO.user}<span class="lb" data-i18n="login"></span></a><button class="btn btn-primary btn-sm" style="margin-left:6px;height:40px;padding:0 18px" onclick="openAuth('signup')" data-i18n="signup"></button>`}
    </div></div><nav class="mk-nav mk-head-nav"><a href="directory.html" data-i18n="nav_directory"></a><a href="companies.html" data-i18n="nav_companies"></a><a href="columns.html" data-i18n="nav_columns"></a><a href="webinar.html" data-i18n="nav_webinar"></a><span class="gnb"><a href="about.html" data-i18n="nav_about"></a><a href="guide.html" data-i18n="nav_guide"></a><a href="support.html" data-i18n="nav_support"></a></span></nav></div>`;
  document.getElementById('mk-footer').innerHTML = `
  <div class="wrap"><div><div class="logo"><img src="${mkAsset('assets/img/logo.png')}" alt="MAKENOV"
      onerror="this.parentNode.classList.add(&quot;txt&quot;);this.remove()"><span>MAKE<b>NOV</b></span></div><p class="desc" data-i18n="ft_desc"></p><div class="social"><a href="#" title="Facebook">f</a><a href="#" title="TikTok">t</a><a href="#" title="YouTube">▶</a><a href="#" title="Instagram">◎</a><a href="#" title="Zalo">Z</a></div></div><div><h4 data-i18n="ft_platform"></h4><a href="directory.html" data-i18n="nav_directory"></a><a href="columns.html" data-i18n="nav_columns"></a><a href="webinar.html" data-i18n="nav_webinar"></a></div><div><h4 data-i18n="ft_support"></h4><a href="support.html" data-i18n="nav_support"></a><a href="guide.html" data-i18n="nav_guide"></a><a href="mailto:contact@makenov.com" data-i18n="ft_contact"></a></div><div><h4 data-i18n="ft_company"></h4><a href="about.html" data-i18n="nav_about"></a><a href="maker.html" data-i18n="ft_kr"></a></div></div><div class="base">© 2026 MAKENOV. All rights reserved. · Innovative Korean products for global buyers.</div>`;
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
    if(added) mkTrack('AddToWishlist', mkProductParams(mkProduct(pid)));
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

/* ---------- auth modal — 단일 화면 가입 ----------
   이전에는 3단계로 나눠 받았는데, 단계마다 이탈이 생겼다.
   지금은 한 화면에 전부 보여주고, 사업자 인증만 그 자리에서 인라인으로 처리한다.
   인증에 실패하거나 번호가 없는 바이어도 '간편 문의'로 빠져나가지 않게 한다. */
let _verified = null;          // 인증 통과 결과
let _suCountry = 'VN';         // 선택된 국가

function openAuth(mode){
  if(mode==='login'){
    mkModal(`
      <h2 data-i18n="auth_login_title"></h2>
      <p class="sub" data-i18n="auth_signup_sub"></p>
      <div class="f-row"><label data-i18n="auth_email"></label>
        <input id="li-email" type="email" autocomplete="email"
               onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div class="f-row"><label data-i18n="auth_password"></label>
        <input id="li-pw" type="password" autocomplete="current-password"
               onkeydown="if(event.key==='Enter')doLogin()"></div>
      <div class="mst-result err" id="li-err" style="display:none"></div>
      <button class="btn btn-primary btn-block" onclick="doLogin()" data-i18n="login"></button>
      <p class="switch-auth"><span data-i18n="auth_none"></span> <a onclick="openAuth('signup')" data-i18n="signup"></a></p>`);
    return;
  }
  _verified = null;
  _suCountry = MK_LANG === 'ko' ? 'KR' : (MK_LANG === 'en' ? 'US' : 'VN');

  mkModal(`
    <h2 data-i18n="auth_signup_title"></h2>
    <p class="sub" data-i18n="auth_signup_sub"></p>

    <div class="fs">
      <div class="fs-t" data-i18n="auth_grp_company"></div>
      <div class="f-row"><label data-i18n="auth_country"></label>
        <select id="su-country" onchange="suCountryChange(this.value)">
          ${MK_COUNTRIES.map(c=>`<option value="${c.code}">${c.flag} ${esc(L(c.name))}</option>`).join('')}
        </select></div>
      <div id="su-verify"></div>
      <div class="mst-result" id="v-result" style="display:none"></div>

      <!-- 왜 받는지 설명 : 이게 없으면 세금코드 입력에서 멈춘다 -->
      <div class="why-box">
        <b data-i18n="auth_why_title"></b>
        <ul>
          <li data-i18n="auth_why_1"></li>
          <li data-i18n="auth_why_2"></li>
          <li data-i18n="auth_why_3"></li>
        </ul>
      </div>
    </div>

    <div class="fs">
      <div class="fs-t" data-i18n="auth_grp_contact"></div>
      <div class="f-2col">
        <div class="f-row"><label data-i18n="auth_contact_name"></label><input id="su-name" autocomplete="name"></div>
        <div class="f-row"><label data-i18n="auth_position"></label><input id="su-position"></div>
      </div>
      <div class="f-row"><label data-i18n="auth_phone"></label>
        <div class="mst-row">
          <input id="su-dial" readonly style="max-width:78px;text-align:center">
          <input id="su-phone" inputmode="tel">
        </div></div>
    </div>

    <div class="fs">
      <div class="fs-t" data-i18n="auth_grp_account"></div>
      <div class="f-row"><label data-i18n="auth_email"></label>
        <input id="su-email" type="email" autocomplete="email" placeholder="name@company.com">
        <p class="f-hint" data-i18n="auth_id_hint"></p></div>
      <div class="f-2col">
        <div class="f-row"><label data-i18n="auth_password"></label>
          <input id="su-pw" type="password" autocomplete="new-password" oninput="pwCheck()"></div>
        <div class="f-row"><label data-i18n="auth_password2"></label>
          <input id="su-pw2" type="password" autocomplete="new-password" oninput="pwCheck()"></div>
      </div>
      <p class="pw-msg" id="pw-msg"></p>
    </div>

    <button class="btn btn-primary btn-block" onclick="suDone()" data-i18n="auth_done"></button>

    <!-- 인증이 막혔을 때 빠져나갈 문 -->
    <div class="easy-out">
      <span data-i18n="auth_hard"></span>
      <a onclick="openEasyLead()" data-i18n="auth_easy_cta"></a>
    </div>

    <p class="switch-auth"><span data-i18n="auth_have"></span> <a onclick="openAuth('login')" data-i18n="login"></a></p>`);

  const sel = document.getElementById('su-country');
  if(sel) sel.value = _suCountry;
  suCountryChange(_suCountry);
}

/* 국가를 바꾸면 인증란만 그 자리에서 교체된다 (화면 이동 없음) */
function suCountryChange(code){
  _suCountry = code;
  _verified = null;
  const c = mkCountry(code);
  const box = document.getElementById('v-result');
  if(box) box.style.display = 'none';

  let inner = '';
  if(c.method === 'mst'){
    inner = `
      <div class="f-row"><label data-i18n="auth_mst"></label>
        <div class="mst-row">
          <input id="v-regno" inputmode="numeric" maxlength="14" placeholder="0100109106">
          <button class="btn btn-soft" id="v-btn" onclick="runVerify()" data-i18n="auth_mst_check"></button>
        </div>
        <p class="f-hint" data-i18n="auth_mst_hint"></p></div>`;
  } else if(c.method === 'brn'){
    inner = `
      <div class="f-row"><label data-i18n="auth_company"></label><input id="v-company" placeholder="(주)메이크노브"></div>
      <div class="f-row"><label data-i18n="auth_brn"></label>
        <div class="mst-row">
          <input id="v-regno" inputmode="numeric" maxlength="12" placeholder="123-45-67890"
                 oninput="this.value=formatBRN(this.value)">
          <button class="btn btn-soft" id="v-btn" onclick="runVerify()" data-i18n="auth_mst_check"></button>
        </div>
        <p class="f-hint" data-i18n="auth_brn_hint2"></p></div>`;
  } else {
    inner = `
      <div class="f-row"><label data-i18n="auth_company"></label><input id="v-company"></div>
      <div class="f-row"><label data-i18n="auth_biz_email"></label>
        <div class="mst-row">
          <input id="v-email" type="email" placeholder="name@company.com">
          <button class="btn btn-soft" id="v-btn" onclick="runVerify()" data-i18n="auth_mst_check"></button>
        </div>
        <p class="f-hint" data-i18n="auth_domain_hint"></p></div>`;
  }
  const wrap = document.getElementById('su-verify');
  wrap.innerHTML = inner;
  applyI18n(wrap);

  document.getElementById('su-dial').value = c.dial;
  document.getElementById('su-phone').placeholder = c.phEx;
}

/* 비밀번호 확인 — 오타로 가입해서 못 들어오는 일이 없게 그 자리에서 알려준다 */
function pwCheck(){
  const a = document.getElementById('su-pw').value;
  const b = document.getElementById('su-pw2').value;
  const el = document.getElementById('pw-msg');
  if(!el) return true;
  if(!a && !b){ el.textContent=''; el.className='pw-msg'; return false; }
  if(a.length < 6){ el.textContent = t('auth_pw_short'); el.className='pw-msg bad'; return false; }
  if(!b){ el.textContent=''; el.className='pw-msg'; return false; }
  if(a !== b){ el.textContent = t('auth_pw_diff'); el.className='pw-msg bad'; return false; }
  el.textContent = t('auth_pw_ok'); el.className='pw-msg ok';
  return true;
}

/* 국가별 인증 실행 — 화면 이동 없이 결과만 표시 */
async function runVerify(){
  const box = document.getElementById('v-result');
  const btn = document.getElementById('v-btn');
  const val = id => { const el=document.getElementById(id); return el ? el.value.trim() : ''; };

  /* 재인증 시작 시 직전 결과를 반드시 폐기 — 실패 후 이전 통과분으로 가입되는 것을 차단 */
  _verified = null;

  btn.disabled = true; btn.textContent = t('auth_verifying');
  box.style.display = 'none';

  const res = await verifyBusiness(_suCountry, {
    regNo: val('v-regno'), company: val('v-company'),
    email: val('v-email') || val('su-email'),
  });

  btn.disabled = false; btn.textContent = t('auth_mst_check');
  box.style.display = 'block';

  if(!res.ok){
    const key = 'err_' + res.err;
    const dict = I18N[MK_LANG] || I18N.vi;
    box.className = 'mst-result err';
    box.innerHTML = (dict[key] || I18N.vi[key] || t('auth_mst_fail'))
      + `<div class="retry"><a onclick="openEasyLead()" data-i18n="auth_easy_cta"></a></div>`;
    applyI18n(box);
    return;
  }

  _verified = { ...res, country:_suCountry, regNo: val('v-regno') };
  box.className = 'mst-result';
  box.innerHTML = `✓ <b>${t('auth_mst_ok')}</b><br>${esc(res.company)}`
    + (res.address ? `<br><span style="color:var(--mk-muted)">${esc(res.address)}</span>` : '')
    + (res.status  ? `<br><span style="color:var(--mk-muted);font-size:12px">${esc(res.status)}</span>` : '');

  /* 회사명이 비어 있으면 인증으로 받아온 상호를 채워준다 */
  const cf = document.getElementById('v-company');
  if(cf && !cf.value) cf.value = res.company || '';
}

async function suDone(){
  if(!_verified){ toast(t('auth_need_verify'));
    const b=document.getElementById('v-result'); if(b) b.scrollIntoView({block:'center'});
    return; }
  const c = mkCountry(_suCountry);
  const v = id => { const el=document.getElementById(id); return el ? el.value.trim() : ''; };
  const email = (_verified.accountEmail || v('su-email')).toLowerCase();
  const pw = document.getElementById('su-pw').value;

  if(!v('su-name') || !v('su-phone')){ toast(t('auth_need_basic')); return; }
  if(!/^\S+@\S+\.\S+$/.test(email)){ toast(t('err_invalid_email')); return; }
  if(pw.length < 6){ toast(t('auth_pw_short')); document.getElementById('su-pw').focus(); return; }
  if(pw !== document.getElementById('su-pw2').value){
    toast(t('auth_pw_diff'));
    const el = document.getElementById('su-pw2'); el.focus(); el.select();
    return;
  }

  const res = await Store.signup({
    email, password: pw,
    country: _suCountry, countryName: L(c.name),
    regNo: _verified.regNo, mst: _verified.regNo,        // mst = 하위호환 필드
    company: _verified.company, address: _verified.address, status: _verified.status,
    verifiedBy: _verified.checked,                        // gov | nts | checksum | domain
    contactName: v('su-name'), position: v('su-position'),
    phone: c.dial + ' ' + v('su-phone'),
    zalo: c.dial + ' ' + v('su-phone'),                   // zalo = 하위호환 필드
    /* 서버가 같은 값으로 다시 검증해 인증 상태를 확정한다 (자가 승격 차단) */
    verifyPayload: { method:c.method, country:_suCountry,
                     regNo:_verified.regNo, company:_verified.company,
                     email:(_verified.accountEmail || v('su-email')) },
  });
  if(!res.ok){ toast(res.err==='exists' ? t('err_exists') : t('auth_mst_fail')); return; }

  /* ★ 가입 = 사업자 인증 통과까지 끝난 상태. 광고 최적화의 핵심 전환. */
  mkTrack('CompleteRegistration', {
    status: true,                       // 인증까지 완료됨
    content_name: _verified.checked,    // gov | nts | checksum | domain
    content_category: _suCountry,
  });

  closeModal(); toast(t('auth_welcome'));
  setTimeout(()=>location.reload(), 700);
}

/* ---------- 간편 문의 ----------
   사업자 인증이 안 되거나 번호가 없는 바이어를 그냥 놓치지 않기 위한 경로.
   가입 없이 연락처만 받아 관리자가 직접 인증을 도와준다. */
function openEasyLead(){
  const c = mkCountry(_suCountry);
  mkModal(`
    <h2 data-i18n="easy_title"></h2>
    <p class="sub" data-i18n="easy_sub"></p>
    <div class="lp-err" id="easy-err"></div>
    <div class="f-2col">
      <div class="f-row"><label data-i18n="auth_company"></label><input id="ez-company"></div>
      <div class="f-row"><label data-i18n="auth_contact_name"></label><input id="ez-name"></div>
    </div>
    <div class="f-2col">
      <div class="f-row"><label data-i18n="auth_email"></label><input id="ez-email" type="email"></div>
      <div class="f-row"><label data-i18n="auth_phone"></label><input id="ez-tel" inputmode="tel" placeholder="${esc(c.dial)} ${esc(c.phEx)}"></div>
    </div>
    <div class="f-row"><label data-i18n="easy_need"></label>
      <textarea id="ez-msg" rows="3" data-i18n-ph="easy_need_ph"></textarea></div>
    <button class="btn btn-primary btn-block" onclick="sendEasyLead()" data-i18n="easy_send"></button>
    <div class="easy-out"><span data-i18n="easy_back"></span>
      <a onclick="openAuth('signup')" data-i18n="signup"></a></div>`);
}

async function sendEasyLead(){
  const v = id => document.getElementById(id).value.trim();
  const err = document.getElementById('easy-err');
  const show = m => { err.textContent = m; err.style.display = 'block'; };
  if(!v('ez-company') || !v('ez-name')) return show(t('auth_need_basic'));
  if(!v('ez-email') && !v('ez-tel'))    return show(t('easy_need_contact'));

  await Store.addMakerLead({
    company: v('ez-company'), name: v('ez-name'),
    tel: v('ez-tel') || '-', email: v('ez-email') || '-',
    site: '', cat: 'buyer',                    // cat=buyer → 관리자에서 바이어 문의로 구분
    message: '[바이어 간편문의 · ' + _suCountry + '] ' + v('ez-msg'),
  });
  mkTrack('Lead', { content_category:'easy_lead', country:_suCountry });
  closeModal();
  toast(t('easy_ok'));
}

async function doLogin(){
  const email = document.getElementById('li-email').value.trim();
  const res = await Store.login(email, document.getElementById('li-pw').value);
  if(res && res.ok){ closeModal(); setTimeout(()=>location.reload(), 400); return; }

  const box = document.getElementById('li-err');
  const err = (res && res.err) || 'invalid';

  /* 이메일 미확인이면 재발송 버튼까지 같이 준다 — 이게 로그인 실패의 가장 흔한 원인 */
  if(err === 'unconfirmed'){
    box.innerHTML = `${t('err_unconfirmed')}
      <div class="retry"><a onclick="resendConfirm('${esc(email)}')" data-i18n="auth_resend"></a></div>`;
    applyI18n(box);
  }else if(err === 'provider_off'){
    box.textContent = t('err_provider_off');
  }else{
    box.textContent = err === 'rate' ? t('err_rate') : t('err_login');
  }
  box.style.display = 'block';
  if(res && res.raw) console.warn('로그인 실패 원인:', res.raw);
}

async function resendConfirm(email){
  if(!Store.resendConfirm){ toast(t('err_login')); return; }
  const r = await Store.resendConfirm(email);
  toast(r.ok ? t('auth_resend_ok') : (r.err || t('err_login')));
}

/* ---------- inquiry modal ---------- */
function openInquiry(pids){    // pids: array of product ids
  requireAuth(()=>{
    const items = pids.map(id=>mkProduct(id)).filter(Boolean);
    /* 문의 모달을 연 시점 = 퍼널 중간. 발송(Lead)보다 볼륨이 많아
       초기 광고 최적화 이벤트로 쓸 수 있다. */
    mkTrack('InitiateCheckout', {
      content_ids: items.map(p=>p.id), content_type:'product',
      contents: items.map(p=>({ id:p.id, quantity:1 })), num_items: items.length,
    });
    mkModal(`
      <h2 data-i18n="inq_title"></h2><p class="sub">${items.map(p=>esc(L(p.name))).join(' · ')}</p><div class="f-row"><label data-i18n="inq_message"></label><textarea id="inq-msg" rows="4" data-i18n-ph="inq_message_ph"></textarea></div><button class="btn btn-primary btn-block" onclick="sendInquiry('${pids.join(',')}')" data-i18n="inq_send"></button>`);
  });
}
async function sendInquiry(pidCsv){
  const btn = document.querySelector('#mk-modal-back .btn-primary');
  const msg = document.getElementById('inq-msg').value.trim();
  const pids = pidCsv.split(',');

  if(btn){ btn.disabled = true; btn.textContent = t('inq_sending'); }

  /* ★ 예전에는 결과를 확인하지 않고 무조건 '접수 완료'를 띄웠다.
     저장이 실패해도 성공으로 보여서 문의가 조용히 사라졌다. */
  const results = await Promise.all(pids.map(pid => Store.addInquiry(pid, msg)));
  const failed  = results.filter(r => !r || !r.ok);

  if(btn){ btn.disabled = false; btn.textContent = t('inq_send'); }

  if(failed.length){
    const err = failed[0].err || '';
    /* RLS가 막은 경우 = 아직 인증 상태가 아님 */
    const msgKey = /row-level security|permission/i.test(err) ? 'inq_err_verify'
                 : err === 'auth' ? 'auth_need' : 'inq_err';
    toast(t(msgKey));
    console.error('문의 저장 실패:', err);
    return;
  }

  /* ★ 주 전환 — 저장 성공을 확인한 뒤에만 쏜다 */
  const items = pids.map(id=>mkProduct(id)).filter(Boolean);
  mkTrack('Lead', {
    content_ids: items.map(p=>p.id), content_type:'product',
    contents: items.map(p=>({ id:p.id, quantity:1 })),
    num_items: items.length, content_category:'inquiry',
  });

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
/* 카드 지표 — 문의수는 0이어도 항상 표시한다(사용자 지시).
   관심(wish)은 0이면 생략. */
function cardMeta(p){
  const inq  = Number(p.inquiries) || 0;
  const wish = Number(p.wish) || 0;
  let html = `<span class="rate">${inq}<span data-i18n="inquiries_count"></span></span>`;
  if(wish) html += `<span class="amt">${t('wish_count').replace('{n}', wish)}</span>`;
  return html;
}

function productCard(p){
  const inCart = Store.cartHas(p.id);
  const flag = p.isNew ? `<span class="flag" data-i18n="spot_new"></span>` : (p.featured?`<span class="flag">FEATURED</span>`:'');
  return `
  <a class="p-card" href="product.html?id=${p.id}"><div class="thumb"><img src="${p.img}" alt="" loading="lazy">${flag}
      <button class="heart ${inCart?'on':''}" onclick="event.preventDefault();event.stopPropagation();toggleCart('${p.id}',this)">${inCart?'♥':'♡'}</button></div><div class="body"><span class="brand">${esc(p.brand)}</span><h3>${esc(L(p.name))}</h3><div class="meta">${cardMeta(p)}<span class="left">${esc(p.origin)}</span></div></div></a>`;
}

/* ---------- boot ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  document.documentElement.lang = MK_LANG;

  /* 1) 헤더·푸터·번역을 먼저 그린다.
        Supabase 응답을 기다렸다가 그리면, 그동안 정적 HTML(제목만)이 홀로 떠 있다가
        데이터가 도착하는 순간 전체가 다시 그려져 화면이 깜빡인다. */
  renderChrome();
  applyI18n();

  /* 2) 그다음 데이터 */
  if(typeof MkData !== 'undefined'){
    try{
      await MkData.boot();
      /* 이메일 확인 후 첫 진입이면 보관해 둔 인증 결과를 프로필에 반영한다 */
      if(Store._flushPendingProfile) await Store._flushPendingProfile();
      await Store.loadCart();
    }
    catch(e){ console.error('MAKENOV 백엔드 연결 실패 — 시드 데이터로 표시합니다', e); }
  }
  if(typeof MkImg !== 'undefined'){ try{ await MkImg.hydrate(); }catch(e){} }

  /* 3) 세션이 잡혔으면 헤더를 한 번 더 (로그인 상태 반영) */
  if(typeof MkData !== 'undefined' && MkData.session) renderChrome();
  if(typeof pageInit === 'function') pageInit();
  applyI18n();
  unlockIfAuthed();
  document.addEventListener('mk:lang', ()=>{ renderChrome(); if(typeof pageInit==='function') pageInit(); applyI18n(); unlockIfAuthed(); });
});
