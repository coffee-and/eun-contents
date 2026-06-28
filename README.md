# EUN CONTENTS

EUN CONTENTS는 관계 진단과 함께하는 문답을 중심으로 작은 콘텐츠를 모아두는 React/Vite 프로젝트입니다.

## 주요 기능

- 우리 관계 진단
  - 질문 답변을 바탕으로 관계 상태와 갈등 경향을 리포트로 보여줍니다.
  - 결과 저장, 공유 링크, 이미지 저장을 지원합니다.

- 함께하는 문답
  - 혼자 30문항 문답을 작성하고 나만의 문답집으로 저장합니다.
  - PDF 저장, 이미지 저장, 공유 링크를 지원합니다.
  - 공유 링크로 다른 사람도 같은 문답을 작성해볼 수 있습니다.

- 준비 중
  - 사주 콘텐츠
  - 미니게임

## 사용 기술

- React
- Vite
- JavaScript
- CSS
- Vercel Functions
- Supabase
- html2canvas

## 폴더 구조

```text
api/                    Vercel 서버 API
public/                 아이콘, 정적 파일
src/
  app/                  앱 진입, 라우팅
  data/                 홈 콘텐츠 같은 공통 정적 데이터
  features/             콘텐츠별 기능
    relationship/       관계 진단
    together-questions/ 함께하는 문답
  shared/               공통 컴포넌트와 스타일 토큰
supabase/migrations/    DB 백업과 복구용 SQL
```

## 실행 방법

```bash
npm install
npm run dev
```

빌드 확인:

```bash
npm run build
```

GitHub Pages용 빌드:

```bash
npm run build:pages
```

## 배포와 환경변수

- Vercel: `https://eun-contents.vercel.app`
- GitHub Pages: `https://coffee-and.github.io/eun-contents/`

필요한 환경변수:

```text
VITE_API_BASE_URL
SUPABASE_URL
SUPABASE_SECRET_KEY
```

`SUPABASE_SECRET_KEY`는 서버 API에서만 사용해야 하며, 클라이언트 코드에 노출하면 안 됩니다.

## DB 백업

Supabase 복구용 SQL은 아래 파일에 정리되어 있습니다.

```text
supabase/migrations/database_backup.sql
```

새 Supabase 프로젝트에 복구할 때는 SQL Editor에서 실행하고, Vercel 환경변수를 다시 연결합니다.
