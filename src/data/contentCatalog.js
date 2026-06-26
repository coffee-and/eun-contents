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
    description:
      "현재 관계의 감정 상태와 안정성, 갈등 패턴을 차분하게 살펴봐요.",
    icon: "♡",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "진단 시작하기",
  }, 
  {
    id: "couple-questions",
    route: "couple-questions",
    category: "둘이 함께",
    title: "커플 문답",
    description: "서로의 생각과 취향을 자연스럽게 알아가는 질문을 나눠요.",
    icon: "💬",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
  {
    id: "family-questions",
    route: "family-questions",
    category: "가족 기록",
    title: "가족 문답",
    description: "엄마와 아빠, 가족의 오래된 이야기와 추억을 기록해요.",
    icon: "⌂",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
  {
    id: "saju",
    route: "saju",
    category: "나를 알아보기",
    title: "사주 조회",
    description: "생년월일시를 바탕으로 나의 기질과 흐름을 살펴봐요.",
    icon: "✦",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
  {
    id: "mini-games",
    route: "mini-games",
    category: "가볍게 즐기기",
    title: "미니게임",
    description: "밸런스게임과 답 맞히기처럼 둘이 함께 즐기는 작은 게임이에요.",
    icon: "◈",
    status: CONTENT_STATUS.COMING_SOON,
    actionLabel: "준비 중",
  },
];

export function getContentByRoute(route) {
  return CONTENT_CATALOG.find((content) => content.route === route) ?? null;
}
