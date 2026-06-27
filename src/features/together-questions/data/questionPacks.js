export const RELATIONSHIP_TYPES = [
  {
    id: "couple",
    title: "연인",
    description: "서로의 마음과 관계의 방향을 차분히 확인해요.",
  },
  {
    id: "married",
    title: "부부",
    description: "함께 사는 방식과 앞으로의 약속을 나눠요.",
  },
  {
    id: "family",
    title: "가족",
    description: "가까워서 놓쳤던 마음을 다시 들여다봐요.",
  },
  {
    id: "friends",
    title: "친구",
    description: "추억, 취향, 서로에게 바라는 점을 가볍게 나눠요.",
  },
];

export const QUESTION_PACKS = [
  {
    id: "light",
    title: "가볍게 알아가기",
    description: "취향과 일상 중심의 부담 없는 질문",
  },
  {
    id: "honest",
    title: "조금 더 솔직하게",
    description: "감정, 가치관, 소통 방식을 묻는 질문",
  },
  {
    id: "memory-future",
    title: "추억과 미래",
    description: "함께한 시간과 앞으로의 바람을 기록하는 질문",
  },
];

const COMMON_QUESTIONS = {
  light: [
    ["light-01", "취향과 일상", "요즘 가장 좋아하는 소식이나 작은 즐거움은 무엇인가요?"],
    ["light-02", "취향과 일상", "완전히 자유로운 하루가 생긴다면 무엇을 하고 싶나요?"],
    ["light-03", "서로를 알아가기", "나를 가장 잘 표현하는 단어 세 가지는 무엇인가요?"],
    ["light-04", "서로를 알아가기", "어릴 때 오래 기억에 남은 꿈이나 장면은 무엇인가요?"],
    ["light-05", "취향과 일상", "가장 편안함을 느끼는 장소는 어디인가요?"],
    ["light-06", "취향과 일상", "요즘 새롭게 시작해보고 싶은 취미가 있나요?"],
    ["light-07", "서로를 알아가기", "상대에게 부탁하고 싶은 작고 현실적인 일은 무엇인가요?"],
    ["light-08", "서로를 알아가기", "상대에게 추천하고 싶은 작은 행복은 무엇인가요?"],
  ],
  honest: [
    ["honest-01", "가치관", "관계에서 가장 중요하게 생각하는 것은 무엇인가요?"],
    ["honest-02", "가치관", "오랫동안 마음에 남아 있는 좌우명이나 문장이 있나요?"],
    ["honest-03", "감정과 소통", "힘든 날 혼자 있고 싶을 때, 상대가 어떻게 해주면 좋나요?"],
    ["honest-04", "감정과 소통", "가장 존중받는다고 느끼는 행동은 무엇인가요?"],
    ["honest-05", "감정과 소통", "상대가 알아주면 좋겠는 요즘 마음이 있나요?"],
    ["honest-06", "감정과 소통", "갈등이 생겼을 때 가장 먼저 필요한 것은 무엇인가요?"],
    ["honest-07", "서로를 알아가기", "상대에게 가장 고마웠던 순간은 언제인가요?"],
    ["honest-08", "서로를 알아가기", "서로에게 더 자주 표현했으면 하는 말은 무엇인가요?"],
  ],
  "memory-future": [
    ["future-01", "우리의 추억", "처음 만났을 때 상대의 첫인상은 어땠나요?"],
    ["future-02", "우리의 추억", "함께한 시간 중 다시 떠올리고 싶은 하루는 언제인가요?"],
    ["future-03", "우리의 추억", "둘이 가장 많이 웃었던 기억은 무엇인가요?"],
    ["future-04", "우리의 추억", "아직 제대로 말하지 못한 고마운 일이 있나요?"],
    ["future-05", "꿈과 미래", "앞으로 꼭 함께 가보고 싶은 곳은 어디인가요?"],
    ["future-06", "꿈과 미래", "1년 뒤 함께 이루고 싶은 작은 목표는 무엇인가요?"],
    ["future-07", "꿈과 미래", "오래도록 지키고 싶은 우리만의 약속은 무엇인가요?"],
    ["future-08", "꿈과 미래", "시간이 흘러도 계속 함께하고 싶은 일은 무엇인가요?"],
  ],
};

const TYPE_EXTRAS = {
  couple: {
    light: [["couple-light", "연인의 일상", "우리에게 가장 잘 어울리는 데이트는 어떤 모습인가요?"]],
    honest: [["couple-honest", "사랑의 방식", "사랑받고 있다고 가장 크게 느끼는 순간은 언제인가요?"]],
    "memory-future": [["couple-future", "우리의 미래", "앞으로 함께 만들고 싶은 평범한 하루는 어떤 모습인가요?"]],
  },
  married: {
    light: [["married-light", "부부의 일상", "집에서 함께 보내는 시간 중 가장 좋아하는 순간은 언제인가요?"]],
    honest: [["married-honest", "생활과 마음", "생활 속에서 서로 더 나누고 싶은 역할은 무엇인가요?"]],
    "memory-future": [["married-future", "우리의 미래", "앞으로 함께 만들고 싶은 집의 분위기는 어떤 모습인가요?"]],
  },
  family: {
    light: [["family-light", "가족의 일상", "우리 가족을 떠올리면 가장 먼저 생각나는 장면은 무엇인가요?"]],
    honest: [["family-honest", "가족의 마음", "가족에게 말하지 못했지만 고마웠던 일이 있나요?"]],
    "memory-future": [["family-future", "가족의 미래", "앞으로 가족과 새로 만들고 싶은 전통이 있나요?"]],
  },
  friends: {
    light: [["friends-light", "친구의 일상", "우리가 함께 있을 때 가장 즐거운 시간은 언제인가요?"]],
    honest: [["friends-honest", "친구의 마음", "친구로서 상대가 더 편하게 느꼈으면 하는 점은 무엇인가요?"]],
    "memory-future": [["friends-future", "친구의 미래", "언젠가 꼭 함께 해보고 싶은 일은 무엇인가요?"]],
  },
};

function toQuestion([id, category, prompt]) {
  return {
    id,
    category,
    prompt,
    helperText: "정답은 없어요. 지금 떠오르는 마음을 편하게 적어주세요.",
  };
}

export function getQuestions(relationshipType, questionPackId) {
  const extras = TYPE_EXTRAS[relationshipType]?.[questionPackId] ?? [];
  return [...extras, ...(COMMON_QUESTIONS[questionPackId] ?? [])].map(toQuestion);
}

export function getRelationshipType(id) {
  return RELATIONSHIP_TYPES.find((item) => item.id === id) ?? null;
}

export function getQuestionPack(id) {
  return QUESTION_PACKS.find((item) => item.id === id) ?? null;
}
