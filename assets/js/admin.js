/* ============================================================
   MAKENOV 관리자 로직
   ============================================================ */
function esc(s){ return String(s??'').replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function av(id){ const el=document.getElementById(id); return el ? el.value.trim() : ''; }
function ac(id){ const el=document.getElementById(id); return el ? el.checked : false; }
function tri(base){ return { vi:av(base+'-vi'), ko:av(base+'-ko'), en:av(base+'-en') }; }
function today(){ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function toastA(msg){
  let el=document.querySelector('.toast');
  if(!el){ el=document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
  el.textContent=msg; el.classList.add('show');
  clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2400);
}

/* ============================================================
   이미지 업로드 위젯
   값은 hidden input에 담긴다. 업로드하면 'mkimg:<id>', URL을 붙여넣으면 그 URL.
   uploader(id, value, opts) → HTML
   ============================================================ */
function uploader(id, value, opts){
  opts = opts || {};
  const v = value || '';
  const src = MkImg.isRef(v) ? MkImg.resolve(v) : v;
  return `
  <div class="upl" id="${id}-box" ondragover="uplDrag(event,1)" ondragleave="uplDrag(event,0)" ondrop="uplDrop(event,'${id}')">
    <input type="hidden" id="${id}" value="${esc(v)}">
    <div class="upl-prev" id="${id}-prev">${src?`<img src="${esc(src)}" alt="">`:`<span class="ph">이미지 없음</span>`}</div>
    <div class="upl-side">
      <div class="upl-acts">
        <button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('${id}-file').click()">파일 선택</button>
        <button type="button" class="btn btn-ghost btn-sm" onclick="uplClear('${id}')">비우기</button>
      </div>
      <input type="file" id="${id}-file" accept="image/*" hidden onchange="uplPick(this,'${id}')">
      <p class="upl-hint" id="${id}-info">${opts.hint||'파일을 끌어다 놓아도 됩니다. 자동으로 1600px·JPEG로 압축됩니다.'}</p>
      <details class="upl-url"><summary>URL로 넣기</summary>
        <input class="srch" style="width:100%;margin-top:8px" placeholder="https://..."
          value="${MkImg.isRef(v)?'':esc(v)}" onchange="uplSetUrl('${id}',this.value)"></details>
    </div>
  </div>`;
}
function uplDrag(e, on){ e.preventDefault(); e.currentTarget.classList.toggle('over', !!on); }
function uplDrop(e, id){
  e.preventDefault(); e.currentTarget.classList.remove('over');
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if(f) uplStore(f, id);
}
function uplPick(input, id){ if(input.files[0]) uplStore(input.files[0], id); input.value=''; }
async function uplStore(file, id){
  const info = document.getElementById(id+'-info');
  if(info) info.textContent = '압축하는 중…';
  try{
    const r = await MkImg.save(file);
    document.getElementById(id).value = r.ref;
    document.getElementById(id+'-prev').innerHTML = `<img src="${r.dataUrl}" alt="">`;
    if(info) info.textContent = `${r.w}×${r.h} · ${fmtBytes(r.bytes)} 로 저장됨`;
    if(typeof uplOnChange === 'function') uplOnChange(id);
  }catch(err){
    if(info) info.textContent = err.message || '업로드에 실패했습니다';
    toastA(err.message || '업로드 실패');
  }
}
function uplClear(id){
  document.getElementById(id).value = '';
  document.getElementById(id+'-prev').innerHTML = `<span class="ph">이미지 없음</span>`;
  const info = document.getElementById(id+'-info');
  if(info) info.textContent = '파일을 끌어다 놓아도 됩니다.';
  if(typeof uplOnChange === 'function') uplOnChange(id);
}
function uplSetUrl(id, url){
  const u = String(url||'').trim();
  document.getElementById(id).value = u;
  document.getElementById(id+'-prev').innerHTML = u ? `<img src="${esc(u)}" alt="">` : `<span class="ph">이미지 없음</span>`;
  if(typeof uplOnChange === 'function') uplOnChange(id);
}

/* ---------- 갤러리 (여러 장) ---------- */
let pGallery = [];
function renderGallery(){
  const el = document.getElementById('gal-list');
  if(!el) return;
  el.innerHTML = pGallery.length ? pGallery.map((g,i)=>`
    <div class="gal-item">
      <img src="${esc(MkImg.isRef(g)?MkImg.resolve(g):g)}" alt="">
      <div class="gal-acts">
        <button type="button" onclick="galMove(${i},-1)" ${i===0?'disabled':''}>←</button>
        <button type="button" onclick="galMove(${i},1)" ${i===pGallery.length-1?'disabled':''}>→</button>
        <button type="button" onclick="galDel(${i})">삭제</button>
      </div>
      ${i===0?`<span class="gal-first">대표</span>`:''}
    </div>`).join('') : `<p class="note" style="margin:0">아직 없습니다. 아래에서 여러 장을 한 번에 선택할 수 있습니다.</p>`;
}
function galDel(i){ pGallery.splice(i,1); renderGallery(); }
function galMove(i,d){
  const j=i+d; if(j<0||j>=pGallery.length) return;
  [pGallery[i],pGallery[j]]=[pGallery[j],pGallery[i]]; renderGallery();
}
async function galAdd(input){
  const files = [...input.files]; input.value='';
  const info = document.getElementById('gal-info');
  for(let n=0;n<files.length;n++){
    if(info) info.textContent = `압축하는 중… (${n+1}/${files.length})`;
    try{ const r = await MkImg.save(files[n]); pGallery.push(r.ref); }
    catch(e){ toastA(e.message||'업로드 실패'); }
  }
  if(info) info.textContent = `${pGallery.length}장 등록됨`;
  renderGallery();
}

/* ============================================================
   운영 데이터 캐시
   local 모드는 동기, Supabase 모드는 비동기라서 렌더 전에 한 번 받아 여기 담는다.
   렌더 함수들은 ADM.* 만 읽으므로 두 모드에서 코드가 같다.
   ============================================================ */
const ADM = { inqs:[], buyers:[], leads:[] };
const isSB = () => typeof MkData !== 'undefined';

/* 쓰기 작업 완료를 기다린 뒤 화면을 갱신한다.
   Supabase 모드에서 곧바로 reload 하면 요청이 취소돼 변경이 유실된다. */
async function admDo(promise, reload){
  try{
    await promise;
    if(reload === 0){ await refreshAdm(); renderAll(); }
    else location.reload();
  }catch(e){
    console.error(e);
    toastA('저장에 실패했습니다: ' + (e.message||e));
  }
}

async function refreshAdm(){
  const [i,b,l] = await Promise.all([
    Store.allInquiries(), Store.allBuyers(), Store.allMakerLeads(),
  ]);
  ADM.inqs = i || []; ADM.buyers = b || []; ADM.leads = l || [];
  if(isSB()){
    Admin.primeInq(ADM.inqs); Admin.primeLeads(ADM.leads); Admin.primeTiers(ADM.buyers);
  }
  ADM.inqs.sort((a,b2)=>String(b2.createdAt).localeCompare(String(a.createdAt)));
}

/* ---------- 로그인 ---------- */
async function doAdminLogin(){
  const err = document.getElementById('gate-err');
  const pw  = document.getElementById('gate-pw').value;

  if(isSB()){
    /* Supabase 모드: 일반 로그인 후 admins 테이블에 있는지로 판별 */
    const email = av('gate-email');
    if(!email){ err.textContent='관리자 이메일을 입력하세요'; err.style.display='block'; return; }
    const r = await Store.login(email, pw);
    if(!r.ok){ err.textContent='이메일 또는 비밀번호가 올바르지 않습니다'; err.style.display='block'; return; }
    if(!MkData.admin){
      await Store.logout();
      err.textContent='이 계정은 관리자로 등록돼 있지 않습니다 (admins 테이블 확인)';
      err.style.display='block'; return;
    }
    boot(); return;
  }

  if(Admin.login(pw)){ boot(); }
  else { err.textContent='비밀번호가 올바르지 않습니다'; err.style.display='block'; }
}
async function boot(){
  document.getElementById('gate').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  /* 관리자는 데이터의 mkimg: 참조를 그대로 두고(내보내기 때문에) 캐시만 채운 뒤 표시할 때 해석한다 */
  try{ await MkImg.loadCache(); }catch(e){}
  try{ await refreshAdm(); }catch(e){ console.error('운영 데이터 로드 실패', e); }
  renderAll();
}
/* 화면 표시용 이미지 주소 */
function imgSrc(v){ return MkImg.isRef(v) ? (MkImg.resolve(v) || '') : (v || ''); }

/* ---------- 사이드바 · 탭 ---------- */
const TABS = ['dash','inq','leads','buyers','products','columns','settings'];
const NAV = [
  { id:'dash',     label:'대시보드', title:'대시보드',      desc:'플랫폼 현황 한눈에 보기' },
  { id:'inq',      label:'문의함',   title:'문의함',        desc:'바이어가 보낸 견적 문의' },
  { id:'leads',    label:'입점문의', title:'입점 문의',      desc:'제품 등록 랜딩(maker.html)으로 들어온 제조사' },
  { id:'buyers',   label:'바이어',   title:'바이어 관리',    desc:'사업자 인증을 통과한 회원' },
  { id:'products', label:'제품',     title:'제품 관리',      desc:'등록·수정 시 사이트에 즉시 반영' },
  { id:'columns',  label:'칼럼',     title:'칼럼 관리',      desc:'인사이트 글 작성 및 발행' },
  { id:'settings', label:'설정',     title:'설정 · 내보내기', desc:'배포용 데이터와 계정 관리' },
];
let curTab = 'dash';

function renderNav(){
  const inqs = ADM.inqs;
  const newCnt = inqs.filter(i=>Admin.inqMeta(i.id).status==='new').length;
  const newLeads = ADM.leads.filter(l=>Admin.leadMeta(l.id).status==='new').length;
  const counts = { inq:newCnt||'', leads:newLeads||'', buyers:ADM.buyers.length||'',
                   products:MK_PRODUCTS.length, columns:MK_COLUMNS.length, dash:'', settings:'' };
  document.getElementById('sb-nav').innerHTML =
    `<div class="grp">운영</div>` +
    NAV.slice(0,4).map(n=>navBtn(n,counts)).join('') +
    `<div class="grp">콘텐츠</div>` +
    NAV.slice(4,6).map(n=>navBtn(n,counts)).join('') +
    `<div class="grp">시스템</div>` +
    NAV.slice(6).map(n=>navBtn(n,counts)).join('');
}
function navBtn(n, counts){
  const c = counts[n.id];
  return `<button class="${curTab===n.id?'on':''}" onclick="showTab('${n.id}')"><span>${n.label}</span>
    ${c!=='' && c!==undefined ? `<span class="cnt">${c}</span>` : ''}</button>`;
}

function showTab(name){
  curTab = name;
  TABS.forEach(x=>document.getElementById('tab-'+x).classList.toggle('hidden', x!==name));
  const n = NAV.find(x=>x.id===name) || NAV[0];
  document.getElementById('pg-title').textContent = n.title;
  document.getElementById('pg-desc').textContent = n.desc;
  renderNav();
  toggleSb(false);
  window.scrollTo(0,0);
}
function toggleSb(open){
  document.getElementById('sb').classList.toggle('open', !!open);
  document.getElementById('sb-backdrop').classList.toggle('open', !!open);
}

function renderAll(){
  renderNav(); renderDash();
  renderInq(); renderLeads(); renderBuyers(); renderProducts(); renderColumns(); renderSettings();
  showTab(curTab);
}

/* ============================================================
   1-B. 입점 문의 (maker.html 랜딩 접수분)
   ============================================================ */
const LEAD_ST = { new:'신규', contacted:'연락함', onboarding:'등록 진행', done:'입점 완료', drop:'보류' };

function renderLeads(){
  const leads = ADM.leads;
  const cnt = k => leads.filter(l=>Admin.leadMeta(l.id).status===k).length;

  document.getElementById('tab-leads').innerHTML = `
    <div class="card"><p class="note">제품 등록 랜딩 <code>maker.html</code>으로 들어온 제조사 문의입니다.
      상태와 메모는 관리자에만 저장됩니다.</p><div class="kpi" style="margin-bottom:18px"><div class="kpi-card"><div class="lbl">전체</div><div class="num">${leads.length}</div><div class="sub">누적 접수</div></div><div class="kpi-card"><div class="lbl">신규</div><div class="num">${cnt('new')}</div><div class="sub">연락 대기</div></div><div class="kpi-card"><div class="lbl">진행 중</div><div class="num">${cnt('contacted')+cnt('onboarding')}</div><div class="sub">연락함 · 등록 진행</div></div><div class="kpi-card"><div class="lbl">입점 완료</div><div class="num">${cnt('done')}</div><div class="sub">제품 등록됨</div></div></div><div class="bar"><span class="grow"></span><button class="btn btn-ghost btn-sm" onclick="exportLeadsCsv()">CSV 내려받기</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:150px">접수일</th><th>회사 · 담당자</th><th>연락처</th><th>카테고리</th><th>제품 소개</th><th style="width:130px">상태</th><th style="width:80px"></th></tr></thead><tbody>${leads.length ? leads.map(l=>{
      const m = Admin.leadMeta(l.id);
      return `<tr class="row-hover"><td>${esc(String(l.createdAt).slice(0,10))}<div class="sub">${esc(String(l.createdAt).slice(11,16))}</div></td><td><b>${esc(l.company)}</b><div class="sub">${esc(l.name)}</div>${l.site?`<div class="sub"><a href="${esc(l.site)}" target="_blank" rel="noopener">${esc(l.site)}</a></div>`:''}</td><td>${esc(l.tel)}<div class="sub">${esc(l.email)}</div></td><td>${esc(catLabel(l.cat))}</td><td style="max-width:320px"><div style="white-space:pre-wrap;line-height:1.6">${esc(l.message)}</div><input class="srch" style="margin-top:8px;width:100%" placeholder="메모" value="${esc(m.memo)}"
                 onchange="Admin.setLeadMeta('${l.id}',{memo:this.value});toastA('메모 저장됨')"></td><td><select onchange="admDo(Admin.setLeadMeta('${l.id}',{status:this.value}),0)">${Object.entries(LEAD_ST).map(([k,v])=>`<option value="${k}" ${m.status===k?'selected':''}>${v}</option>`).join('')}</select></td><td><button class="btn btn-ghost btn-sm" onclick="if(confirm('${esc(l.company)}\\n삭제할까요?')){admDo(Admin.deleteLead('${l.id}'),0);}">삭제</button></td></tr>`;
    }).join('') : `<tr class="empty-row"><td colspan="7">아직 입점 문의가 없습니다</td></tr>`}
      </tbody></table></div></div>`;
}
function catLabel(id){
  if(id==='etc') return '기타';
  const c = mkCat(id);
  return c ? c.name.ko : (id||'-');
}
function exportLeadsCsv(){
  const rows = [['접수일','회사명','담당자','연락처','이메일','홈페이지','카테고리','제품소개','상태','메모']];
  ADM.leads.forEach(l=>{
    const m = Admin.leadMeta(l.id);
    rows.push([l.createdAt, l.company, l.name, l.tel, l.email, l.site||'', catLabel(l.cat),
               String(l.message).replace(/\r?\n/g,' '), LEAD_ST[m.status]||m.status, m.memo||'']);
  });
  downloadFile('makenov-입점문의_'+today()+'.csv',
    '﻿' + rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(',')).join('\n'), 'text/csv');
}

/* ============================================================
   0. 대시보드
   ============================================================ */
function renderDash(){
  const inqs   = ADM.inqs.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const buyers = ADM.buyers.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const newCnt = inqs.filter(i=>Admin.inqMeta(i.id).status==='new').length;
  const vipCnt = buyers.filter(b=>Admin.tier(b.email)==='vip').length;
  const ntsCnt = buyers.filter(b=>['gov','nts'].includes(b.verifiedBy)).length;

  /* 최근 7일 문의 추이 */
  const days = [...Array(7)].map((_,i)=>{
    const d = new Date(); d.setDate(d.getDate()-(6-i));
    const key = d.toISOString().slice(0,10);
    return { label:(d.getMonth()+1)+'/'+d.getDate(),
             n: inqs.filter(x=>String(x.createdAt).slice(0,10)===key).length };
  });
  const peak = Math.max(1, ...days.map(d=>d.n));

  document.getElementById('tab-dash').innerHTML = `
    <div class="kpi"><div class="kpi-card"><div class="lbl">누적 문의</div><div class="num">${inqs.length}</div><div class="sub">미처리 <b>${newCnt}</b>건</div></div><div class="kpi-card"><div class="lbl">인증 바이어</div><div class="num">${buyers.length}</div><div class="sub">VIP <b>${vipCnt}</b> · 정부DB인증 <b>${ntsCnt}</b></div></div><div class="kpi-card"><div class="lbl">등록 제품</div><div class="num">${MK_PRODUCTS.length}</div><div class="sub">추천 <b>${MK_PRODUCTS.filter(p=>p.featured).length}</b>건</div></div><div class="kpi-card"><div class="lbl">칼럼</div><div class="num">${MK_COLUMNS.length}</div><div class="sub">발행됨</div></div></div><div class="card"><div class="card-head"><h3>최근 7일 문의 추이</h3><span class="sp"></span><span class="note" style="margin:0">최대 ${peak}건</span></div><div style="display:flex;align-items:flex-end;gap:10px;height:130px;padding-top:6px">
        ${days.map(d=>`
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%"><div style="flex:1;width:100%;display:flex;align-items:flex-end"><div title="${d.n}건" style="width:100%;height:${Math.round((d.n/peak)*100)}%;min-height:3px;
                background:${d.n?'var(--mk-primary)':'#E9ECEF'};border-radius:5px 5px 0 0"></div></div><span style="font-size:11px;color:var(--adm-sub)">${d.label}</span></div>`).join('')}
      </div></div><div class="card"><div class="card-head"><h3>최근 문의</h3><span class="sp"></span><button class="btn btn-ghost btn-sm" onclick="showTab('inq')">전체 보기</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:96px">일시</th><th>제품</th><th>회사</th><th>담당자</th><th style="width:76px">상태</th></tr></thead><tbody>${inqs.length ? inqs.slice(0,5).map(i=>{
          const p=mkProduct(i.pid), m=Admin.inqMeta(i.id), lb=ST_LABEL[m.status]||ST_LABEL.new;
          return `<tr><td>${new Date(i.createdAt).toLocaleDateString('ko-KR')}</td><td>${p?esc(p.name.ko||p.name.vi):esc(i.pid)}</td><td>${esc(i.company||'-')}</td><td>${esc(i.contactName||'-')}</td><td><span class="pill-st ${lb[1]}">${lb[0]}</span></td></tr>`;
        }).join('') : `<tr class="empty-row"><td colspan="5">아직 접수된 문의가 없습니다</td></tr>`}</tbody></table></div></div><div class="card"><div class="card-head"><h3>최근 가입 바이어</h3><span class="sp"></span><button class="btn btn-ghost btn-sm" onclick="showTab('buyers')">전체 보기</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:96px">가입일</th><th>국가</th><th>회사</th><th>인증</th><th style="width:76px">등급</th></tr></thead><tbody>${buyers.length ? buyers.slice(0,5).map(b=>{
          const c=b.country?mkCountry(b.country):null, tier=Admin.tier(b.email);
          return `<tr><td>${b.createdAt?new Date(b.createdAt).toLocaleDateString('ko-KR'):'-'}</td><td>${c?c.flag:''} ${esc(b.countryName||'')}</td><td>${esc(b.company)}</td><td>${esc(VERIFY_LABEL[b.verifiedBy]||'-')}</td><td>${tier==='vip'?'<span class="pill-st st-vip">VIP</span>':'<span class="pill-st st-done">인증</span>'}</td></tr>`;
        }).join('') : `<tr class="empty-row"><td colspan="5">아직 가입한 바이어가 없습니다</td></tr>`}</tbody></table></div></div><div class="card"><div class="card-head"><h3>바로가기</h3></div><div class="bar" style="margin:0"><button class="btn btn-primary btn-sm" onclick="showTab('products');pEditing='';pBlocks=[];renderProducts()">+ 제품 등록</button><button class="btn btn-ghost btn-sm" onclick="showTab('columns');cEditing='';renderColumns()">+ 칼럼 작성</button><button class="btn btn-ghost btn-sm" onclick="showTab('settings')">data.js 내보내기</button></div></div>`;
}

/* ============================================================
   1. 문의함
   ============================================================ */
const ST_LABEL = { new:['신규','st-new'], doing:['처리중','st-doing'], done:['완료','st-done'] };
let inqFilter = 'all';

function renderInq(){
  const all = ADM.inqs.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const list = all.filter(i=> inqFilter==='all' || Admin.inqMeta(i.id).status===inqFilter );
  const cnt = s => all.filter(i=>Admin.inqMeta(i.id).status===s).length;

  document.getElementById('tab-inq').innerHTML = `
    <div class="card"><p class="note">바이어가 보낸 견적 문의입니다. 상태를 바꾸고 메모를 남길 수 있습니다.
    <br>2단계 Supabase 연동 시 전체 문의가 서버에 실시간 수집되고 텔레그램 알림이 갑니다.</p><div class="bar"><button class="btn btn-sm ${inqFilter==='all'?'btn-primary':'btn-ghost'}"onclick="inqFilter='all';renderInq()">전체 ${all.length}</button><button class="btn btn-sm ${inqFilter==='new'?'btn-primary':'btn-ghost'}"onclick="inqFilter='new';renderInq()">신규 ${cnt('new')}</button><button class="btn btn-sm ${inqFilter==='doing'?'btn-primary':'btn-ghost'}" onclick="inqFilter='doing';renderInq()">처리중 ${cnt('doing')}</button><button class="btn btn-sm ${inqFilter==='done'?'btn-primary':'btn-ghost'}"onclick="inqFilter='done';renderInq()">완료 ${cnt('done')}</button><span class="grow"></span><button class="btn btn-ghost btn-sm" onclick="exportInquiries()">CSV 내보내기</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:96px">일시</th><th>제품</th><th>회사</th><th>담당자 / 연락처</th><th>내용 · 메모</th><th style="width:150px">상태</th></tr></thead><tbody>${list.length ? list.map(i=>{
        const p = mkProduct(i.pid), m = Admin.inqMeta(i.id), lb = ST_LABEL[m.status]||ST_LABEL.new;
        return `<tr class="row-hover"><td>${new Date(i.createdAt).toLocaleDateString('ko-KR')}<div class="sub">${new Date(i.createdAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'})}</div></td><td>${p?esc(p.name.ko||p.name.vi):esc(i.pid)}<div class="sub">${p?esc(p.brand):''}</div></td><td>${esc(i.company||'-')}<div class="sub">${esc(i.mst||'')}</div></td><td>${esc(i.contactName||'-')}<div class="sub">${esc(i.zalo||'')}<br>${esc(i.buyerEmail||'')}</div></td><td>${esc(i.message||'-')}
            <div style="margin-top:6px"><input class="srch" style="width:100%;min-width:0;font-size:12px;padding:5px 8px"
              placeholder="메모" value="${esc(m.memo)}"
              onchange="Admin.setInqMeta('${i.id}',{memo:this.value});toastA('메모 저장됨')"></div></td><td><span class="pill-st ${lb[1]}">${lb[0]}</span><div style="margin-top:6px"><select class="srch" style="width:100%;min-width:0;font-size:12px;padding:5px 8px"
                onchange="admDo(Admin.setInqMeta('${i.id}',{status:this.value}),0)"><option value="new"${m.status==='new'?'selected':''}>신규</option><option value="doing" ${m.status==='doing'?'selected':''}>처리중</option><option value="done"${m.status==='done'?'selected':''}>완료</option></select></div><button class="btn btn-ghost btn-sm" style="margin-top:5px;width:100%"
              onclick="if(confirm('이 문의를 삭제할까요?')){admDo(Admin.deleteInquiry('${i.id}'),0);}">삭제</button></td></tr>`;
      }).join('') : `<tr class="empty-row"><td colspan="6">해당하는 문의가 없습니다</td></tr>`}
      </tbody></table></div></div>`;
}

function exportInquiries(){
  const rows = [['일시','제품','회사','등록번호','담당자','연락처','이메일','내용','상태','메모']];
  ADM.inqs.forEach(i=>{
    const p = mkProduct(i.pid), m = Admin.inqMeta(i.id);
    rows.push([new Date(i.createdAt).toLocaleString('ko-KR'), p?(p.name.ko||p.name.vi):i.pid,
      i.company||'', i.mst||'', i.contactName||'', i.zalo||'', i.buyerEmail||'',
      (i.message||'').replace(/\n/g,' '), (ST_LABEL[m.status]||ST_LABEL.new)[0], m.memo||'']);
  });
  downloadFile('makenov-문의_'+today()+'.csv',
    '﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n'), 'text/csv');
}

/* ============================================================
   2. 바이어
   ============================================================ */
const VERIFY_LABEL = { gov:'국세청', nts:'국세청', checksum:'체크섬', domain:'도메인' };

function renderBuyers(){
  const buyers = ADM.buyers.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  const inqs = ADM.inqs;
  document.getElementById('tab-buyers').innerHTML = `
    <div class="card"><p class="note">사업자 인증을 통과한 바이어 명단입니다.
    <b>인증</b> = 검증 방식: <code>국세청</code> 정부 DB 실시간 조회 · <code>체크섬</code> 번호 유효성만 · <code>도메인</code> 회사 이메일.
    <br>체크섬으로만 통과한 건은 나중에 재확인이 필요할 수 있습니다. 메신저로 컨택 후 <b>VIP</b>로 승격하면 한국 기업 직통 연락처를 열어줄 수 있습니다.</p><div class="bar"><span class="grow"></span><button class="btn btn-ghost btn-sm" onclick="exportBuyers()">CSV 내보내기</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:88px">가입일</th><th>국가</th><th>회사</th><th>등록번호</th><th>인증</th><th>담당자</th><th>연락처</th><th>문의</th><th style="width:118px">등급</th></tr></thead><tbody>${buyers.length ? buyers.map(b=>{
        const c = b.country ? mkCountry(b.country) : null;
        const tier = Admin.tier(b.email);
        const n = inqs.filter(i=>i.buyerEmail===b.email).length;
        return `<tr class="row-hover"><td>${b.createdAt?new Date(b.createdAt).toLocaleDateString('ko-KR'):'-'}</td><td>${c?c.flag:''} ${esc(b.countryName||b.country||'')}</td><td>${esc(b.company)}<div class="sub">${esc(b.address||'')}</div></td><td>${esc(b.regNo||b.mst||'-')}</td><td>${esc(VERIFY_LABEL[b.verifiedBy]||'-')}<div class="sub">${esc(b.status||'')}</div></td><td>${esc(b.contactName||'')}<div class="sub">${esc(b.position||'')}</div></td><td>${esc(b.phone||b.zalo||'')}<div class="sub">${esc(b.messenger||'')} ${esc(b.messengerId||'')}<br>${esc(b.email)}</div></td><td><b>${n}</b></td><td>${tier==='vip'?'<span class="pill-st st-vip">VIP</span>':'<span class="pill-st st-done">인증</span>'}
            <div style="margin-top:6px"><select class="srch" style="width:100%;min-width:0;font-size:12px;padding:5px 8px"
                onchange="admDo(Admin.setTier('${esc(b.email)}',this.value),0);toastA('등급 변경됨')"><option value="verified" ${tier!=='vip'?'selected':''}>인증 바이어</option><option value="vip"${tier==='vip'?'selected':''}>VIP</option></select></div></td></tr>`;
      }).join('') : `<tr class="empty-row"><td colspan="9">아직 가입한 바이어가 없습니다</td></tr>`}
      </tbody></table></div></div>`;
}

function exportBuyers(){
  const rows = [['가입일','국가','회사','주소','등록번호','인증방식','상태','담당자','직함','전화','메신저','메신저ID','이메일','등급']];
  ADM.buyers.forEach(b=>{
    rows.push([b.createdAt?new Date(b.createdAt).toLocaleDateString('ko-KR'):'', b.countryName||b.country||'',
      b.company||'', b.address||'', b.regNo||b.mst||'', VERIFY_LABEL[b.verifiedBy]||'', b.status||'',
      b.contactName||'', b.position||'', b.phone||b.zalo||'', b.messenger||'', b.messengerId||'',
      b.email||'', Admin.tier(b.email)==='vip'?'VIP':'인증']);
  });
  downloadFile('makenov-바이어_'+today()+'.csv',
    '﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n'), 'text/csv');
}

/* ============================================================
   3. 제품 CRUD
   ============================================================ */
let pEditing = null;      // 편집 중인 제품 id (null = 목록)
let pBlocks  = [];        // 상세 블록 임시 저장
let pSearch  = '';

function renderProducts(){
  const el = document.getElementById('tab-products');
  if(pEditing !== null){ el.innerHTML = productForm(pEditing); return; }

  const q = pSearch.toLowerCase();
  const list = MK_PRODUCTS.filter(p=> !q ||
    Object.values(p.name).join(' ').toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));

  el.innerHTML = `
    <div class="card"><p class="note">제품을 등록·수정·삭제하면 사이트에 즉시 반영됩니다. 저장 위치는 이 브라우저이며,
    배포 전에 <b>설정 · 내보내기</b> 탭에서 <code>data.js</code>로 구워야 다른 기기에도 반영됩니다.</p><div class="bar"><input class="srch" placeholder="제품명 · 브랜드 검색" value="${esc(pSearch)}" oninput="pSearch=this.value;renderProducts()"><span class="grow"></span><button class="btn btn-primary btn-sm" onclick="pEditing='';pBlocks=[];pGallery=[];renderProducts()">+ 새 제품 등록</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:60px">이미지</th><th>제품명</th><th>브랜드</th><th>카테고리</th><th>가격(잠금)</th><th>문의</th><th>조회</th><th>표시</th><th style="width:120px"></th></tr></thead><tbody>${list.length ? list.map(p=>`
        <tr class="row-hover"><td><img class="thumb-sm" src="${esc(imgSrc(p.img))}" alt=""></td><td><b>${esc(p.name.ko||p.name.vi)}</b><div class="sub">${esc(p.id)} · ${esc(p.createdAt)}</div></td><td>${esc(p.brand)}<div class="sub">${esc(p.origin)}</div></td><td>${esc(mkCat(p.cat)?mkCat(p.cat).name.ko:p.cat)}</td><td>${esc(p.price)}</td><td><b>${p.inquiries}</b></td><td>${p.views}</td><td>${p.featured?'<span class="pill-st st-vip">추천</span> ':''}${p.isNew?'<span class="pill-st st-new">신규</span>':''}</td><td><button class="btn btn-ghost btn-sm" onclick="editProduct('${p.id}')">수정</button><button class="btn btn-ghost btn-sm" onclick="if(confirm('${esc(p.name.ko||p.name.vi)}\\n삭제할까요?')){admDo(Admin.deleteProduct('${p.id}'));}">삭제</button></td></tr>`).join('') : `<tr class="empty-row"><td colspan="9">제품이 없습니다</td></tr>`}
      </tbody></table></div></div>`;
}

