-- ============================================================
--  MAKENOV — 인증 상태 자가 승격 차단
--
--  문제: profiles 는 본인이 자기 행을 수정할 수 있고, 그 안에 status 가 있다.
--        가입만 한 사람이 브라우저 콘솔에서
--          SB.from('profiles').update({status:'verified'}).eq('id', 내ID)
--        를 실행하면 스스로 인증 통과 처리하고 모든 단가를 볼 수 있다.
--
--  해결: status / verified_by / tier 는 클라이언트가 못 바꾸게 막고,
--        Edge Function(service_role)과 관리자만 변경할 수 있게 한다.
--
--  ⚠️ 실행 순서 주의
--     1) 먼저 Edge Function 을 배포하세요:
--          supabase functions deploy verify-business --no-verify-jwt
--     2) 그다음 이 파일을 실행하세요.
--     순서를 바꾸면 신규 가입자가 인증 상태를 못 받아 문의를 못 넣습니다.
-- ============================================================

create or replace function guard_profile_privileges()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  -- service_role(Edge Function)은 그대로 통과
  if auth.role() = 'service_role' then
    return new;
  end if;

  -- 관리자는 등급(tier)까지 변경 가능
  if is_admin() then
    if new.status is distinct from old.status
       or new.verified_by is distinct from old.verified_by then
      -- 관리자 수동 승인도 허용하되 기록은 남긴다
      new.verify_note := coalesce(new.verify_note,'') || ' [관리자 수동변경]';
    end if;
    return new;
  end if;

  -- 그 외(=본인)는 권한 관련 컬럼을 바꿀 수 없다. 조용히 원래 값으로 되돌린다.
  new.status      := old.status;
  new.verified_by := old.verified_by;
  new.tier        := old.tier;
  return new;
end $$;

drop trigger if exists on_profile_update on profiles;
create trigger on_profile_update
  before update on profiles
  for each row execute function guard_profile_privileges();

-- 신규 삽입도 마찬가지 (가입 트리거는 security definer 라 영향 없음)
create or replace function guard_profile_insert()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if auth.role() = 'service_role' or is_admin() then
    return new;
  end if;
  new.status      := 'pending';
  new.verified_by := null;
  new.tier        := 'verified';
  return new;
end $$;

drop trigger if exists on_profile_insert on profiles;
create trigger on_profile_insert
  before insert on profiles
  for each row execute function guard_profile_insert();

-- ---------- 확인 ----------
-- 아래를 로그인한 일반 사용자로 실행하면 status 가 바뀌지 않아야 합니다.
--   update profiles set status='verified' where id = auth.uid();
--   select status from profiles where id = auth.uid();   -- 여전히 pending
