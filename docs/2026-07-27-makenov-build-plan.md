# MAKENOV 사이트 구축 계획

> 기획서: `docs/2026-07-27-makenov-기획서.md` (확정본) 기준.
> 정적 사이트 + Supabase 구조라 TDD 대신 **각 태스크마다 브라우저 프리뷰 검증**으로 진행.

**Goal:** 인디고고 레이아웃을 미러한 한국제품→베트남 바이어 문의수집 플랫폼 MVP.

**Architecture:** 정적 HTML/CSS/JS (인디고고 신버전 디자인 미러) + localStorage 우선 구현 → Supabase(Auth/DB/MST조회) 나중에 키 받아서 치환. 데이터는 `data.js` 단일 소스(하오디자인 방식), 관리자에서 편집.

**Tech Stack:** 바닐라 HTML/CSS/JS, Supabase(2단계), vietqr.io MST 조회 API, GitHub Pages 배포.

## Global Constraints

- 언어: VN(기본)/KR/EN 토글 — 모든 UI 문자열은 i18n 딕셔너리 경유, 하드코딩 금지
- 가격·MOQ·거래조건·카탈로그 = 블러 잠금, CTA 클릭 시 가입 모달
- 가입 = MST 인증 필수 (조회 성공 → 회사명/주소 자동입력·수정불가)
- 얼리버드/펀딩게이지/리워드 티어 없음
- 웨비나 = 메뉴만, "준비 중"
- 디자인: 인디고고 신버전 미러 (자작 금지 원칙), 포인트 컬러 단색

## 파일 구조

```
makenov/
├── index.html            홈
├── directory.html        디렉토리 (URL 파라미터 필터)
├── product.html          제품 상세 (?id=)
├── columns.html          칼럼 목록
├── column.html           칼럼 상세 (?id=)  ※추후 정적 굽기
├── webinar.html          준비 중 페이지
├── mypage.html           관심제품/문의내역/프로필
├── admin/index.html      관리자 (제품·칼럼·바이어·문의)
├── assets/css/style.css  디자인 시스템 (인디고고 미러)
├── assets/js/
│   ├── data.js           제품·칼럼·카테고리 시드 데이터 (단일 소스)
│   ├── i18n.js           VN/KR/EN 문자열 사전 + 토글
│   ├── app.js            공통 헤더/푸터·카트·잠금·가입모달·MST조회
│   └── store.js          localStorage 저장소 (→ Supabase 치환 지점)
└── docs/                 기획서·계획서
```

## Tasks

### Task 1: 스캐폴드 + 디자인 시스템
- 인디고고 신버전 실측: 폰트(system sans), 컬러(화이트 베이스+핑크/마젠타 포인트 → MAKENOV는 자체 포인트 컬러 1색), 카드/버튼/레일 스타일
- `style.css` 토큰(색·타이포·간격) + 공통 헤더(로고·검색·언어토글·카트뱃지·로그인)/푸터
- 검증: 프리뷰에서 헤더/푸터 렌더 확인

### Task 2: 시드 데이터 + i18n 골격
- `data.js`: 카테고리 6개(뷰티/식품/리빙/헬스/키즈/테크), 대구 기업 샘플 제품 8개(이름·브랜드·이미지·요약·상세블록·가격[잠금]·MOQ[잠금]·영상), 칼럼 3편
- `i18n.js`: `t('key')` 헬퍼, VN/KR/EN 3벌, localStorage에 언어 저장
- 검증: 콘솔에서 t() 전환 확인

### Task 3: 홈
- 히어로(대표제품+문의수 카운터), 카테고리 레일, Spotlight 피드(등록/문의 이벤트 타임라인), 칼럼 섹션, 웨비나 배너, 한국기업용 CTA(한국어)
- 검증: 프리뷰 스크린샷

### Task 4: 디렉토리
- `?category=&sort=` URL 파라미터 필터, 카드 그리드(문의수 소셜프루프)
- 검증: 필터 조합 동작

### Task 5: 제품 상세 (쇼핑몰 문법)
- 갤러리 | 상품명/브랜드/가격블러🔒/MOQ🔒 | CTA 3종(담기·문의·카탈로그🔒)
- 브랜드 소개 → 상세 이미지 세로나열+유튜브 embed → 반복 CTA → 추천 제품
- 검증: 잠금 블러·CTA 모달 트리거

### Task 6: 관심제품 카트 + 일괄 문의
- localStorage 카트, 헤더 뱃지, mypage 목록, "담은 제품 한꺼번에 문의"(제품 수만큼 문의 레코드 생성)
- 검증: 담기→뱃지→일괄문의 흐름

### Task 7: 가입/로그인 + MST 인증
- CTA → 가입 모달: 이메일/비번 → MST 입력 → vietqr 조회 → 회사명/주소 자동입력(readonly) → 담당자명/직함/Zalo → 완료
- 1단계: localStorage 세션 목업 / 2단계: Supabase Auth+Edge Function 치환 (`store.js`만 교체)
- 검증: 실제 MST(0100109106)로 자동입력 확인, CORS 불가 시 중계 필요 여부 기록
- 로그인 후: 블러 해제, 문의 저장에 바이어 정보 연결

### Task 8: 칼럼 + 웨비나
- columns.html/column.html (data.js 렌더), webinar.html "준비 중"+알림신청(카트와 같은 잠금 CTA)
- 검증: 칼럼 상세 렌더

### Task 9: 관리자
- 제품 CRUD·칼럼 CRUD·문의함·바이어 명단 (data.js 오버라이드 + export, 하오디자인 admin 패턴)
- 검증: 제품 추가→프론트 반영

### Task 10: 통합 검증 + 마감
- 3개 국어 전체 페이지 스위프, 모바일 반응형, Meta Pixel 자리(placeholder), 프리뷰 최종 스크린샷
- launch.json 등록 (:5710)

## 2단계 (별도 세션, 키 필요)
- Supabase 프로젝트 생성(사용자 계정) → store.js 치환, Edge Function(MST 중계), RLS
- GitHub Pages 배포 + 도메인
