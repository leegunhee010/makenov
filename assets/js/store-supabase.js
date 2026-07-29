/* ============================================================
   MAKENOV — Supabase 백엔드
   config.js 에 URL/키가 채워져 있을 때만 동작하며, store.js(localStorage)의
   Store / Admin / MkImg 를 같은 인터페이스로 덮어씁니다.

   설계 원칙: 렌더 코드는 동기(MK_PRODUCTS 전역 배열)로 짜여 있으므로
   부팅 시 콘텐츠를 한 번에 받아 전역 배열을 채운 뒤 렌더한다.
   쓰기(문의·관심제품·관리자 CRUD)만 async 로 바뀐다.
   ============================================================ */
if (typeof MK_BACKEND !== 'undefined' && MK_BACKEND === 'supabase') {

const SB = supabase.createClient(MK_SUPABASE_URL, MK_SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
});
window.SB = SB;

/* ---------- 부팅: 세션 + 콘텐츠 로드 ---------- */
const MkData = {
  session: null,
  profile: null,
  admin: false,
  termsLoaded: false,   // 인증 바이어일 때만 true

  async boot(){
    const { data:{ session } } = await SB.auth.getSession();
    this.session = session;

    if(session){
      const [{ data:prof }, { data:adm }] = await Promise.all([
        SB.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        SB.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle(),
      ]);
      this.profile = prof || null;
      this.admin   = !!adm;
    }
    await this.loadContent();
  },

  /* 공개 콘텐츠를 전역 배열에 그대로 채운다 (기존 렌더 코드가 그대로 동작하도록) */
  async loadContent(){
    const [co, pr, cl, he] = await Promise.all([
      SB.from('companies').select('*').order('sort'),
      SB.from('products').select('*').eq('published', true).order('created_at', {ascending:false}),
      SB.from('columns_post').select('*').eq('published', true).order('date', {ascending:false}),
      SB.from('hero_slides').select('*').eq('active', true).order('sort'),
    ]);
    if(co.error || pr.error) { console.error('MAKENOV 콘텐츠 로드 실패', co.error || pr.error); return; }

    /* ★ 거래 조건은 별도 테이블. RLS 때문에 인증 바이어가 아니면 0건이 돌아온다.
       즉 미인증 사용자에게는 가격이 애초에 전송되지 않는다. */
    const tm = await SB.from('product_terms').select('*');
    const terms = {};
    (tm.data || []).forEach(t => terms[t.product_id] = t);
    this.termsLoaded = (tm.data || []).length > 0;

    const LOCKED = '인증 후 열람';

    MK_COMPANIES.length = 0;
    (co.data||[]).forEach(c => MK_COMPANIES.push({
      id:c.id, brand:c.brand, cat:c.cat, name:c.name, tagline:c.tagline, intro:c.intro,
      location:c.location, since:c.since, staff:c.staff, export:c.export, brn:c.brn,
      ceo:c.ceo, tel:c.tel, site:c.site, certs:c.certs||[], moqPolicy:c.moq_policy,
      logo:c.logo, cover:c.cover,
    }));

    MK_PRODUCTS.length = 0;
    (pr.data||[]).forEach(p => {
      const t = terms[p.id] || {};
      MK_PRODUCTS.push({
        id:p.id, companyId:p.company_id, cat:p.cat, brand:p.brand, origin:p.origin,
        name:p.name, tagline:p.tagline, brandStory:p.brand_story,
        img:p.img, gallery:p.gallery||[], video:p.video||'', detail:p.detail||[],
        inquiries:p.inquiries||0, views:p.views||0,
        featured:!!p.featured, isNew:!!p.is_new, createdAt:String(p.created_at||'').slice(0,10),
        price:t.price ?? LOCKED, moq:t.moq ?? LOCKED, lead:t.lead ?? LOCKED, terms:t.terms ?? LOCKED,
      });
    });

    MK_COLUMNS.length = 0;
    (cl.data||[]).forEach(c => MK_COLUMNS.push({
      id:c.id, cat:c.cat, title:c.title, excerpt:c.excerpt, body:c.body,
      img:c.img, date:String(c.date||'').slice(0,10),
    }));

    if(he.data && he.data.length){
      MK_HERO.length = 0;
      he.data.forEach(h => MK_HERO.push({
        art:h.art, link:h.link, kicker:h.kicker, title:h.title, sub:h.sub,
      }));
    }
  },
};
window.MkData = MkData;