function editProduct(id){
  const p = mkProduct(id);
  pBlocks  = p ? JSON.parse(JSON.stringify(p.detail||[])) : [];
  pGallery = p ? [...(p.gallery||[])] : [];
  pEditing = id; renderProducts();
}

function productForm(id){
  const p = id ? mkProduct(id) : null;
  const g = (o,k)=> (o && o[k]) ? o[k] : '';
  const nm = p?p.name:{}, tg = p?p.tagline:{}, bs = p?p.brandStory:{};
  return `
    <div class="card"><div class="bar"><h3 style="margin:0">${p?'제품 수정':'새 제품 등록'}</h3><span class="grow"></span><button class="btn btn-ghost btn-sm" onclick="pEditing=null;renderProducts()">취소</button><button class="btn btn-primary btn-sm" onclick="saveProduct('${id}')">저장</button></div><div class="fgrid two"><div class="fld"><label>브랜드 / 제조사</label><input id="f-brand" value="${esc(p?p.brand:'')}" placeholder="DAON COSMETIC"></div><div class="fld"><label>소재지</label><input id="f-origin" value="${esc(p?p.origin:'')}" placeholder="Daegu, Korea"></div></div><div class="fld"><label>카테고리</label><select id="f-cat">${MK_CATEGORIES.map(c=>`<option value="${c.id}" ${p&&p.cat===c.id?'selected':''}>${esc(c.name.ko)}</option>`).join('')}</select></div><div class="sect"><h4>제품명 (3개 국어)</h4><div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span>한국어</label><input id="f-name-ko" value="${esc(g(nm,'ko'))}"></div><div class="fld"><label><span class="lang-tag">VI</span>베트남어</label><input id="f-name-vi" value="${esc(g(nm,'vi'))}"></div><div class="fld"><label><span class="lang-tag">EN</span>영어</label><input id="f-name-en" value="${esc(g(nm,'en'))}"></div></div></div><div class="sect"><h4>한 줄 소개 (3개 국어)</h4><div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span>한국어</label><textarea id="f-tag-ko">${esc(g(tg,'ko'))}</textarea></div><div class="fld"><label><span class="lang-tag">VI</span>베트남어</label><textarea id="f-tag-vi">${esc(g(tg,'vi'))}</textarea></div><div class="fld"><label><span class="lang-tag">EN</span>영어</label><textarea id="f-tag-en">${esc(g(tg,'en'))}</textarea></div></div></div><div class="sect"><h4>대표 이미지</h4>${uploader('f-img', p?p.img:'', {hint:'목록·카드에 쓰이는 사진입니다. 끌어다 놓거나 파일을 선택하세요.'})}</div><div class="sect"><h4>갤러리 <span style="color:var(--adm-sub);font-size:11px"> 상세페이지 상단 슬라이드</span></h4><div class="gal-grid" id="gal-list"></div><div class="bar" style="margin:12px 0 0"><button type="button" class="btn btn-primary btn-sm" onclick="document.getElementById('gal-file').click()">사진 추가 (여러 장 선택 가능)</button><input type="file" id="gal-file" accept="image/*" multiple hidden onchange="galAdd(this)"><span class="hint" id="gal-info" style="margin:0">비워두면 대표 이미지만 사용됩니다.</span></div></div><div class="sect"><h4>대표 영상 <span style="color:var(--mk-muted);font-size:11px"> 선택 · 없으면 비워두세요</span></h4><div class="fld"><label>영상 URL</label><input id="f-video" value="${esc(p&&p.video?p.video:'')}" placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."><p class="hint">유튜브·Vimeo 주소를 그대로 붙여넣으면 됩니다. 비워두면 상세페이지에 영상 영역이 아예 표시되지 않습니다.</p></div></div><div class="sect"><h4>거래 조건 <span style="color:var(--mk-lock);font-size:11px"> 인증 바이어만 열람</span></h4><div class="fgrid two"><div class="fld"><label>가격 / 공급가</label><input id="f-price" value="${esc(p?p.price:'')}" placeholder="US$ 4.20 / unit (FOB Busan)"></div><div class="fld"><label>최소주문수량 MOQ</label><input id="f-moq" value="${esc(p?p.moq:'')}" placeholder="3,000 units"></div><div class="fld"><label>납기</label><input id="f-lead" value="${esc(p?p.lead:'')}" placeholder="30 days"></div><div class="fld"><label>공급 조건</label><input id="f-terms" value="${esc(p?p.terms:'')}" placeholder="OEM/ODM available"></div></div></div><div class="sect"><h4>브랜드 소개 (3개 국어)</h4><div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span>한국어</label><textarea id="f-story-ko">${esc(g(bs,'ko'))}</textarea></div><div class="fld"><label><span class="lang-tag">VI</span>베트남어</label><textarea id="f-story-vi">${esc(g(bs,'vi'))}</textarea></div><div class="fld"><label><span class="lang-tag">EN</span>영어</label><textarea id="f-story-en">${esc(g(bs,'en'))}</textarea></div></div></div><div class="sect"><h4>상세 페이지 구성</h4><div id="blk-list"></div><div class="bar" style="margin:12px 0 0"><button class="btn btn-primary btn-sm" onclick="document.getElementById('detail-file').click()">상세페이지 통이미지 올리기</button><input type="file" id="detail-file" accept="image/*" hidden onchange="detailUpload(this)"><button class="btn btn-ghost btn-sm" onclick="addBlock('p')">+ 문단</button><button class="btn btn-ghost btn-sm" onclick="addBlock('img')">+ 이미지</button><button class="btn btn-ghost btn-sm" onclick="addBlock('video')">+ 영상</button></div><p class="hint" id="detail-info" style="margin:8px 0 0">세로로 긴 상세페이지 이미지를 그대로 올리세요. 가로 해상도는 유지하고 세로만 자동으로 나눠 담습니다.</p></div><div class="sect"><h4>노출 설정</h4><div class="fgrid"><div class="fld"><label>문의 수</label><input id="f-inq" type="number" value="${p?p.inquiries:0}"></div><div class="fld"><label>조회 수</label><input id="f-views" type="number" value="${p?p.views:0}"></div><div class="fld"><label>등록일</label><input id="f-date" value="${esc(p?p.createdAt:today())}"></div></div><div style="display:flex;gap:22px;margin-top:4px"><label class="chk"><input type="checkbox" id="f-featured" ${p&&p.featured?'checked':''}> 추천 제품 (홈 상단 노출)</label><label class="chk"><input type="checkbox" id="f-new" ${p&&p.isNew?'checked':''}> 신규 배지 표시</label></div></div><div class="bar" style="margin-top:22px"><span class="grow"></span><button class="btn btn-ghost" onclick="pEditing=null;renderProducts()">취소</button><button class="btn btn-primary" onclick="saveProduct('${id}')">저장</button></div></div>`;
}

