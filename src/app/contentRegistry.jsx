import { lazy } from "react";

export const CONTENT_STATUS = {
  ACTIVE: "active",
  COMING_SOON: "coming-soon",
};

const RelationshipApp = lazy(() => import("../features/relationship/RelationshipApp.jsx"));
const TogetherQuestionsApp = lazy(() =>
  import("../features/together-questions/TogetherQuestionsApp.jsx")
);
const SajuApp = lazy(() => import("../features/saju/SajuApp.jsx"));
const MiniGamesApp = lazy(() => import("../features/mini-games/MiniGamesApp.jsx"));

export const CONTENT_REGISTRY = [
  {
    id: "relationship",
    route: "relationship",
    category: "RELATIONSHIP",
    title: "우리 관계 진단",
    description: "지금 우리 사이의 마음과 흐름을\n차분히 들여다보는 시간",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "관계 살펴보기 →",
    component: RelationshipApp,
    themeClass: "theme-relationship",
  },
  {
    id: "together-questions",
    route: "together-questions",
    category: "OUR STORIES",
    title: "함께하는 문답",
    description: "나와 소중한 사람의 생각과 추억을\n한 장씩 기록해요",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "문답 시작하기 →",
    component: TogetherQuestionsApp,
    themeClass: "theme-together-questions",
  },
  {
    id: "saju",
    route: "saju",
    category: "SAJU & INSIGHT",
    title: "사주·타로",
    description: "사주와 타로를 통해\n나의 기질과 지금의 흐름을 살펴봐요",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "사주·타로 보기 →",
    component: SajuApp,
    themeClass: "theme-saju",
  },
  {
    id: "mini-games",
    route: "mini-games",
    category: "PLAY & MOMENT",
    title: "미니 게임",
    description: "잠깐의 여유가 필요할 때\n마음을 환기하는 작은 놀이",
    status: CONTENT_STATUS.ACTIVE,
    actionLabel: "게임 둘러보기 →",
    component: MiniGamesApp,
    themeClass: "theme-mini-games",
  },
];

export function getContentByRoute(route) {
  return CONTENT_REGISTRY.find((content) => content.route === route) ?? null;
}

export function getContentById(id) {
  return CONTENT_REGISTRY.find((content) => content.id === id) ?? null;
}
