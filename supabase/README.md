# MAKENOV — Supabase 연결 가이드

지금 사이트는 **브라우저 저장(localStorage) 모드**로 돌아갑니다.
아래 순서를 마치고 `assets/js/config.js`에 값 두 개만 채우면 Supabase 모드로 바뀝니다.
**중간에 멈춰도 사이트는 계속 동작합니다.** 값이 비어 있으면 예전 방식으로 돌아가게 만들어 뒀습니다.

---

## 1. 프로젝트 만들기

1. https://supabase.com 에서 계정을 만들고 **New project** 를 누릅니다.
2. Region은 **Northeast Asia (Seoul)** 를 고르세요. 베트남 바이어 기준으로도 가장 가깝습니다.
3. Database Password는 따로 적어두세요. (나중에 직접 접속할 때 씁니다)

## 2. 테이블 만들기

대시보드 왼쪽 **SQL Editor** → **New query** 에 아래 파일 내용을 붙여넣고 **Run**.

1. `supabase/01_schema.sql` — 테이블·권한(RLS)·트리거
2. `supabase/02_seed.sql` — 현재 제품 9개·제조사 9곳·칼럼 3건·히어로 4장

> `02_seed.sql`은 `node supabase/gen-seed.js` 로 언제든 다시 만들 수 있습니다.
> 관리자에서 편집한 내용을 옮기려면 먼저 **설정 → data.js 내보내기**로 파일을 교체한 뒤 실행하세요.

## 3. 이미지 저장소 만들기

**Storage** → **New bucket**

- 이름: `product-images`
- **Public bucket 체크** (제품 사진은 누구나 봐야 합니다)

그다음 SQL Editor에서 업로드 권한을 관리자에게만 줍니다.

```sql
create policy "img_read"  on storage.objects for select
  using (bucket_id = 'product-images');
create policy "img_write" on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());
create policy "img_del"   on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());
```

## 4. 관리자 계정 만들기

1. **Authentication** → **Users** → **Add user** → **Create new user**
   - 이메일·비밀번호를 정합니다. (예: `admin@makenov.com`)
   - **Auto Confirm User** 를 켜세요. 안 켜면 메일 확인 전까지 로그인이 안 됩니다.
2. 만들어진 사용자의 **UID** 를 복사합니다.
3. SQL Editor에서:

```sql
insert into admins (user_id) values ('복사한-UID') on conflict do nothing;
```

이제 `/admin` 에서 그 이메일·비밀번호로 로그인합니다.
(기존 비밀번호 `makenov2026` 은 localStorage 모드에서만 쓰입니다)

## 5. 국세청 키 숨기기 (권장)

지금 `assets/js/verify.js` 안에 국세청 API 키가 **그대로 들어 있습니다.**
소스 보기만 하면 누구나 가져다 씁니다. Edge Function으로 옮기세요.

```bash
npm i -g supabase
supabase login
supabase link --project-ref <프로젝트-ref>
supabase functions deploy verify-business --no-verify-jwt
supabase secrets set NTS_KEY=<공공데이터포털에서_발급받은_키>
```

### ★ 함수 배포는 보안상 필수입니다

Edge Function 은 국세청 키를 숨기는 것 말고도 **인증 상태를 서버에서 확정**하는 역할을 합니다.

이게 없으면 가입만 한 사람이 브라우저 콘솔에서
`SB.from('profiles').update({status:'verified'})` 를 실행해
**스스로 인증 통과 처리하고 모든 단가를 볼 수 있습니다.**

**반드시 이 순서로 진행하세요.**

1. 함수 배포 (위 명령)
2. `supabase/03_lockdown.sql` 실행 — 클라이언트의 인증 상태 변경을 차단

순서를 바꾸면 신규 가입자가 인증 상태를 못 받아 문의를 넣지 못합니다.
함수가 배포되기 전까지 클라이언트는 예전 방식으로 되돌아가므로 가입 자체는 계속 됩니다.

### 확인 방법

일반 계정으로 로그인한 뒤 브라우저 콘솔에서:

```js
await SB.from('profiles').update({status:'verified'}).eq('id',(await SB.auth.getUser()).data.user.id)
await SB.from('profiles').select('status').single()
```

`status` 가 여전히 `pending` 이면 차단이 정상 동작하는 것입니다.

## 6. 이메일 확인 설정

**Authentication → Providers → Email**

- 테스트 중에는 **Confirm email 끄기** (가입 즉시 로그인)
- 실서비스 전에 다시 켜세요. 안 켜면 남의 이메일로 가입할 수 있습니다.

## 7. 연결

`assets/js/config.js` 를 열고 두 줄을 채웁니다.
값은 **Project Settings → API** 에 있습니다.

```js
const MK_SUPABASE_URL  = 'https://xxxxxxxx.supabase.co';
const MK_SUPABASE_ANON = 'eyJhbGciOi...';
```

> anon 키는 브라우저에 노출되는 게 정상입니다. 보안은 RLS가 담당합니다.
> **service_role 키는 절대 넣지 마세요.** 그건 모든 권한을 우회합니다.

저장하고 사이트를 새로고침하면 끝입니다.

---

## 확인할 것

| 확인 | 방법 | 기대 결과 |
|---|---|---|
| 콘텐츠 로드 | 홈 열기 | 제품 9개가 뜬다 |
| **가격 잠금** | 로그아웃 상태로 제품 상세 → F12 → Network → `product_terms` | **응답이 빈 배열 `[]`** |
| 가격 열람 | 인증 가입 후 같은 요청 | 가격·MOQ가 내려온다 |
| 문의 | 인증 후 견적 문의 | 관리자 문의함에 뜬다 |
| 입점 문의 | 로그아웃 상태로 maker.html 제출 | 관리자 입점문의 탭에 뜬다 |
| 이미지 | 관리자에서 사진 업로드 | Storage에 파일이 생기고 사이트에 뜬다 |

**두 번째 줄이 이번 작업의 핵심입니다.**
지금까지 가격 잠금은 CSS 블러라 소스 보기로 뚫렸습니다.
이제 인증 안 된 사용자에게는 가격이 **애초에 전송되지 않습니다.**

---

## 구조 메모

- `product_terms` 를 `products` 와 분리한 이유: RLS는 행 단위라 같은 테이블에서 가격 컬럼만 가릴 수 없습니다.
- 렌더 코드는 동기(`MK_PRODUCTS` 전역 배열)라, 부팅 시 `MkData.boot()` 가 데이터를 받아 그 배열을 채웁니다. 페이지 코드는 손대지 않았습니다.
- localStorage 모드로 되돌리려면 `config.js` 의 두 값을 비우면 됩니다.

## 아직 안 한 것

- 제조사(companies) 관리자 CRUD 화면 — 지금은 SQL로 직접 넣어야 합니다
- 문의 도착 알림(텔레그램·이메일)
- 기존 localStorage 데이터 자동 이관 — 테스트 데이터뿐이라 생략했습니다
