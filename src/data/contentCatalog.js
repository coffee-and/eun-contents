// 홈 화면에 표시되는 콘텐츠 카드 데이터를 관리합니다.
export const CONTENT_STATUS = {
  ACTIVE: "active",
  COMING_SOON: "coming-soon",
};

export const CONTENT_CATALOG = [
  {
    id: "relationship",
    route: "relationship",
    category: "RELATIONSHIP",
    title: "우리 관계 진단",
    description: "지금 우리 사이의 마음과 흐름을\n차분히 들여다보는 시간",
    imageSrc: "/images/content/relationship-cover.png",
    imageAlt: "분홍빛 풍경에서 손을 잡은 두 사람",
    layout: "feature",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "관계 들여다보기 →",
  },
  {
    id: "together-questions",
    route: "together-questions",
    category: "OUR STORIES",
    title: "함께하는 문답",
    description: "나와 소중한 사람의 생각과 추억을\n한 장씩 기록해요",
    imageSrc: "/images/content/together-cover.png",
    imageAlt: "나무 책상 위 노트와 가족 사진",
    layout: "portrait",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "문답 시작하기 →",
  },
  {
    id: "saju",
    route: "saju",
    category: "SAJU & INSIGHT",
    title: "나를 읽는 사주",
    description: "타고난 기질과 삶의 흐름 속에서\n나만의 이야기를 발견해요",
    imageSrc: "/images/content/saju-cover.png",
    imageAlt: "초록 잎 그림자 아래 놓인 사주 명식과 붓",
    layout: "quiet",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "곧 만나보세요",
  },
  {
    id: "mini-games",
    route: "mini-games",
    category: "PLAY & MOMENT",
    title: "가볍게 즐기는 게임",
    description: "잠깐의 여유가 필요할 때\n마음을 환기하는 작은 놀이",
    imageSrc: "/images/content/game-cover.png",
    imageAlt: "파란 하늘 아래 퍼즐 조각을 맞대는 두 손",
    layout: "wide",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "곧 만나보세요",
  },
];

export function getContentByRoute(route) {
  return CONTENT_CATALOG.find((content) => content.route === route) ?? null;
}
