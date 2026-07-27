/* ============================================================
   MAKENOV 백엔드 설정
   ------------------------------------------------------------
   아래 두 값을 채우면 자동으로 Supabase 모드로 전환됩니다.
   비워두면 지금까지처럼 브라우저 저장(localStorage) 모드로 동작합니다.

   값 찾는 곳: Supabase 대시보드 → Project Settings → API
     MK_SUPABASE_URL  = Project URL
     MK_SUPABASE_ANON = anon / public 키

   ⚠️ anon 키는 브라우저에 노출되는 게 정상입니다. 보안은 RLS가 담당합니다.
      service_role 키는 절대 여기 넣지 마세요.
   ============================================================ */
const MK_SUPABASE_URL  = 'https://dkidobfbptdiesnrqvuq.supabase.co';
const MK_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRraWRvYmZicHRkaWVzbnJxdnVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNjYyMTQsImV4cCI6MjEwMDc0MjIxNH0.JvkORPCzz4iaL_3-psybP73srdjUsFvNeiu1WYPHVLI';

/* 국세청 사업자 조회를 Edge Function으로 넘길지 여부.
   true 면 verify.js 가 키를 들고 있지 않고 서버 함수를 호출합니다. */
const MK_USE_EDGE_VERIFY = true;

const MK_BACKEND = (MK_SUPABASE_URL && MK_SUPABASE_ANON) ? 'supabase' : 'local';