/* 상세 블록 편집기 */
function renderBlocks(){
  const el = document.getElementById('blk-list');
  if(!el) return;
  el.innerHTML = pBlocks.length ? pBlocks.map((b,i)=>{
    const head = `<div class="blk-head"><b>${b.type==='p'?'문단':b.type==='img'?(b.seq?'상세페이지 조각':'이미지'):'영상'}</b><div class="acts"><button onclick="moveBlock(${i},-1)" ${i===0?'disabled':''}>↑</button><button onclick="moveBlock(${i},1)" ${i===pBlocks.length-1?'disabled':''}>↓</button><button onclick="delBlock(${i})">삭제</button></div></div>`;
    if(b.type==='p'){
      const tx = b.text||{};
      return `<div class="blk">${head}<div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span></label><textarea oninput="pBlocks[${i}].text.ko=this.value">${esc(tx.ko||'')}</textarea></div><div class="fld"><label><span class="lang-tag">VI</span></label><textarea oninput="pBlocks[${i}].text.vi=this.value">${esc(tx.vi||'')}</textarea></div><div class="fld"><label><span class="lang-tag">EN</span></label><textarea oninput="pBlocks[${i}].text.en=this.value">${esc(tx.en||'')}</textarea></div></div></div>`;
    }
    if(b.type==='img'){
      return `<div class="blk">${head}${uploader('blk-'+i, b.src||'', {hint:'상세페이지 본문에 들어갈 이미지입니다.'})}</div>`;
    }
    return `<div class="blk">${head}
      <div class="fld"><label>영상 URL (유튜브 · Vimeo)</label><input value="${esc(b.src||'')}" oninput="pBlocks[${i}].src=this.value"
        placeholder="https://www.youtube.com/watch?v=..."></div></div>`;
  }).join('') : `<p class="note" style="margin:0">아직 블록이 없습니다. 아래 버튼으로 문단·이미지·영상을 추가하세요.</p>`;
}
/* 업로드 위젯이 값을 바꾸면 해당 상태에 반영한다 (상세 블록의 이미지) */
function uplOnChange(id){
  const m = String(id).match(/^blk-(\d+)$/);
  if(m && pBlocks[+m[1]]) pBlocks[+m[1]].src = document.getElementById(id).value;
}

