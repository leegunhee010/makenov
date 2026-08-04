/* 칼럼 상세 페이지 렌더 — column.html(동적)과 columns/*.html(정적 굽기) 공용.
   구운 페이지는 window.MK_CID 로 칼럼을 지정하고, 동적 페이지는 ?id= 를 읽는다. */
function pageInit(){
  const id = window.MK_CID || new URLSearchParams(location.search).get('id');
  if(!MK_COLUMNS.length) return;       // 데이터가 없으면 정적 내용을 그대로 둔다
  const idx = Math.max(0, MK_COLUMNS.findIndex(x=>x.id===id));
  const c = MK_COLUMNS[idx];
  const prev = MK_COLUMNS[idx-1], next = MK_COLUMNS[idx+1];
  document.title = L(c.title) + ' | MAKENOV';

  document.getElementById('col-root').innerHTML = `
    <nav class="blog-breadcrumb"><a href="index.html" data-i18n="col_home"></a> -
      <a href="columns.html" data-i18n="nav_columns"></a> -
      <span>${esc(L(c.title))}</span></nav><span class="blog-single-cat">${esc(L(c.cat))}</span><h1>${esc(L(c.title))}</h1><div class="blog-single-meta"><span>${esc(c.date)}</span><i></i><span>${readTime(L(c.body))}</span></div><div class="blog-cover"><img src="${c.img}" alt=""></div><div class="blog-body">${L(c.body)}</div><div class="blog-nav">
      ${prev ? `<a href="column.html?id=${prev.id}"><div class="dir" data-i18n="col_prev"></div><b>${esc(L(prev.title))}</b></a>` : '<span></span>'}
      ${next ? `<a class="next" href="column.html?id=${next.id}"><div class="dir" data-i18n="col_next"></div><b>${esc(L(next.title))}</b></a>` : '<span></span>'}
    </div><div class="blog-cta"><h3 data-i18n="promo_title"></h3><p data-i18n="promo_desc"></p><button class="btn btn-primary btn-lg" onclick="openAuth('signup')" data-i18n="promo_btn"></button></div>`;

  /* 다른 칼럼 */
  const others = MK_COLUMNS.filter(x=>x.id!==c.id).slice(0,2);
  const old = document.getElementById('col-others');
  if(old) old.remove();
  if(others.length){
    const el = document.createElement('section');
    el.className = 'blog-main';
    el.id = 'col-others';
    el.style.marginTop = '56px';
    el.innerHTML = `<div class="sec-head"><h2 data-i18n="col_related"></h2><a class="more" href="columns.html" data-i18n="view_more"></a></div><div class="blog-list">${others.map(o=>`
        <div class="blog-item"><a class="blog-item-link" href="column.html?id=${o.id}"><div class="blog-item-thumb"><img src="${o.img}" alt="" loading="lazy"></div><div class="blog-item-info"><div class="blog-item-cat">${esc(L(o.cat))}</div><h3 class="blog-item-tit">${esc(L(o.title))}</h3><div class="blog-item-meta"><span>${esc(o.date)}</span><i></i><span>${readTime(L(o.body))}</span></div></div></a></div>`).join('')}</div>`;
    document.querySelector('main').appendChild(el);
    applyI18n(el);
  }
}

/* 스크롤 진행바 */
window.addEventListener('scroll', ()=>{
  const el = document.getElementById('progress-bar');
  if(!el) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  el.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}, {passive:true});
