# EUN CONTENTS

관계 진단, 함께하는 문답, 사주와 미니게임 등 나와 우리를 알아가는 다양한 콘텐츠를 한곳에서 제공하는 React 기반 웹서비스입니다.

[![Live Demo](https://img.shields.io/badge/Live_Demo-EUN_CONTENTS-4f392e?style=for-the-badge)](https://coffee-and.github.io/eun-contents/)

## 서비스 구조

EUN CONTENTS는 하나의 웹사이트 안에서 여러 콘텐츠를 선택해 이용하는 통합 콘텐츠 서비스입니다.

현재 제공 콘텐츠:

- 우리 관계 진단: 기존 Relationship Analyzer 기능을 통합 서비스 안의 첫 번째 하위 콘텐츠로 제공합니다.

준비 중 콘텐츠:

- 함께하는 문답: 연인, 부부, 가족, 친구와 서로를 조금 더 알아가는 질문 콘텐츠입니다.
- 사주 콘텐츠
- 미니게임
- 이후 추가될 테스트, 문답, 분석형 콘텐츠

## 우리 관계 진단

우리 관계 진단은 질문 응답을 바탕으로 감정 상태, 관계 안정성, 갈등 패턴, 미래 방향성을 분석하고 리포트 형태로 보여주는 콘텐츠입니다.

보조 영문명으로 Relationship Analyzer를 사용할 수 있지만, EUN CONTENTS 전체 서비스명과는 구분합니다.

주요 기능:

- 관계 유형 선택
- 질문 기반 진단
- 이전/다음 질문 이동
- 진행률 표시
- 점수 및 카테고리 분석
- 무료 결과 리포트
- 프리미엄 리포트 준비 UI
- 결과 이미지 저장
- 공유 링크 생성
- 서버 저장 및 조회
- 로컬 저장 결과 fallback
- 저장된 결과 재열기

## 기술 스택

- React
- Vite
- JavaScript
- CSS
- Vercel Functions
- Supabase
- html2canvas
- Web Share API
- Clipboard API
- GitHub Pages

## 프로젝트 구조

```text
src/
├─ app/
│  ├─ RootApp.jsx
│  ├─ contentCatalog.js
│  └─ routes.js
├─ pages/
│  ├─ HomePage.jsx
│  └─ home.css
├─ features/
│  └─ relationship/
│     ├─ RelationshipApp.jsx
│     ├─ components/
│     ├─ data/
│     ├─ domain/
│     ├─ hooks/
│     ├─ styles/
│     └─ utils/
├─ shared/
│  ├─ components/
│  └─ styles/
└─ main.jsx
```

## 콘텐츠 추가 방법

1. `src/app/contentCatalog.js`에 콘텐츠 정보를 추가합니다.
2. `id`, `route`, `title`, `description`, `theme`, `status`를 지정합니다.
3. 활성 콘텐츠라면 `src/features/<content-id>/` 아래에 화면과 도메인 로직을 추가합니다.
4. 준비 중 콘텐츠는 별도 feature 없이 카탈로그만으로 Coming Soon 화면에 연결됩니다.

예시:

```js
{
  id: "together-questions",
  route: "together-questions",
  category: "함께하는 시간",
  title: "함께하는 문답",
  subtitle: "Questions Together",
  description:
    "연인, 부부, 가족, 친구와 서로를 조금 더 알아가는 질문을 나눠요.",
  theme: "couple",
  status: "coming-soon",
}
```

현재 콘텐츠 카탈로그:

```text
EUN CONTENTS
├─ 우리 관계 진단
├─ 함께하는 문답
├─ 사주 콘텐츠
└─ 미니게임
```

## 테마 구조

공통 토큰과 콘텐츠별 테마를 분리합니다.

```text
src/shared/styles/
├─ global.css
├─ tokens.css
└─ themes/
   ├─ hub-theme.css
   └─ relationship-theme.css
```

- `global.css`: reset, 기본 요소 스타일, 공통 import
- `tokens.css`: typography, spacing, radius 등 공통 토큰
- `hub-theme.css`: EUN CONTENTS 홈 테마
- `relationship-theme.css`: 우리 관계 진단 라벤더 테마
- `features/relationship/styles/`: 관계 진단 전용 레이아웃과 컴포넌트 스타일

## 로컬 실행

```bash
npm install
npm run dev
```

로컬 개발 서버는 기본 Vite base `/`를 사용합니다.

## 빌드

Vercel 또는 일반 정적 빌드:

```bash
npm run build
npm run preview
```

GitHub Pages 빌드:

```bash
npm run build:pages
```

GitHub Pages 배포:

```bash
npm run deploy
```

## 배포 주소

- GitHub Pages: https://coffee-and.github.io/eun-contents/
- GitHub Repository: https://github.com/coffee-and/eun-contents
- Vercel: 프로젝트명 `eun-contents` 기준으로 대시보드에서 실제 도메인을 확인합니다.

## 환경변수

클라이언트:

```text
VITE_API_BASE_URL=
```

GitHub Pages 빌드는 `--mode github-pages`로 실행되므로, Pages에서 사용할 공개 API 주소는 `.env.github-pages`의 `VITE_API_BASE_URL`에 둡니다.
현재 값은 비밀값이 아닌 Vercel API 공개 URL입니다.

서버:

```text
SUPABASE_URL=
SUPABASE_SECRET_KEY=
```

주의:

- `SUPABASE_SECRET_KEY`는 서버 전용입니다.
- `SUPABASE_SECRET_KEY`를 `VITE_` 환경변수로 만들지 않습니다.
- 실제 비밀값은 README, 코드, 커밋에 포함하지 않습니다.

## 결과 저장 및 공유 구조

우리 관계 진단 결과는 Vercel Functions를 통해 Supabase `results` 테이블에 저장됩니다.

- 저장 API: `POST /api/results`
- 조회 API: `GET /api/results/:id`
- 공유 링크 표준 형식: `?resultId=<uuid>#/relationship`

기존 공유 링크 호환:

- `?resultId=<uuid>`
- `?resultId=<uuid>#/relationship`
- `#/relationship?resultId=<uuid>`
- `#/relationship`

앱 진입 시 `resultId`가 있으면 자동으로 우리 관계 진단 콘텐츠를 활성화하고 서버에서 저장 결과를 조회합니다. 서버 조회가 실패하면 기존 localStorage 저장 결과를 fallback으로 확인합니다.

## localStorage 호환

새 저장 키:

```text
eun-contents-relationship-results
```

기존 키 fallback:

```text
relationship-analyzer-results
```

기존 브라우저에 저장된 결과를 잃지 않도록 기존 키를 읽고 새 키로 병합 저장합니다.

## Supabase 연결

현재 결과 저장과 조회만 사용합니다.

- `api/results.js`: insert
- `api/results/[id].js`: select
- `api/supabase-health.js`: 연결 확인

서비스명과 레포명이 바뀌어도 Supabase 프로젝트나 테이블명은 변경하지 않습니다.

## GitHub Pages와 Vercel

Vite base는 환경별로 다릅니다.

- 로컬 개발: `/`
- Vercel: `/`
- GitHub Pages: `/eun-contents/`

GitHub Pages용 빌드는 `npm run build:pages`를 사용합니다.
이 빌드는 `.env.github-pages`를 읽어 Vercel API 도메인으로 결과 저장과 조회를 요청합니다.

## 보안 주의사항

- `.vercel/`은 로컬 연결 정보이므로 커밋하지 않습니다.
- `dist/`와 `node_modules/`는 커밋하지 않습니다.
- 서버 전용 Supabase key는 프론트 번들에 포함하지 않습니다.
- 결과 조회 API는 공유 링크를 가진 사용자가 결과를 볼 수 있는 구조입니다. 민감한 개인정보를 답변에 넣지 않도록 서비스 문구에서 안내가 필요합니다.

## 향후 계획

- 함께하는 문답 콘텐츠 추가
- 사주 콘텐츠 추가
- 미니게임 추가
- 콘텐츠별 테마 확장
- 기존 GitHub Pages 주소에서 새 주소로 안내하는 정적 리다이렉트 검토