/* ---------- 상세페이지 통이미지 업로드 ----------
   한국식 상세페이지(가로 850 · 세로 17000 같은 것)를 그대로 올리면
   가로는 유지한 채 세로만 잘라 여러 이미지 블록으로 넣는다.
   화면에서는 이어 붙어 보이므로 사용자에겐 한 장이다. */
async function detailUpload(input){
  const file = input.files[0]; input.value = '';
  if(!file) return;
  const info = document.getElementById('detail-info');
  const say  = m => { if(info) info.textContent = m; };

  say('이미지를 읽는 중…');
  try{
    const r = await MkImg.saveDetail(file, (i,n)=>say(`분할 처리 중… ${i}/${n}`));
    /* seq = 분할된 조각. 상세페이지에서 틈 없이 이어 붙인다.
       w/h 를 같이 저장해 지연 로딩 중 화면이 밀리지 않게 한다. */
    r.refs.forEach((ref,i) => pBlocks.push(
      r.sliced ? { type:'img', src:ref, seq:true, w:r.sizes[i].w, h:r.sizes[i].h }
               : { type:'img', src:ref }));
    renderBlocks();
    say(r.sliced
      ? `원본 ${r.originW}×${r.originH} → 가로 ${r.w}px 유지, ${r.count}조각으로 나눠 넣었습니다 (${fmtBytes(r.bytes)})`
      : `${r.w}×${r.totalH} 로 1장 추가했습니다 (${fmtBytes(r.bytes)})`);
    toastA(`상세페이지 ${r.count}장 추가됨`);
  }catch(e){
    say(e.message || '처리에 실패했습니다');
    toastA(e.message || '업로드 실패');
  }
}
function addBlock(type){
  pBlocks.push(type==='p' ? {type:'p', text:{vi:'',ko:'',en:''}} : {type, src:''});
  renderBlocks();
}
function delBlock(i){ pBlocks.splice(i,1); renderBlocks(); }
function moveBlock(i,d){
  const j=i+d; if(j<0||j>=pBlocks.length) return;
  [pBlocks[i],pBlocks[j]]=[pBlocks[j],pBlocks[i]]; renderBlocks();
}

