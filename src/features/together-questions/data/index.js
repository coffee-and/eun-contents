// Together Questions 관계별 질문 데이터와 질문팩 정보를 관리합니다.
import { coupleQuestions } from "./coupleQuestions.js";
import { marriedQuestions } from "./marriedQuestions.js";
import { familyParentsQuestions } from "./familyParentsQuestions.js";
import { familyChildrenQuestions } from "./familyChildrenQuestions.js";
import { familySiblingQuestions } from "./familySiblingQuestions.js";
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
    id: "couple",
    title: "연인",
    description: "내가 연인에게 바라는 점과 고마운 마음을 적어요.",
    questionSet: coupleQuestions,
  },
  {
    id: "married",
    title: "부부",
    description: "내가 배우자와 함께 지키고 싶은 생활과 마음을 정리해요.",
    questionSet: marriedQuestions,
  },
  {
    id: "family-parents",
    title: "부모님",
    description: "나와 내 자녀의 기억, 전하고 싶은 마음을 적어요.",
    questionSet: familyParentsQuestions,
  },
  {
    id: "family-children",
    title: "자녀",
    description: "나와 내 부모님의 기억, 전하고 싶은 마음을 적어요.",
    questionSet: familyChildrenQuestions,
  },
  {
    id: "family-siblings",
    title: "형제자매",
    description: "내가 형제자매에게 느끼는 기억과 마음을 정리해요.",
    questionSet: familySiblingQuestions,
  },
  {
    id: "friends",
    title: "친구",
    description: "내가 친구에게 고마웠던 순간과 앞으로 함께하고 싶은 일을 나눠요.",
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
  const normalizedId = normalizeRelationshipTypeId(id);
  return RELATIONSHIP_TYPES.find((item) => item.id === normalizedId) ?? null;
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

export function normalizeRelationshipTypeId(id) {
  const aliases = {
    parents: "family-parents",
    familyParents: "family-parents",
    children: "family-children",
    familyChildren: "family-children",
  };

  return aliases[id] ?? id;
}