/* ---------- Store 치환 ---------- */
const _cartMem = { list:null };

Object.assign(Store, {
  session(){
    if(!MkData.session) return null;
    const p = MkData.profile || {};
    return {
      email: MkData.session.user.email,
      company: p.company, address: p.address, mst: p.reg_no,
      country: p.country, status: p.status, verifiedBy: p.verified_by,
      contactName: p.contact_name, position: p.position, zalo: p.messenger,
      tier: p.tier, isAdmin: MkData.admin,
    };
  },

  async signup(user){
    const { data, error } = await SB.auth.signUp({
      email: user.email, password: user.password,
    });
    if(error) return { ok:false, err: error.message };
    if(!data.user) return { ok:false, err:'signup_failed' };

    /* 이메일 확인이 켜져 있으면 세션이 없다. 그 경우 로그인 후 프로필이 채워진다. */
    const patch = {
      country:user.country, company:user.company, address:user.address,
      reg_no:user.mst, verified_by:user.verifiedBy, verify_note:user.status,
      status:'verified', contact_name:user.contactName, position:user.position,
      messenger:user.zalo, phone:user.phone,
    };
    if(data.session){
      await SB.from('profiles').update(patch).eq('id', data.user.id);
      await MkData.boot();
      return { ok:true, session:this.session() };
    }
    /* ★ 이메일 확인이 켜져 있으면 여기서 세션이 없다.
       그러면 프로필이 pending 으로 남고, RLS 때문에 문의 등록이 막힌다.
       인증 결과를 보관해 두었다가 첫 로그인 때 반영한다. */
    try{ localStorage.setItem('mk_pending_profile', JSON.stringify(patch)); }catch(e){}
    return { ok:true, needConfirm:true, pending:patch };
  },

  /* 보관해 둔 인증 결과를 프로필에 반영 (아직 pending 인 경우에만) */
  async _flushPendingProfile(){
    if(!MkData.session) return;
    if(MkData.profile && MkData.profile.status === 'verified') return;
    let patch = null;
    try{ patch = JSON.parse(localStorage.getItem('mk_pending_profile') || 'null'); }catch(e){}
    if(!patch) return;
    const { error } = await SB.from('profiles').update(patch).eq('id', MkData.session.user.id);
    if(!error){
      localStorage.removeItem('mk_pending_profile');
      await MkData.boot();
    }
  },

  async login(email, password){
    const { error } = await SB.auth.signInWithPassword({ email, password });
    if(error) return { ok:false, err:'invalid' };
    await MkData.boot();
    await this._flushPendingProfile();
    return { ok:true, session:this.session() };
  },

  async logout(){ await SB.auth.signOut(); MkData.session = null; MkData.profile = null; },

  /* ---- 관심제품 ---- */
  cart(){ return _cartMem.list || []; },
  cartHas(pid){ return this.cart().includes(pid); },
  async loadCart(){
    if(!MkData.session){ _cartMem.list = []; return []; }
    const { data } = await SB.from('wishlist').select('product_id').eq('buyer_id', MkData.session.user.id);
    _cartMem.list = (data||[]).map(r=>r.product_id);
    return _cartMem.list;
  },
  cartToggle(pid){
    if(!MkData.session) return false;
    const uid = MkData.session.user.id;
    const had = this.cartHas(pid);
    _cartMem.list = had ? _cartMem.list.filter(x=>x!==pid) : [..._cartMem.list, pid];
    if(had) SB.from('wishlist').delete().eq('buyer_id',uid).eq('product_id',pid);
    else    SB.from('wishlist').insert({ buyer_id:uid, product_id:pid });
    return !had;
  },
  cartRemove(pid){ if(this.cartHas(pid)) this.cartToggle(pid); },
  async cartClear(){
    if(!MkData.session) return;
    await SB.from('wishlist').delete().eq('buyer_id', MkData.session.user.id);
    _cartMem.list = [];
  },

  /* ---- 문의 ---- */
  async addInquiry(pid, message){
    if(!MkData.session) return { ok:false, err:'auth' };
    const { error } = await SB.from('inquiries').insert({
      product_id:pid, buyer_id:MkData.session.user.id, message,
    });
    if(error) return { ok:false, err:error.message };
    return { ok:true };
  },
  async myInquiries(){
    if(!MkData.session) return [];
    const { data } = await SB.from('inquiries').select('*')
      .eq('buyer_id', MkData.session.user.id).order('created_at',{ascending:false});
    return (data||[]).map(i=>({ id:i.id, pid:i.product_id, message:i.message,
      createdAt:i.created_at, status:i.status }));
  },
  async allInquiries(){
    const { data } = await SB.from('inquiries')
      .select('*, profiles(email,company,reg_no,contact_name,messenger)')
      .order('created_at',{ascending:false});
    return (data||[]).map(i=>({
      id:i.id, pid:i.product_id, message:i.message, createdAt:i.created_at,
      status:i.status, memo:i.memo,
      buyerEmail:i.profiles?.email, company:i.profiles?.company, mst:i.profiles?.reg_no,
      contactName:i.profiles?.contact_name, zalo:i.profiles?.messenger,
    }));
  },
  async allBuyers(){
    const { data } = await SB.from('profiles').select('*').order('created_at',{ascending:false});
    return (data||[]).map(p=>({
      email:p.email, company:p.company, mst:p.reg_no, country:p.country, address:p.address,
      contactName:p.contact_name, position:p.position, zalo:p.messenger,
      verifiedBy:p.verified_by, status:p.verify_note, tier:p.tier, createdAt:p.created_at, _id:p.id,
    }));
  },

  /* ---- 제조사 입점 문의 ---- */
  async addMakerLead(lead){
    const { error } = await SB.from('maker_leads').insert(lead);
    return error ? { ok:false, err:error.message } : { ok:true };
  },
  async allMakerLeads(){
    const { data } = await SB.from('maker_leads').select('*').order('created_at',{ascending:false});
    return (data||[]).map(l=>({ ...l, createdAt:l.created_at }));
  },
});