function saveProduct(id){
  const name = tri('f-name');
  if(!name.ko && !name.vi && !name.en){ toastA('제품명을 입력하세요'); return; }
  if(!av('f-img') && !pGallery.length){ toastA('대표 이미지를 올려주세요'); return; }
  const gallery = pGallery.filter(Boolean);
  const p = {
    id: id || Admin.newProductId(),
    cat: av('f-cat'),
    featured: ac('f-featured'), isNew: ac('f-new'),
    createdAt: av('f-date') || today(),
    brand: av('f-brand'), origin: av('f-origin'),
    name, tagline: tri('f-tag'),
    img: av('f-img') || gallery[0],
    gallery: gallery.length ? gallery : [av('f-img')],
    video: av('f-video'),
    inquiries: Number(av('f-inq'))||0, views: Number(av('f-views'))||0,
    price: av('f-price'), moq: av('f-moq'), lead: av('f-lead'), terms: av('f-terms'),
    brandStory: tri('f-story'),
    detail: pBlocks.filter(b=> b.type==='p' ? (b.text.ko||b.text.vi||b.text.en) : b.src ),
  };
  toastA(id ? '제품을 저장하는 중…' : '제품을 등록하는 중…');
  admDo(Admin.upsertProduct(p));
}

/* ============================================================
   4. 칼럼 CRUD
   ============================================================ */
