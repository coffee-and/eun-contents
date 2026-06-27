# 함께하는 문답 Supabase 적용 가이드

## 실행 전 확인

1. 대상 프로젝트가 `eun-contents` 운영 Supabase 프로젝트인지 확인합니다.
2. Vercel 서버 환경 변수 `SUPABASE_URL`, `SUPABASE_SECRET_KEY`가 운영 프로젝트 값을 가리키는지 확인합니다.
3. 이 문서에는 비밀키 값을 적지 않습니다.

## 실행할 SQL

Supabase Dashboard > SQL Editor에서 아래 파일 전체를 한 번에 실행합니다.

```text
supabase/migrations/202606270001_create_question_sessions.sql
```

이 SQL은 다음을 생성합니다.

- `question_sessions`
- `question_participants`
- `question_answers`
- 공개 초대 코드 인덱스와 상태 조회 인덱스
- `updated_at` 자동 갱신 트리거
- RLS 활성화와 클라이언트 직접 접근 차단 정책

## 실행 후 확인 쿼리

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'question_sessions',
    'question_participants',
    'question_answers'
  )
order by table_name;

select tablename, policyname
from pg_policies
where schemaname = 'public'
  and tablename like 'question_%'
order by tablename, policyname;
```

## 실패 시 중단 지점

1. `pgcrypto` 확장 생성 권한 오류가 나면 Supabase 프로젝트 권한을 확인한 뒤 다시 실행합니다.
2. 외래키 또는 테이블이 이미 있다는 오류가 나면 기존 테이블 구조가 다른지 먼저 비교합니다.
3. 기존 운영 데이터가 있는 경우 임의 삭제하지 말고 백업 후 별도 마이그레이션으로 조정합니다.

## 롤백 SQL

운영 데이터 삭제가 포함되므로, 실제 운영에서는 백업 후에만 실행합니다.

```sql
drop table if exists public.question_answers cascade;
drop table if exists public.question_participants cascade;
drop table if exists public.question_sessions cascade;
```

## Vercel 환경 변수

이미 관계 진단 결과 저장 API가 사용하는 변수와 같습니다.

- `SUPABASE_URL`: Vercel 서버 함수에서 Supabase 프로젝트에 연결할 때 사용
- `SUPABASE_SECRET_KEY`: Vercel 서버 함수에서 service role 권한으로 DB에 접근할 때 사용
- `VITE_API_BASE_URL`: 클라이언트가 Vercel API를 호출할 때 사용

Production, Preview, Development 중 실제 배포에 필요한 범위에 등록합니다.
