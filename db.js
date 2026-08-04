/* ============================================================
   MAKENOV — Supabase DB에 SQL 파일을 직접 실행한다
   ------------------------------------------------------------
   대시보드 SQL Editor에 붙여넣지 않아도 되게 만든 실행기.

   준비 (한 번만)
     1) makenov/.env.local 을 만들고 아래 한 줄을 넣는다
          DATABASE_URL=postgresql://postgres.<ref>:<비밀번호>@aws-0-<리전>.pooler.supabase.com:5432/postgres
        · Supabase 대시보드 → Project Settings → Database → Connection string
        · Direct 말고 **Session pooler** 의 URI 를 쓴다 (Direct 는 IPv6 전용)
     2) npm install       (pg 모듈 설치)

   사용
     node db.js supabase/09_miralet.sql
     node db.js supabase/07_settings.sql supabase/08_goeunbal_detail.sql
     node db.js --all                    (supabase/*.sql 을 번호순으로 전부)
     node db.js --check                  (연결만 확인)

   ⚠️ .env.local 은 .gitignore 에 들어 있다. 이 레포는 공개이므로 절대 커밋하지 말 것.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

/* ---------- .env.local 읽기 ---------- */
function loadEnv(){
  const f = path.join(ROOT, '.env.local');
  if(!fs.existsSync(f)){
    console.error('\n.env.local 이 없습니다.');
    console.error('makenov/.env.local 을 만들고 아래 한 줄을 넣으세요:\n');
    console.error('  DATABASE_URL=postgresql://postgres.<ref>:<비밀번호>@aws-0-<리전>.pooler.supabase.com:5432/postgres\n');
    process.exit(1);
  }
  for(const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)){
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if(m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  const url = process.env.DATABASE_URL;
  if(!url){ console.error('.env.local 에 DATABASE_URL 이 없습니다.'); process.exit(1); }
  if(/\[YOUR-PASSWORD\]|<비밀번호>/.test(url)){
    console.error('DATABASE_URL 의 비밀번호 자리가 그대로입니다 — 실제 비밀번호로 바꾸세요.');
    process.exit(1);
  }
  return url;
}

/* 로그에 비밀번호가 찍히지 않게 가린다 */
const mask = u => String(u).replace(/:\/\/([^:]+):[^@]+@/, '://$1:****@');

async function main(){
  let Client;
  try{ ({ Client } = require('pg')); }
  catch{
    console.error('\npg 모듈이 없습니다. makenov 폴더에서 아래를 실행하세요:\n\n  npm install\n');
    process.exit(1);
  }

  const url = loadEnv();
  const args = process.argv.slice(2);

  let files = [];
  if(args.includes('--all')){
    files = fs.readdirSync(path.join(ROOT, 'supabase'))
      .filter(f => f.endsWith('.sql')).sort()
      .map(f => path.join('supabase', f));
  }else{
    files = args.filter(a => !a.startsWith('--'));
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  console.log('접속:', mask(url));
  await client.connect();

  const who = await client.query('select current_database() db, current_user usr, version() v');
  console.log('연결됨:', who.rows[0].db, '/', who.rows[0].usr);

  if(args.includes('--check') || !files.length){
    const t = await client.query(
      `select table_name from information_schema.tables
        where table_schema='public' order by table_name`);
    console.log('테이블:', t.rows.map(r => r.table_name).join(', ') || '(없음)');
    await client.end();
    return;
  }

  for(const rel of files){
    const abs = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
    if(!fs.existsSync(abs)){ console.error('  건너뜀 — 파일 없음:', rel); continue; }
    const sql = fs.readFileSync(abs, 'utf8');
    process.stdout.write(`\n▶ ${rel} … `);
    try{
      /* 파일 하나를 한 트랜잭션으로 — 중간에 실패하면 통째로 되돌린다 */
      await client.query('begin');
      await client.query(sql);
      await client.query('commit');
      console.log('완료');
    }catch(e){
      await client.query('rollback').catch(()=>{});
      console.log('실패');
      console.error('  ', e.message);
      if(e.position) console.error('   위치:', e.position);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('\n전부 반영했습니다.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