let cEditing = null;

function renderColumns(){
  const el = document.getElementById('tab-columns');
  if(cEditing !== null){ el.innerHTML = columnForm(cEditing); return; }
  el.innerHTML = `
    <div class="card"><p class="note">홈과 칼럼 페이지에 노출되는 글입니다. 본문은 HTML을 그대로 쓸 수 있습니다 (<code>&lt;p&gt;</code>, <code>&lt;b&gt;</code> 등).</p><div class="bar"><span class="grow"></span><button class="btn btn-primary btn-sm" onclick="cEditing='';renderColumns()">+ 새 칼럼 작성</button></div><div class="tbl-wrap"><table><thead><tr><th style="width:76px">이미지</th><th>제목</th><th>분류</th><th>발행일</th><th style="width:120px"></th></tr></thead><tbody>${MK_COLUMNS.length ? MK_COLUMNS.map(c=>`
        <tr class="row-hover"><td><img class="thumb-sm" src="${esc(imgSrc(c.img))}" alt=""></td><td><b>${esc(c.title.ko||c.title.vi)}</b><div class="sub">${esc(c.id)}</div></td><td>${esc(c.cat.ko||c.cat.vi)}</td><td>${esc(c.date)}</td><td><button class="btn btn-ghost btn-sm" onclick="cEditing='${c.id}';renderColumns()">수정</button><button class="btn btn-ghost btn-sm" onclick="if(confirm('삭제할까요?')){admDo(Admin.deleteColumn('${c.id}'));}">삭제</button></td></tr>`).join('') : `<tr class="empty-row"><td colspan="5">칼럼이 없습니다</td></tr>`}
      </tbody></table></div></div>`;
}

