// ============================================================
//  MAKENOV — 사업자 인증 Edge Function
//  국세청 API 키를 브라우저에서 숨기기 위한 함수입니다.
//  (지금은 verify.js 안에 키가 들어 있어 소스보기로 그대로 노출됩니다)
//
//  배포:
//    supabase functions deploy verify-business --no-verify-jwt
//    supabase secrets set NTS_KEY=발급받은_국세청_키
//
//  --no-verify-jwt 인 이유: 회원가입 '전에' 호출되므로 로그인 토큰이 없습니다.
// ============================================================
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/** 국세청 공식 체크섬 — 가중치 [1,3,7,1,3,7,1,3,5] + 9번째×5의 십의 자리 */
function validKoreanBRN(input: string): boolean {
  const d = String(input).replace(/\D/g, '');
  if (d.length !== 10) return false;
  const w = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * w[i];
  sum += Math.floor((Number(d[8]) * 5) / 10);
  return ((10 - (sum % 10)) % 10) === Number(d[9]);
}

async function verifyKR(regNo: string, company: string) {
  const d = String(regNo).replace(/\D/g, '');
  if (!validKoreanBRN(d)) return { ok: false, err: 'invalid_brn' };

  const key = Deno.env.get('NTS_KEY');
  if (!key) {
    return { ok: true, company, address: '', status: '체크섬 검증 통과 (국세청 키 미설정)', checked: 'checksum' };
  }
  try {
    const r = await fetch(
      'https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=' + encodeURIComponent(key),
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ b_no: [d] }) },
    );
    const j = await r.json();
    const item = j?.data?.[0];
    if (!item) return { ok: false, err: 'nts_down' };

    const st: string = item.b_stt || '';
    if (!st) return { ok: false, err: 'not_registered' };
    if (/폐업/.test(st)) return { ok: false, err: 'closed' };
    return {
      ok: true, company, address: '',
      status: st + (item.tax_type ? ' · ' + item.tax_type : ''),
      taxType: item.tax_type || '', checked: 'nts',
    };
  } catch {
    return { ok: true, company, address: '', status: '체크섬 검증 통과 (국세청 응답 없음)', checked: 'checksum' };
  }
}

async function verifyVN(regNo: string) {
  const d = String(regNo).replace(/\D/g, '');
  if (d.length < 10) return { ok: false, err: 'invalid_mst' };
  try {
    const r = await fetch('https://api.vietqr.io/v2/business/' + d);
    const j = await r.json();
    if (!j?.data?.name) return { ok: false, err: 'not_found' };
    return { ok: true, company: j.data.name, address: j.data.address || '', status: j.data.status || '', checked: 'gov' };
  } catch {
    return { ok: false, err: 'not_found' };
  }
}

const FREE_MAIL = new Set([
  'gmail.com', 'googlemail.com', 'naver.com', 'daum.net', 'hanmail.net', 'nate.com', 'kakao.com',
  'yahoo.com', 'yahoo.co.jp', 'outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'icloud.com',
  'me.com', 'aol.com', 'protonmail.com', 'proton.me', 'zoho.com', 'gmx.com', 'mail.com',
  'yandex.com', 'qq.com', '163.com', '126.com', 'sina.com', 'foxmail.com',
]);

async function verifyDomain(email: string, company: string) {
  const m = String(email).toLowerCase().match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
  if (!m) return { ok: false, err: 'invalid_email' };
  const domain = m[1];
  if (FREE_MAIL.has(domain)) return { ok: false, err: 'free_mail' };
  if (!company) return { ok: false, err: 'missing' };
  try {
    const r = await fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=A');
    const j = await r.json();
    if (!j?.Answer?.length) return { ok: false, err: 'domain_dead' };
  } catch { /* 조회 실패는 통과시키고 관리자 검수 */ }
  return {
    ok: true, company, address: '', status: '회사 도메인 확인 (' + domain + ')',
    checked: 'domain', accountEmail: String(email).trim().toLowerCase(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, err: 'method' }, 405);

  let body: Record<string, string>;
  try { body = await req.json(); } catch { return json({ ok: false, err: 'bad_json' }, 400); }

  const { method, regNo = '', company = '', email = '' } = body;
  if (method === 'brn')    return json(await verifyKR(regNo, company));
  if (method === 'mst')    return json(await verifyVN(regNo));
  if (method === 'domain') return json(await verifyDomain(email, company));
  return json({ ok: false, err: 'unknown_method' }, 400);
});
