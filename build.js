/* ------------------------------------------------------------
   MAKENOV 빌드 — 실행: node build.js
   ------------------------------------------------------------
   bake.js 와 prerender.js 는 반드시 이 순서로, 항상 함께 돌아야 한다.

   bake.js 는 허브 페이지의 언어판(about.ko.html 등)을 기본형에서 다시 찍어내면서
   사전 렌더 블록을 지운다(옛 내용이 남으면 안 되므로). 그래서 bake 만 돌리고
   배포하면 언어판이 크롤러에게 빈 페이지로 나간다. 실제로 한 번 그렇게 나갔다.

   그래서 둘을 따로 부르지 말고 이 파일을 쓴다.
   ------------------------------------------------------------ */
const { execFileSync } = require('child_process');

const run = (file, label) => {
  console.log(`\n${'='.repeat(58)}\n▶ ${label}\n${'='.repeat(58)}`);
  execFileSync(process.execPath, [file], { cwd: __dirname, stdio: 'inherit' });
};

run('bake.js', '1/2  정적 페이지·스키마·사이트맵 굽기');
run('prerender.js', '2/2  JS로 그리는 페이지를 크롤러용으로 사전 렌더');

console.log('\n빌드 완료. 이제 커밋·푸시하면 됩니다.');