function columnForm(id){
  const c = id ? mkColumn(id) : null;
  const g = (o,k)=> (o && o[k]) ? o[k] : '';
  const ti=c?c.title:{}, ca=c?c.cat:{}, ex=c?c.excerpt:{}, bo=c?c.body:{};
  return `
    <div class="card"><div class="bar"><h3 style="margin:0">${c?'칼럼 수정':'새 칼럼 작성'}</h3><span class="grow"></span><button class="btn btn-ghost btn-sm" onclick="cEditing=null;renderColumns()">취소</button><button class="btn btn-primary btn-sm" onclick="saveColumn('${id}')">저장</button></div><div class="sect" style="border-top:0;margin-top:0;padding-top:0"><h4>대표 이미지</h4>${uploader('c-img', c?c.img:'', {hint:'칼럼 카드와 상세 상단에 쓰입니다. 16:9 비율을 권장합니다.'})}</div><div class="fld"><label>발행일</label><input id="c-date" value="${esc(c?c.date:today())}"></div><div class="sect"><h4>분류</h4><div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span></label><input id="c-cat-ko" value="${esc(g(ca,'ko'))}" placeholder="트렌드"></div><div class="fld"><label><span class="lang-tag">VI</span></label><input id="c-cat-vi" value="${esc(g(ca,'vi'))}" placeholder="Xu hướng"></div><div class="fld"><label><span class="lang-tag">EN</span></label><input id="c-cat-en" value="${esc(g(ca,'en'))}" placeholder="Trends"></div></div></div><div class="sect"><h4>제목</h4><div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span></label><textarea id="c-title-ko">${esc(g(ti,'ko'))}</textarea></div><div class="fld"><label><span class="lang-tag">VI</span></label><textarea id="c-title-vi">${esc(g(ti,'vi'))}</textarea></div><div class="fld"><label><span class="lang-tag">EN</span></label><textarea id="c-title-en">${esc(g(ti,'en'))}</textarea></div></div></div><div class="sect"><h4>요약 (목록 카드에 표시)</h4><div class="fgrid"><div class="fld"><label><span class="lang-tag">KO</span></label><textarea id="c-ex-ko">${esc(g(ex,'ko'))}</textarea></div><div class="fld"><label><span class="lang-tag">VI</span></label><textarea id="c-ex-vi">${esc(g(ex,'vi'))}</textarea></div><div class="fld"><label><span class="lang-tag">EN</span></label><textarea id="c-ex-en">${esc(g(ex,'en'))}</textarea></div></div></div><div class="sect"><h4>본문 (HTML)</h4><div class="fld"><label><span class="lang-tag">KO</span>한국어</label><textarea id="c-body-ko" style="min-height:150px">${esc(g(bo,'ko'))}</textarea></div><div class="fld"><label><span class="lang-tag">VI</span>베트남어</label><textarea id="c-body-vi" style="min-height:150px">${esc(g(bo,'vi'))}</textarea></div><div class="fld"><label><span class="lang-tag">EN</span>영어</label><textarea id="c-body-en" style="min-height:150px">${esc(g(bo,'en'))}</textarea></div><p class="hint">문단은 <code>&lt;p&gt;내용&lt;/p&gt;</code> 형태로 감싸주세요.</p></div><div class="bar" style="margin-top:22px"><span class="grow"></span><button class="btn btn-ghost" onclick="cEditing=null;renderColumns()">취소</button><button class="btn btn-primary" onclick="saveColumn('${id}')">저장</button></div></div>`;
}

function saveColumn(id){
  const title = tri('c-title');
  if(!title.ko && !title.vi && !title.en){ toastA('제목을 입력하세요'); return; }
  toastA(id ? '칼럼을 저장하는 중…' : '칼럼을 발행하는 중…');
  admDo(Admin.upsertColumn({
    id: id || Admin.newColumnId(),
    cat: tri('c-cat'), date: av('c-date')||today(), img: av('c-img'),
    title, excerpt: tri('c-ex'), body: tri('c-body'),
  }));
}

/* ============================================================
   5. 설정 · 내보내기
   ============================================================ */
