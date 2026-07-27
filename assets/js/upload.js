/* ============================================================
   MAKENOV 이미지 업로드 — 관리자에서 파일을 직접 올린다.
   서버가 없는 MVP이므로:
     1) 브라우저에서 리사이즈·압축 (원본 4000px 사진 → 1600px / JPEG 0.82)
     2) IndexedDB에 저장 (localStorage는 5MB라 사진 몇 장이면 꽉 참)
     3) 데이터에는 'mkimg:<id>' 참조만 넣고, 페이지 로드 시 실제 이미지로 치환
   2단계에서 Supabase Storage로 옮길 때는 save()/hydrate() 두 함수만 바꾸면 된다.
   ============================================================ */
const MkImg = {
  DB: 'makenov_img', STORE: 'img', MAXW: 1600, QUALITY: 0.82,
  _db: null,

  /* ---------- IndexedDB ---------- */
  open(){
    if(this._db) return Promise.resolve(this._db);
    return new Promise((res, rej)=>{
      const rq = indexedDB.open(this.DB, 1);
      rq.onupgradeneeded = e => {
        const db = e.target.result;
        if(!db.objectStoreNames.contains(this.STORE)) db.createObjectStore(this.STORE);
      };
      rq.onsuccess = e => { this._db = e.target.result; res(this._db); };
      rq.onerror   = e => rej(e.target.error);
    });
  },
  async _tx(mode, fn){
    const db = await this.open();
    return new Promise((res, rej)=>{
      const tx = db.transaction(this.STORE, mode);
      const rq = fn(tx.objectStore(this.STORE));
      rq.onsuccess = () => res(rq.result);
      rq.onerror   = () => rej(rq.error);
    });
  },
  put(id, dataUrl){ return this._tx('readwrite', s => s.put(dataUrl, id)); },
  get(id){         return this._tx('readonly',  s => s.get(id)); },
  del(id){         return this._tx('readwrite', s => s.delete(id)); },
  keys(){          return this._tx('readonly',  s => s.getAllKeys()); },
  values(){        return this._tx('readonly',  s => s.getAll()); },

  /* ---------- 리사이즈·압축 ----------
     캔버스로 긴 변을 MAXW로 줄이고 JPEG로 다시 인코딩한다.
     PNG 투명도가 필요한 로고는 알파를 보존해 PNG로 유지. */
  compress(file){
    return new Promise((res, rej)=>{
      if(!/^image\//.test(file.type)) return rej(new Error('이미지 파일만 올릴 수 있습니다'));
      const fr = new FileReader();
      fr.onerror = () => rej(new Error('파일을 읽지 못했습니다'));
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => rej(new Error('이미지를 열지 못했습니다'));
        img.onload = () => {
          const scale = Math.min(1, this.MAXW / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
          const cv = document.createElement('canvas');
          cv.width = w; cv.height = h;
          const cx = cv.getContext('2d');
          const keepAlpha = /png|webp|svg/i.test(file.type);
          if(!keepAlpha){ cx.fillStyle = '#fff'; cx.fillRect(0,0,w,h); }
          cx.drawImage(img, 0, 0, w, h);
          const out = keepAlpha ? cv.toDataURL('image/png')
                                : cv.toDataURL('image/jpeg', this.QUALITY);
          res({ dataUrl: out, w, h, bytes: Math.round(out.length * 0.75) });
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  },

  /* 파일 저장 → 'mkimg:<id>' 참조 반환 */
  async save(file){
    const { dataUrl, w, h, bytes } = await this.compress(file);
    const id = 'i' + Date.now().toString(36) + Math.floor(performance.now()*1000%1e6).toString(36);
    await this.put(id, dataUrl);
    this._cache[id] = dataUrl;
    return { ref: 'mkimg:' + id, dataUrl, w, h, bytes };
  },

  /* ---------- 참조 해석 ---------- */
  _cache: {},
  isRef(v){ return typeof v === 'string' && v.startsWith('mkimg:'); },
  resolve(v){
    if(!this.isRef(v)) return v;
    return this._cache[v.slice(6)] || '';
  },

  /* 저장된 이미지를 전부 캐시에 올린 뒤, 데이터의 mkimg: 참조를 실제 이미지로 치환.
     페이지 렌더 코드는 손대지 않아도 되게 부팅 시 한 번만 돌린다. */
  /* 캐시만 채운다 (데이터는 건드리지 않음) — 관리자는 원본 mkimg: 참조를 유지해야 하므로 이걸 쓴다 */
  async loadCache(){
    try{
      const [keys, vals] = await Promise.all([this.keys(), this.values()]);
      keys.forEach((k,i)=>{ this._cache[k] = vals[i]; });
      return true;
    }catch(e){ return false; }
  },

  async hydrate(){
    if(!await this.loadCache()) return;   // IndexedDB 불가 환경에서도 페이지는 떠야 한다

    const fix = s => this.isRef(s) ? (this.resolve(s) || s) : s;
    /* 배열 원소도 인덱스로 다시 넣어야 한다 — gallery 처럼 문자열 배열이 있다 */
    const walk = obj => {
      if(!obj || typeof obj !== 'object') return;
      const keys = Array.isArray(obj) ? obj.map((_,i)=>i) : Object.keys(obj);
      keys.forEach(k=>{
        const v = obj[k];
        if(typeof v === 'string') obj[k] = fix(v);
        else walk(v);
      });
    };
    [typeof MK_PRODUCTS!=='undefined'&&MK_PRODUCTS, typeof MK_COLUMNS!=='undefined'&&MK_COLUMNS,
     typeof MK_COMPANIES!=='undefined'&&MK_COMPANIES, typeof MK_HERO!=='undefined'&&MK_HERO]
      .filter(Boolean).forEach(walk);
  },

  /* ---------- 사용량 ---------- */
  async usage(){
    let used = 0, count = 0;
    try{
      const vals = await this.values();
      count = vals.length;
      vals.forEach(v => used += v.length * 0.75);
    }catch(e){}
    let quota = 0;
    try{ const est = await navigator.storage.estimate(); quota = est.quota || 0; }catch(e){}
    return { count, used, quota };
  },

  /* 어느 데이터에서도 참조하지 않는 이미지 정리 */
  async gc(){
    const used = new Set();
    const walk = obj => {
      if(!obj || typeof obj !== 'object') return;
      Object.values(obj).forEach(v=>{
        if(typeof v === 'string'){ if(this.isRef(v)) used.add(v.slice(6)); }
        else walk(v);
      });
    };
    /* 원본(hydrate 전) 참조는 localStorage 오버라이드에 남아 있다 */
    ['mk_products_override','mk_columns_override'].forEach(k=>{
      try{ walk(JSON.parse(localStorage.getItem(k)||'null')); }catch(e){}
    });
    const keys = await this.keys();
    const dead = keys.filter(k=>!used.has(k));
    for(const k of dead){ await this.del(k); delete this._cache[k]; }
    return dead.length;
  },
};

/* 내보내기용 — mkimg: 참조를 실제 data URL로 바꾼 깊은 복사본을 만든다.
   이걸 거치지 않으면 다른 기기에서 이미지가 전부 깨진다. */
function inlineImages(obj){
  if(Array.isArray(obj)) return obj.map(inlineImages);
  if(obj && typeof obj === 'object'){
    const out = {};
    Object.keys(obj).forEach(k=>{ out[k] = inlineImages(obj[k]); });
    return out;
  }
  if(typeof obj === 'string' && MkImg.isRef(obj)) return MkImg.resolve(obj) || obj;
  return obj;
}

function fmtBytes(n){
  if(n < 1024) return n + ' B';
  if(n < 1024*1024) return (n/1024).toFixed(0) + ' KB';
  return (n/1024/1024).toFixed(1) + ' MB';
}