/* ---------- Admin 치환 ---------- */
Object.assign(Admin, {
  isIn(){ return MkData.admin; },
  async login(pw){ return false; },            // 관리자도 일반 로그인 → admins 테이블로 판별
  logout(){ return Store.logout(); },
  changePassword(){ return false; },

  async upsertProduct(p){
    const row = {
      id:p.id, company_id:p.companyId||null, cat:p.cat, brand:p.brand, origin:p.origin,
      name:p.name, tagline:p.tagline, brand_story:p.brandStory,
      img:p.img, gallery:p.gallery, video:p.video, detail:p.detail,
      featured:p.featured, is_new:p.isNew, created_at:p.createdAt,
      inquiries:p.inquiries, views:p.views,
    };
    const { error } = await SB.from('products').upsert(row);
    if(error) throw error;
    const { error:e2 } = await SB.from('product_terms').upsert({
      product_id:p.id, price:p.price, moq:p.moq, lead:p.lead, terms:p.terms, updated_at:new Date().toISOString(),
    });
    if(e2) throw e2;
    await MkData.loadContent();
  },
  async deleteProduct(id){
    const { error } = await SB.from('products').delete().eq('id', id);
    if(error) throw error;
    await MkData.loadContent();
  },
  newProductId(){
    let n = 1; const ids = new Set(MK_PRODUCTS.map(p=>p.id));
    while(ids.has('p'+n)) n++;
    return 'p'+n;
  },

  async upsertColumn(c){
    const { error } = await SB.from('columns_post').upsert({
      id:c.id, cat:c.cat, title:c.title, excerpt:c.excerpt, body:c.body, img:c.img, date:c.date,
    });
    if(error) throw error;
    await MkData.loadContent();
  },
  async deleteColumn(id){
    await SB.from('columns_post').delete().eq('id', id);
    await MkData.loadContent();
  },
  newColumnId(){
    let n = 1; const ids = new Set(MK_COLUMNS.map(c=>c.id));
    while(ids.has('c'+n)) n++;
    return 'c'+n;
  },

  /* 문의 상태·메모는 DB 컬럼으로 */
  _inqCache: {},
  inqMeta(id){ const i = this._inqCache[id]; return { status:i?.status||'new', memo:i?.memo||'' }; },
  primeInq(list){ list.forEach(i=>this._inqCache[i.id] = { status:i.status, memo:i.memo }); },
  async setInqMeta(id, patch){
    this._inqCache[id] = { ...(this._inqCache[id]||{status:'new',memo:''}), ...patch };
    await SB.from('inquiries').update(patch).eq('id', id);
  },
  async deleteInquiry(id){ await SB.from('inquiries').delete().eq('id', id); },

  _leadCache: {},
  leadMeta(id){ const l = this._leadCache[id]; return { status:l?.status||'new', memo:l?.memo||'' }; },
  primeLeads(list){ list.forEach(l=>this._leadCache[l.id] = { status:l.status, memo:l.memo }); },
  async setLeadMeta(id, patch){
    this._leadCache[id] = { ...(this._leadCache[id]||{status:'new',memo:''}), ...patch };
    await SB.from('maker_leads').update(patch).eq('id', id);
  },
  async deleteLead(id){ await SB.from('maker_leads').delete().eq('id', id); },

  _tierCache: {},
  tier(email){ return this._tierCache[email] || 'verified'; },
  primeTiers(list){ list.forEach(b=>this._tierCache[b.email] = b.tier || 'verified'); },
  async setTier(email, tier){
    this._tierCache[email] = tier;
    await SB.from('profiles').update({ tier }).eq('email', email);
  },

  resetContent(){ /* Supabase 모드에서는 SQL로 처리 */ },
});

