# EUN CONTENTS

EUN CONTENTS는 나와 우리를 조금 더 알아가기 위한 작은 콘텐츠들을 모아둔 웹서비스입니다.

지금은 관계를 차분하게 돌아볼 수 있는 `우리 관계 진단`을 먼저 제공하고 있고, 함께 즐길 수 있는 문답과 사주, 미니게임 콘텐츠를 차례로 준비하고 있습니다.

## 현재 콘텐츠

이용 가능:

- 우리 관계 진단: 질문에 답하면 감정 상태, 관계 안정성, 갈등 패턴을 바탕으로 관계 리포트를 보여줍니다.

준비 중:

- 함께하는 문답: 연인, 부부, 가족, 친구가 서로를 더 알아갈 수 있는 질문 콘텐츠입니다.
- 사주 콘텐츠: 생년월일시를 바탕으로 나의 기질과 흐름을 살펴보는 콘텐츠입니다.
- 미니게임: 가볍게 즐길 수 있는 밸런스게임과 답 맞히기 콘텐츠입니다.

## 구현된 기능

- 콘텐츠 홈 화면
- 우리 관계 진단
- 관계 유형 선택
- 질문 진행과 이전/다음 이동
- 결과 리포트 생성
- 결과 이미지 저장
- 결과 공유 링크 생성
- 서버 저장 및 조회
- 저장된 결과 다시 열기
- 기존 Relationship Analyzer 결과 데이터 호환

## 사용 기술

- React
- Vite
- JavaScript
- CSS
- Vercel Functions
- Supabase
- html2canvas
- Web Share API
- GitHub Pages

## 프로젝트 구조

```text
src/
├─ app/        # 앱 진입, 라우팅, 콘텐츠 카탈로그
├─ pages/      # 콘텐츠 홈 화면
├─ features/   # 실제 콘텐츠 기능
├─ shared/     # 공통 컴포넌트와 스타일
└─ main.jsx
```

현재 실제 기능은 `src/features/relationship`에 있고, 준비 중 콘텐츠는 콘텐츠 카탈로그를 통해 Coming Soon 화면으로 연결됩니다.

## 실행 방법

```bash
npm install
npm run dev
```

일반 빌드:

```bash
npm run build
npm run preview
```

GitHub Pages용 빌드:

```bash
npm run build:pages
```

## 배포 주소

- Vercel: https://eun-contents.vercel.app
- GitHub Pages: https://coffee-and.github.io/eun-contents/
- GitHub Repository: https://github.com/coffee-and/eun-contents

## 앞으로 추가할 콘텐츠

앞으로 `함께하는 문답`, `사주 콘텐츠`, `미니게임`을 순서대로 채워갈 예정입니다. 콘텐츠가 늘어나도 EUN CONTENTS 안에서 한 번에 고르고 사용할 수 있도록 정리해갈 계획입니다.
