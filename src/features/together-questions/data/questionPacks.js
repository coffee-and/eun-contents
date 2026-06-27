export const RELATIONSHIP_TYPES = [
  { id: "couple", title: "연인", description: "서로의 마음과 관계를 더 깊이 알아보는 질문", icon: "♡", accent: "rose" },
  { id: "married", title: "부부", description: "함께 살아가는 방식과 미래를 나누는 질문", icon: "⌂", accent: "lavender" },
  { id: "family", title: "가족", description: "익숙해서 놓쳤던 마음을 다시 알아보는 질문", icon: "☀", accent: "butter" },
  { id: "friends", title: "친구", description: "추억과 취향, 서로의 진짜 모습을 알아보는 질문", icon: "✦", accent: "blue" },
];

export const QUESTION_MOODS = [
  { id: "light", title: "가볍게 알아가기", description: "취향과 일상에 관한 편안한 질문", icon: "☁" },
  { id: "honest", title: "조금 더 솔직하게", description: "감정과 가치관에 관한 진솔한 질문", icon: "◇" },
  { id: "memory-future", title: "추억과 미래", description: "함께했던 순간과 앞으로의 바람을 기록하는 질문", icon: "○" },
];

const COMMON_QUESTIONS = {
  light: [
    ["light-01", "취향과 일상", "요즘 가장 좋아하는 음식은 무엇인가요?"],
    ["light-02", "취향과 일상", "하루를 완전히 자유롭게 보낼 수 있다면 무엇을 하고 싶나요?"],
    ["light-03", "나를 소개해요", "나를 가장 잘 표현하는 단어 세 가지는 무엇인가요?"],
    ["light-04", "나를 소개해요", "어린 시절 가장 오래 품었던 꿈은 무엇인가요?"],
    ["light-05", "취향과 일상", "가장 편안함을 느끼는 장소는 어디인가요?"],
    ["light-06", "취향과 일상", "요즘 새롭게 시작해보고 싶은 취미가 있나요?"],
    ["light-07", "서로를 알아가요", "상대와 닮았다고 느끼는 부분은 무엇인가요?"],
    ["light-08", "서로를 알아가요", "상대에게 추천하고 싶은 나만의 작은 행복은 무엇인가요?"],
  ],
  honest: [
    ["honest-01", "가치관과 삶", "삶에서 가장 중요하게 생각하는 것은 무엇인가요?"],
    ["honest-02", "가치관과 삶", "오랫동안 마음에 품고 있는 좌우명이나 문장이 있나요?"],
    ["honest-03", "감정과 소통", "힘들 때 혼자 있고 싶은가요, 곁에 있어주길 바라나요?"],
    ["honest-04", "감정과 소통", "가장 사랑받거나 존중받고 있다고 느끼는 행동은 무엇인가요?"],
    ["honest-05", "감정과 소통", "상대가 알아줬으면 하는 요즘의 마음이 있나요?"],
    ["honest-06", "감정과 소통", "갈등이 생겼을 때 가장 먼저 필요한 것은 무엇인가요?"],
    ["honest-07", "서로를 알아가요", "상대에게 가장 고마웠던 순간은 언제인가요?"],
    ["honest-08", "서로를 알아가요", "서로에게 더 자주 표현했으면 하는 말은 무엇인가요?"],
  ],
  "memory-future": [
    ["future-01", "우리의 추억", "처음 만났을 때 상대의 첫인상은 어땠나요?"],
    ["future-02", "우리의 추억", "함께한 날 중 다시 돌아가고 싶은 하루는 언제인가요?"],
    ["future-03", "우리의 추억", "둘이 가장 많이 웃었던 기억은 무엇인가요?"],
    ["future-04", "우리의 추억", "아직 제대로 말하지 못한 고마운 일이 있나요?"],
    ["future-05", "꿈과 미래", "앞으로 꼭 함께 가보고 싶은 곳은 어디인가요?"],
    ["future-06", "꿈과 미래", "1년 뒤 함께 이루고 싶은 작은 목표는 무엇인가요?"],
    ["future-07", "꿈과 미래", "오래도록 지키고 싶은 우리만의 약속은 무엇인가요?"],
    ["future-08", "꿈과 미래", "나이가 들어도 계속 함께하고 싶은 일은 무엇인가요?"],
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
    light: [["family-light", "가족의 일상", "우리 가족을 떠올리면 가장 먼저 생각나는 음식은 무엇인가요?"]],
    honest: [["family-honest", "가족의 마음", "가족에게 말하지 못했지만 고마웠던 일이 있나요?"]],
    "memory-future": [["family-future", "가족의 미래", "앞으로 가족과 새로 만들고 싶은 전통이 있나요?"]],
  },
  friends: {
    light: [["friends-light", "친구의 일상", "우리가 함께했을 때 가장 웃겼던 순간은 언제인가요?"]],
    honest: [["friends-honest", "친구의 마음", "친구로서 상대가 잘하고 있다고 느끼는 점은 무엇인가요?"]],
    "memory-future": [["friends-future", "친구의 미래", "언젠가 꼭 함께 해보고 싶은 일은 무엇인가요?"]],
  },
};

function toQuestion([id, category, prompt]) {
  return { id, category, prompt, helperText: "서로의 답을 판단하지 않고 천천히 읽어보세요." };
}

export function getQuestions(type, mood) {
  const extras = TYPE_EXTRAS[type]?.[mood] ?? [];
  return [...extras, ...(COMMON_QUESTIONS[mood] ?? [])].map(toQuestion);
}
