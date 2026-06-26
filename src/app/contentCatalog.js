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
    description:
      "현재 관계의 감정 상태와 안정성, 갈등 패턴을 차분하게 살펴봐요.",
    icon: "♡",
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
    description:
      "연인, 부부, 가족, 친구와 서로를 조금 더 알아가는 질문을 나눠요.",
    icon: "💬",
    theme: "couple",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
  {
    id: "saju",
    route: "saju",
    category: "나를 알아보기",
    title: "사주 콘텐츠",
    subtitle: "Saju Contents",
    description: "생년월일시를 바탕으로 나의 기질과 흐름을 살펴봐요.",
    icon: "✦",
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
    description: "밸런스게임과 답 맞히기처럼 둘이 함께 즐기는 작은 게임이에요.",
    icon: "◈",
    theme: "game",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
];

export function getContentByRoute(route) {
  return CONTENT_CATALOG.find((content) => content.route === route) ?? null;
}
