// Together Questions 관계별 질문 데이터와 질문팩 정보를 관리합니다.
import { partnerQuestions } from "./partnerQuestions.js";
import { parentQuestions } from "./parentQuestions.js";
import { childQuestions } from "./childQuestions.js";
import { friendQuestions } from "./friendQuestions.js";

export const QUESTION_PACK_IDS = {
  BASIC: "basic",
  PREMIUM: "premium",
};

export const QUESTION_PACKS = [
  {
    id: QUESTION_PACK_IDS.BASIC,
    title: "기본 문답",
    description: "나와 관계를 기록하는 무료 30문항",
    questionCount: 30,
    isAvailable: true,
  },
  {
    id: QUESTION_PACK_IDS.PREMIUM,
    title: "심화 문답",
    description: "더 깊이 적어보는 20문항, 프리미엄 예정",
    questionCount: 20,
    isAvailable: false,
  },
];

export const RELATIONSHIP_TYPES = [
  {
    id: "partner",
    title: "커플/부부",
    description: "서로의 마음과 함께해 온 시간, 앞으로의 이야기를 기록해요.",
    writingGuide: "상대와 함께한 기억과 지금 내 마음을 기준으로 적는 문답이에요.",
    questionSet: partnerQuestions,
  },
  {
    id: "parent",
    title: "부모",
    description: "내가 살아온 이야기와 자녀에게 전하고 싶은 마음을 기록해요.",
    writingGuide: "내가 살아온 이야기와 자녀와의 기억을 적는 문답이에요.",
    questionSet: parentQuestions,
  },
  {
    id: "child",
    title: "자녀",
    description: "내가 살아온 이야기와 부모님께 전하고 싶은 마음을 기록해요.",
    writingGuide: "내가 살아온 이야기와 부모님과의 기억을 적는 문답이에요.",
    questionSet: childQuestions,
  },
  {
    id: "friends",
    title: "친구",
    description: "함께한 추억과 서로에게 전하고 싶은 마음을 기록해요.",
    writingGuide: "친구와 함께한 기억과 지금 전하고 싶은 마음을 적는 문답이에요.",
    questionSet: friendQuestions,
  },
];

function toQuestion([id, category, prompt], index) {
  return {
    id,
    category,
    prompt,
    order: index + 1,
    helperText: "상대를 평가하기보다, 지금 내 마음과 기억을 기준으로 편하게 적어주세요.",
  };
}

export function getRelationshipType(id) {
  return RELATIONSHIP_TYPES.find((item) => item.id === id) ?? null;
}

export function getQuestionPack(id) {
  return QUESTION_PACKS.find((item) => item.id === id) ?? QUESTION_PACKS[0];
}

export function getQuestions(relationshipType, questionPackId = QUESTION_PACK_IDS.BASIC) {
  const relationship = getRelationshipType(relationshipType) ?? RELATIONSHIP_TYPES[0];
  const pack = getQuestionPack(questionPackId);
  const rawQuestions = relationship.questionSet[pack.id] ?? relationship.questionSet.basic;
  return rawQuestions.map(toQuestion);
}