/* ---------- 이미지: IndexedDB → Supabase Storage ---------- */
const BUCKET = 'product-images';
Object.assign(MkImg, {
  /* dataUrl → Storage 업로드 → 공개 URL 반환.
     ★ 상세페이지 분할(saveDetail/sliceTall)도 이 함수를 거치므로
       이것만 갈아끼우면 조각들도 IndexedDB가 아니라 Storage로 간다. */
  async _store(dataUrl){
    const blob = await (await fetch(dataUrl)).blob();
    const ext  = blob.type === 'image/png' ? 'png' : 'jpg';
    const path = `${new Date().getFullYear()}/${Date.now().toString(36)}${Math.floor(Math.random()*1e9).toString(36)}.${ext}`;
    const { error } = await SB.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type, cacheControl: '31536000', upsert: false,
    });
    if(error) throw new Error('업로드 실패: ' + error.message);
    return SB.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  },
  async save(file){
    const { dataUrl, w, h, bytes } = await this.compress(file);
    const ref = await this._store(dataUrl);
    return { ref, dataUrl, w, h, bytes };   // 공개 URL을 그대로 저장
  },
  isRef(){ return false; },        // Storage 공개 URL이라 참조 치환이 필요 없다
  resolve(v){ return v; },
  async hydrate(){},
  async loadCache(){ return true; },
  async usage(){ return { count:0, used:0, quota:0 }; },
  async gc(){ return 0; },
});

}  /* end supabase mode */
