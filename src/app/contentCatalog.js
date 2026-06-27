export const CONTENT_STATUS = {
  ACTIVE: "active",
  COMING_SOON: "coming-soon",
};

export const CONTENT_CATALOG = [
  {
    id: "relationship",
    route: "relationship",
    category: "관계 진단",
    title: "우리 관계 진단",
    subtitle: "Relationship Analyzer",
    description: "현재 관계의 감정 상태, 안정감, 갈등 패턴을 차분하게 들여다봐요.",
    iconSrc: "/icons/content/relationship-hearts.png",
    iconAlt: "겹친 두 개의 하트",
    theme: "relationship",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "진단 시작하기",
  },
  {
    id: "together-questions",
    route: "together-questions",
    category: "함께하는 시간",
    title: "함께하는 문답",
    subtitle: "Questions Together",
    description: "내 답변을 먼저 남기고, 초대 링크로 상대방과 같은 질문에 답해요.",
    iconSrc: "/icons/content/together-chat.png",
    iconAlt: "겹친 두 개의 말풍선",
    theme: "couple",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "문답 시작하기",
  },
  {
    id: "saju",
    route: "saju",
    category: "나를 알아보기",
    title: "사주 콘텐츠",
    subtitle: "Saju Contents",
    description: "생년월일시를 바탕으로 나의 기질과 흐름을 가볍게 살펴봐요.",
    iconSrc: "/icons/content/saju-yinyang.png",
    iconAlt: "초록색 태극 상징",
    theme: "saju",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
  {
    id: "mini-games",
    route: "mini-games",
    category: "가볍게 즐기기",
    title: "미니게임",
    subtitle: "Mini Games",
    description: "밸런스 게임과 짝 맞히기처럼 둘이 함께 즐기는 작은 게임이에요.",
    iconSrc: "/icons/content/mini-puzzle.png",
    iconAlt: "파란색 퍼즐 조각",
    theme: "game",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
];

export function getContentByRoute(route) {
  return CONTENT_CATALOG.find((content) => content.route === route) ?? null;
}
