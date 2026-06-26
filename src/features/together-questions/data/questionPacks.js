export const RELATIONSHIP_TYPES = [
  {
    id: "couple",
    title: "연인",
    description: "서로의 마음과 관계를 더 깊이 알아보는 질문",
    icon: "♡",
    accent: "rose",
  },
  {
    id: "married",
    title: "부부",
    description: "함께 살아가는 방식과 미래를 나누는 질문",
    icon: "⌂",
    accent: "lavender",
  },
  {
    id: "family",
    title: "가족",
    description: "익숙해서 놓쳤던 마음을 다시 알아보는 질문",
    icon: "☀",
    accent: "butter",
  },
  {
    id: "friends",
    title: "친구",
    description: "추억과 취향, 서로의 진짜 모습을 알아보는 질문",
    icon: "✦",
    accent: "blue",
  },
];

export const QUESTION_MOODS = [
  {
    id: "light",
    title: "가볍게 알아가기",
    description: "취향과 일상에 관한 편안한 질문",
    icon: "☁",
  },
  {
    id: "honest",
    title: "조금 더 솔직하게",
    description: "감정과 관계에 관한 진솔한 질문",
    icon: "◇",
  },
  {
    id: "memory-future",
    title: "추억과 미래",
    description: "함께했던 순간과 앞으로의 바람을 나누는 질문",
    icon: "○",
  },
];

const COMMON_QUESTIONS = {
  light: [
    "요즘 가장 자주 생각나는 음식은 뭐야?",
    "하루를 완전히 자유롭게 보낼 수 있다면 뭘 하고 싶어?",
    "최근에 사소하지만 기분 좋았던 일은 뭐였어?",
    "나와 함께 다시 가보고 싶은 장소가 있어?",
    "요즘 새롭게 해보고 싶은 취미가 있다면 뭐야?",
    "서로 닮았다고 느끼는 부분은 뭐야?",
  ],
  honest: [
    "요즘 나에게 가장 고마웠던 순간은 언제였어?",
    "내가 알아줬으면 하는 요즘의 마음이 있어?",
    "힘들 때 내가 어떻게 곁에 있어주면 가장 도움이 돼?",
    "우리가 대화할 때 더 편해졌으면 하는 부분은 뭐야?",
    "내가 무심코 지나쳤을 수 있는 네 노력이 있을까?",
    "서로에게 더 자주 표현했으면 하는 말은 뭐야?",
  ],
  "memory-future": [
    "우리의 첫인상 중 아직도 기억나는 장면은 뭐야?",
    "함께했던 순간 중 다시 하루를 보낼 수 있다면 언제야?",
    "앞으로 꼭 같이 해보고 싶은 작은 일은 뭐야?",
    "1년 뒤 우리의 일상에서 지금과 달라졌으면 하는 점은 뭐야?",
    "오래 기억하고 싶은 우리만의 습관이 있어?",
    "다음 계절에 함께 만들고 싶은 추억은 뭐야?",
  ],
};

const TYPE_EXTRAS = {
  couple: {
    light: ["데이트할 때 서로 꼭 하나씩 고른다면 무엇을 고르고 싶어?"],
    honest: ["사랑받고 있다고 가장 크게 느끼는 행동은 뭐야?"],
    "memory-future": ["앞으로 우리 관계에서 꼭 지키고 싶은 약속은 뭐야?"],
  },
  married: {
    light: ["집에서 함께 보내는 시간 중 가장 좋아하는 순간은 언제야?"],
    honest: ["생활 속에서 내가 조금 더 나눠 맡았으면 하는 일은 뭐야?"],
    "memory-future": ["앞으로 함께 만들고 싶은 우리 집의 분위기는 어떤 모습이야?"],
  },
  family: {
    light: ["우리 가족을 떠올리면 가장 먼저 생각나는 음식은 뭐야?"],
    honest: ["가족에게 말하지 못했지만 고마웠던 일이 있어?"],
    "memory-future": ["앞으로 가족과 함께 새로 만들고 싶은 전통이 있어?"],
  },
  friends: {
    light: ["우리가 가장 웃겼던 순간은 언제였어?"],
    honest: ["친구로서 내가 잘하고 있다고 느끼는 점은 뭐야?"],
    "memory-future": ["나중에도 꼭 같이 해보고 싶은 일이 있어?"],
  },
};

export function getQuestions(type, mood) {
  return [...(TYPE_EXTRAS[type]?.[mood] ?? []), ...(COMMON_QUESTIONS[mood] ?? [])];
}
