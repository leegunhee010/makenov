/* ------------------------------------------------------------
   MAKENOV 사전 렌더 — 실행: node prerender.js   (bake.js 다음에 돌린다)
   ------------------------------------------------------------
   왜 필요한가
     index/directory/companies/about/guide/support/columns 는 화면을 전부 JS로
     그린다. 그래서 JS를 실행하지 않는 크롤러(GPTBot·ClaudeBot·PerplexityBot 등)가
     받아가는 본문이 30~80자뿐이었다. 검색과 AI 답변에 인용될 내용이 없다는 뜻이다.

   무엇을 하는가
     1) 이 폴더를 임시 정적 서버로 띄우고
     2) 설치된 크롬을 헤드리스로 돌려 완성된 DOM을 받아
     3) <main> 안에 <div id="mk-prerender"> 사본을 심는다.

   사용자에게는 보이지 않는다
     app.js 부팅 첫 줄에서 #mk-prerender 를 제거한다. 원본 컨테이너는 손대지 않으므로
     pageInit()이 평소대로 다시 그린다. 즉 소스 템플릿은 그대로 보존된다.
     이 스크립트를 몇 번 돌려도 결과는 같다(블록만 교체).
   ------------------------------------------------------------ */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync, spawn } = require('child_process');

const ROOT = __dirname;
const PORT = 5799;

/* ⚠ 정적 서버는 반드시 별도 프로세스여야 한다.
   execFileSync(크롬)가 이벤트 루프를 막아버려서, 같은 프로세스에서 서버를 띄우면
   크롬 요청을 하나도 처리하지 못하고 빈 DOM(41자)만 돌아온다.
   그래서 `node prerender.js --serve` 로 서버만 도는 모드를 둔다. */
const MIME_MAP = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
};

if (process.argv[2] === '--serve') {
  http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, { 'Content-Type': MIME_MAP[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  }).listen(PORT, () => console.log('READY'));
  return;
}

/* 사전 렌더 대상. 로그인 상태에 따라 내용이 달라지는 mypage/admin 은 제외한다. */
const PAGES = [
  'index.html', 'directory.html', 'companies.html',
  'about.html', 'guide.html', 'support.html', 'columns.html',
];

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
].find(p => { try { return fs.existsSync(p); } catch (e) { return false; } });

if (!CHROME) {
  console.error('크롬을 찾지 못했습니다. 설치 경로를 CHROME 목록에 추가하세요.');
  process.exit(1);
}

/* 렌더 전용 임시 프로필 (사용자 크롬 프로필과 분리) */
const PROFILE = path.join(require('os').tmpdir(), 'makenov-prerender-profile');

/* ---------- 1. 헤드리스 렌더 ---------- */
function renderMain(page) {
  /* ⚠ --headless=old 를 쓴다.
     새 헤드리스는 Supabase 연결이 열려 있으면 --dump-dom 후에도 프로세스가 끝나지 않아
     index.html 에서 무한 대기했다. 구 헤드리스는 --timeout 으로 강제 종료된다.
     execFileSync 의 timeout 은 그래도 안 끝날 때를 위한 2차 안전장치다. */
  let dom;
  try {
    dom = execFileSync(CHROME, [
      '--headless=old', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
      /* ⚠ 전용 프로필. 이걸 빼면 평소 쓰던 크롬이 떠 있을 때 새 프로세스가
         기존 인스턴스에 넘기고 바로 종료해서 빈 DOM(41자)만 돌아온다. */
      `--user-data-dir=${PROFILE}`,
      '--timeout=15000', '--virtual-time-budget=9000', '--dump-dom',
      `http://localhost:${PORT}/${page}`,
    ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    dom = e.stdout || '';                 /* 강제 종료돼도 받아둔 DOM 은 쓴다 */
    if (!dom) throw e;
  }

  const m = dom.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!m) return null;
  return m[1]
    /* 스크립트는 사본에 넣지 않는다. 두 번 실행될 이유가 없다 */
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    /* id 는 전부 뗀다. 사본과 원본 컨테이너의 id 가 겹쳐 문서에 중복 id 가 생기고,
       부팅 전에 getElementById 가 사본 쪽을 집을 수 있다. */
    .replace(/\sid="[^"]*"/g, '')
    /* ⚠ 주석도 전부 뗀다. app.js 는 <div id="mk-prerender"> 만 지우고
       <!-- mk:pre --> 주석 노드는 DOM 에 남는다. 그대로 두면 다음 실행 때
       사본 안에 마커가 딸려 들어가 블록이 중첩된다. */
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();
}

/* ---------- 3. 주입 ---------- */
const OPEN = '<!-- mk:pre (prerender.js가 관리 — 직접 수정 금지) -->';
const CLOSE = '<!-- /mk:pre -->';

function inject(page, html) {
  const file = path.join(ROOT, page);
  let src = fs.readFileSync(file, 'utf8');

  /* 이전 블록 제거 후 다시 넣는다 */
  const old = new RegExp(OPEN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?' + CLOSE, 'g');
  src = src.replace(old, '');

  const block = `${OPEN}\n<div id="mk-prerender">${html}</div>\n${CLOSE}`;
  const mainOpen = src.match(/<main[^>]*>/);
  if (!mainOpen) throw new Error(`${page}: <main> 을 찾지 못했습니다`);

  const at = src.indexOf(mainOpen[0]) + mainOpen[0].length;
  src = src.slice(0, at) + '\n' + block + '\n' + src.slice(at);
  fs.writeFileSync(file, src, 'utf8');
}

const text = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().length;

/* ---------- 4. 실행 ---------- */
const child = spawn(process.execPath, [__filename, '--serve'], { stdio: ['ignore', 'pipe', 'inherit'] });

child.stdout.once('data', () => {
  console.log(`임시 서버 :${PORT} (별도 프로세스)\n크롬: ${CHROME}\n`);
  const report = [];
  let failed = 0;
  for (const page of PAGES) {
    process.stdout.write(`  ${page} … `);
    try {
      const html = renderMain(page);
      if (!html || text(html) < 200) {
        console.log(`건너뜀 (렌더 결과 ${html ? text(html) : 0}자)`);
        failed++;
        continue;
      }
      inject(page, html);
      console.log(`${text(html)}자`);
      report.push({ 페이지: page, 텍스트: text(html), HTML: html.length });
    } catch (e) {
      console.log('실패:', e.message);
      failed++;
    }
  }
  console.log('');
  console.table(report);
  if (failed) console.log(`⚠ ${failed}개 페이지가 렌더되지 않았습니다.`);
  child.kill();
});