function renderSettings(){
  document.getElementById('tab-settings').innerHTML = `
    <div class="card"><h3>배포용 데이터 내보내기</h3><p class="note">지금 편집한 제품·칼럼은 <b>이 브라우저에만</b> 저장돼 있습니다.
      아래에서 <code>data.js</code>를 내려받아 <code>makenov/assets/js/data.js</code>를 교체하면
      다른 기기와 배포 사이트에도 반영됩니다.</p><div class="bar"><button class="btn btn-primary btn-sm" onclick="exportDataJs()">data.js 내려받기</button><button class="btn btn-ghost btn-sm" onclick="exportJson()">전체 백업 (JSON)</button><label class="btn btn-ghost btn-sm" style="cursor:pointer;margin:0">
          백업 복원<input type="file" accept=".json" style="display:none" onchange="importJson(this)"></label></div></div><div class="card"><h3>비밀번호 변경</h3><div class="fgrid two"><div class="fld"><label>새 비밀번호</label><input id="set-pw" type="password"></div><div class="fld"><label>새 비밀번호 확인</label><input id="set-pw2" type="password"></div></div><button class="btn btn-primary btn-sm" onclick="changePw()">변경</button><p class="note" style="margin:12px 0 0"> 이 관리자는 브라우저에서 동작하는 임시 게이트입니다.
      실제 서비스에서는 2단계 Supabase 인증으로 교체해야 합니다.</p></div><div class="card"><h3>편집 내용 초기화</h3><p class="note">관리자에서 편집한 제품·칼럼을 모두 버리고 최초 시드 데이터로 되돌립니다. 문의·바이어 데이터는 유지됩니다.</p><button class="btn btn-ghost btn-sm"
        onclick="if(confirm('편집한 제품·칼럼을 모두 버리고 초기 상태로 되돌립니다.\\n계속할까요?')){Admin.resetContent();location.reload();}">초기 데이터로 되돌리기</button></div><div class="card"><h3>업로드 이미지 저장공간</h3><p class="note">올린 사진은 <b>이 브라우저 안에</b> 저장됩니다(IndexedDB).
      업로드 시 자동으로 긴 변 1600px · JPEG 품질 82%로 압축합니다.
      다른 기기나 실제 서버에 반영하려면 위의 <b>JSON 백업</b>을 받아 옮기세요.
      2단계에서 Supabase Storage로 이전할 예정입니다.</p><div id="img-usage"><p class="note" style="margin:0">불러오는 중…</p></div><div class="bar" style="margin:14px 0 0"><button class="btn btn-ghost btn-sm" onclick="runGc()">사용하지 않는 이미지 정리</button><button class="btn btn-ghost btn-sm" onclick="renderStorage()">새로고침</button></div></div>`;
  renderStorage();
}

/* 업로드 이미지 저장공간 현황 — 설정 탭 하단에 비동기로 채운다 */
async function renderStorage(){
  const el = document.getElementById('img-usage');
  if(!el) return;
  const u = await MkImg.usage();
  /* IndexedDB 할당량은 보통 수 GB지만 브라우저·기기마다 다르다. 실제 값을 그대로 보여준다. */
  const pct = u.quota ? Math.min(100, (u.used / u.quota) * 100) : 0;
  el.innerHTML = `
    <div class="bar-gauge"><i class="${pct>80?'warn':''}" style="width:${Math.max(pct,1.2)}%"></i></div>
    <p class="note" style="margin:0">업로드 이미지 <b>${u.count}장</b> · ${fmtBytes(u.used)}
      ${u.quota?` / 이 브라우저 여유 ${fmtBytes(u.quota)} (${pct.toFixed(1)}%)`:''}</p>`;
}
async function runGc(){
  const n = await MkImg.gc();
  toastA(n ? `사용하지 않는 이미지 ${n}장을 정리했습니다` : '정리할 이미지가 없습니다');
  renderStorage();
}

function changePw(){
  const a=av('set-pw'), b=av('set-pw2');
  if(a.length<4){ toastA('4자 이상 입력하세요'); return; }
  if(a!==b){ toastA('두 비밀번호가 다릅니다'); return; }
  Admin.changePassword(a); toastA('비밀번호가 변경되었습니다');
  document.getElementById('set-pw').value=''; document.getElementById('set-pw2').value='';
}

function downloadFile(name, content, mime){
  const blob = new Blob([content], {type:(mime||'text/plain')+';charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 400);
}

/* data.js 전체를 다시 구워서 내려받기 */
function exportDataJs(){
  const J = o => JSON.stringify(o, null, 2);
  const src = `/* MAKENOV seed data — 관리자에서 내보냄 ${new Date().toLocaleString('ko-KR')} */

const MK_CATEGORIES = ${J(MK_CATEGORIES)};

const MK_COUNTRIES = ${J(MK_COUNTRIES)};
function mkCountry(code){ return MK_COUNTRIES.find(c=>c.code===code) || MK_COUNTRIES[0]; }

const MK_FREE_MAIL = new Set(${J(Array.from(MK_FREE_MAIL))});

const MK_PRODUCTS = ${J(inlineImages(MK_PRODUCTS))};

const MK_COLUMNS = ${J(inlineImages(MK_COLUMNS))};

const MK_SPOTLIGHT = ${J(MK_SPOTLIGHT)};

/* ---------- 관리자 오버라이드 ---------- */
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
})();

const MK_STATS = { products: MK_PRODUCTS.length, inquiries: MK_PRODUCTS.reduce((s,p)=>s+p.inquiries,0), buyers: 87 };

function mkProduct(id){ return MK_PRODUCTS.find(p=>p.id===id); }
function mkCat(id){ return MK_CATEGORIES.find(c=>c.id===id); }
function mkColumn(id){ return MK_COLUMNS.find(c=>c.id===id); }
`;
  downloadFile('data.js', src, 'application/javascript');
  toastA('data.js를 내려받았습니다');
}

function exportJson(){
  downloadFile('makenov-backup_'+today()+'.json', JSON.stringify({
    exportedAt: new Date().toISOString(),
    products: MK_PRODUCTS, columns: MK_COLUMNS, spotlight: MK_SPOTLIGHT,
    inquiries: ADM.inqs, buyers: ADM.buyers,
    inqMeta: JSON.parse(localStorage.getItem('mk_inq_meta')||'{}'),
    tiers: JSON.parse(localStorage.getItem('mk_buyer_tier')||'{}'),
  }, null, 2), 'application/json');
}

function importJson(input){
  const f = input.files && input.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = () => {
    try{
      const d = JSON.parse(r.result);
      if(Array.isArray(d.products))  Admin.saveProducts(d.products);
      if(Array.isArray(d.columns))   Admin.saveColumns(d.columns);
      if(Array.isArray(d.spotlight)) Admin.saveSpotlight(d.spotlight);
      if(d.inqMeta) localStorage.setItem('mk_inq_meta', JSON.stringify(d.inqMeta));
      if(d.tiers)   localStorage.setItem('mk_buyer_tier', JSON.stringify(d.tiers));
      toastA('복원되었습니다'); setTimeout(()=>location.reload(), 700);
    }catch(e){ toastA('파일을 읽을 수 없습니다'); }
  };
  r.readAsText(f);
}

/* ---------- 부팅 ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  if(isSB()){
    /* 관리자 화면도 콘텐츠·세션을 Supabase에서 받아온다 */
    try{ await MkData.boot(); }catch(e){ console.error('백엔드 연결 실패', e); }
    /* 게이트에 이메일 칸 추가 (Supabase는 계정 로그인) */
    const pw = document.getElementById('gate-pw');
    if(pw && !document.getElementById('gate-email')){
      const wrap = document.createElement('div');
      wrap.className = 'fld';
      wrap.innerHTML = `<label>관리자 이메일</label><input id="gate-email" type="email" autocomplete="username" placeholder="admin@makenov.com">`;
      pw.closest('.fld').parentNode.insertBefore(wrap, pw.closest('.fld'));
    }
    if(MkData.admin){ boot(); return; }
  }
  if(Admin.isIn()) boot();
});
/* 제품 편집 폼이 그려진 뒤 갤러리·블록 편집기 채우기 */
const _origRenderProducts = renderProducts;
renderProducts = function(){ _origRenderProducts(); if(pEditing !== null){ renderGallery(); renderBlocks(); } };
