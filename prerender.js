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
/* 허브 페이지. bake.js 가 ko/ · en/ 폴더에 같은 구조로 한 벌씩 더 굽기 때문에
   언어판도 그대로 렌더 대상에 넣는다(파일이 없으면 알아서 건너뛴다). */
const HUBS = ['index.html', 'directory.html', 'companies.html', 'about.html', 'guide.html', 'columns.html'];
const LANGS = ['', 'ko/', 'en/'];
const withLangs = f => LANGS.map(pre => pre + f);

const PAGES = [
  ...HUBS.flatMap(withLangs),
  /* 고객센터는 탭 페이지다. 기본(공지) 말고 FAQ·1:1 탭 내용도 같은 URL 안에 있으므로
     해시별로 한 번씩 더 렌더해서 사본에 이어 붙인다. 안 그러면 FAQ 답변이
     정적 HTML 에서 통째로 빠진다. */
  ...withLangs('support.html').map(page => ({ page, extraHashes: ['#faq', '#ask'] })),
].filter(e => fs.existsSync(path.join(ROOT, typeof e === 'string' ? e : e.page)));

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
function renderMain(page, hash) {
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
      `http://localhost:${PORT}/${page}${hash || ''}`,
    ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch (e) {
    dom = e.stdout || '';                 /* 강제 종료돼도 받아둔 DOM 은 쓴다 */
    if (!dom) throw e;
  }

  const m = dom.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!m) return null;

  /* 헤더·푸터도 사본에 넣는다.
     둘 다 JS로 그려지고 <main> 밖이라, main 만 담았을 때는 크롤러가 받는 HTML 에
     사이트 내비게이션이 통째로 없었다. 언어판으로 가는 링크도 여기 들어 있다.
     (원본 <header>·<footer> 는 비어 있는 채로 두고 사본만 채운다. 부팅하면 사본은
      지워지고 원래 자리에 실제 헤더가 그려지므로 로그인 상태 깜빡임도 없다) */
  const chrome = ['mk-header', 'mk-footer']
    .map(id => {
      const b = extractBlock(dom, null, id);
      return b ? `<nav class="mk-static-${id}">${b}</nav>` : '';
    }).join('\n');

  return (m[1] + '\n' + chrome)
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

/* 요소 하나를 통째로 떼어낸다(class 또는 id 로 찾음).
   정규식으로 `...</div></div>` 를 잡으면 중첩된 첫 닫는 태그에서 잘려서
   FAQ 답변이 통째로 날아간다. 여는/닫는 태그를 세면서 짝을 맞춘다. */
function extractBlock(html, cls, id) {
  const open = id
    ? new RegExp(`<(div|header|footer|nav|section)[^>]*\\bid="${id}"[^>]*>`)
    : new RegExp(`<div class="${cls}"[^>]*>`);
  const m = html.match(open);
  if (!m) return null;
  const tagName = id ? m[0].match(/^<(\w+)/)[1] : 'div';
  let i = m.index + m[0].length, depth = 1;
  const tag = new RegExp(`</?${tagName}\\b[^>]*>`, 'g');
  tag.lastIndex = i;
  let t;
  while ((t = tag.exec(html))) {
    depth += t[0][1] === '/' ? -1 : 1;
    if (depth === 0) return html.slice(i, t.index);
  }
  return null;
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
  for (const entry of PAGES) {
    const page = typeof entry === 'string' ? entry : entry.page;
    const extras = (typeof entry === 'string' ? [] : entry.extraHashes) || [];
    process.stdout.write(`  ${page} … `);
    try {
      let html = renderMain(page);
      /* 탭 페이지: 나머지 탭은 본문 영역만 떼어 이어 붙인다 */
      for (const h of extras) {
        const alt = renderMain(page, h);
        const pane = alt && extractBlock(alt, 'nb-body');
        if (pane) html += `\n<div class="nb-body">${pane}</div>`;
      }
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
