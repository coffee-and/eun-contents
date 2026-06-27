export const RELATIONSHIP_TYPES = [
  { id: "couple", title: "연인", description: "서로의 마음과 관계를 더 깊이 알아보는 문답", icon: "♡", accent: "red" },
  { id: "married", title: "부부", description: "함께 살아가는 방식과 미래를 기록하는 문답", icon: "⌂", accent: "yellow" },
  { id: "family", title: "가족", description: "익숙해서 놓쳤던 마음을 다시 알아보는 문답", icon: "○", accent: "green" },
  { id: "friends", title: "친구", description: "추억과 취향, 서로의 진짜 모습을 남기는 문답", icon: "✦", accent: "blue" },
];

export const QUESTION_MOODS = [
  { id: "profile", title: "우리를 소개해요", description: "이름, 취향, 좌우명처럼 서로를 소개하는 질문", icon: "01" },
  { id: "daily", title: "취향과 일상", description: "평범한 하루와 좋아하는 것에 관한 질문", icon: "02" },
  { id: "values", title: "가치관과 삶", description: "삶에서 중요하게 생각하는 것을 나누는 질문", icon: "03" },
  { id: "memory", title: "우리의 추억", description: "함께한 순간과 오래 남은 기억에 관한 질문", icon: "04" },
  { id: "heart", title: "감정과 소통", description: "고마움, 위로, 갈등을 조금 더 솔직하게 나누는 질문", icon: "05" },
  { id: "future", title: "꿈과 미래", description: "앞으로 함께 만들고 싶은 시간에 관한 질문", icon: "06" },
];

const createQuestion = (id, category, prompt, helperText = "") => ({ id, category, prompt, helperText });

const COMMON_QUESTIONS = {
  profile: [
    createQuestion("profile-01", "profile", "나를 가장 잘 표현하는 단어 세 가지는 무엇인가요?"),
    createQuestion("profile-02", "profile", "지금 나의 좌우명은 무엇인가요?"),
    createQuestion("profile-03", "profile", "어린 시절 가장 오래 품었던 꿈은 무엇이었나요?"),
    createQuestion("profile-04", "profile", "다른 사람이 나를 어떤 사람으로 기억해주면 좋겠나요?"),
    createQuestion("profile-05", "profile", "요즘 나를 가장 기분 좋게 만드는 작은 것은 무엇인가요?"),
    createQuestion("profile-06", "profile", "내가 가장 편안함을 느끼는 장소는 어디인가요?"),
  ],
  daily: [
    createQuestion("daily-01", "daily", "하루를 완전히 자유롭게 보낼 수 있다면 무엇을 하고 싶나요?"),
    createQuestion("daily-02", "daily", "요즘 가장 자주 생각나는 음식은 무엇인가요?"),
    createQuestion("daily-03", "daily", "최근에 새롭게 해보고 싶은 취미가 있나요?"),
    createQuestion("daily-04", "daily", "지친 하루 끝에 가장 듣고 싶은 말은 무엇인가요?"),
    createQuestion("daily-05", "daily", "혼자만의 시간이 생기면 가장 먼저 하는 일은 무엇인가요?"),
    createQuestion("daily-06", "daily", "평범한 일상에서 가장 좋아하는 순간은 언제인가요?"),
  ],
  values: [
    createQuestion("values-01", "values", "삶에서 가장 중요하게 생각하는 것은 무엇인가요?"),
    createQuestion("values-02", "values", "행복한 삶을 위해 꼭 필요하다고 생각하는 것은 무엇인가요?"),
    createQuestion("values-03", "values", "쉽게 포기할 수 없는 나만의 원칙이 있나요?"),
    createQuestion("values-04", "values", "돈과 시간 중 하나를 더 자유롭게 가질 수 있다면 무엇을 고르겠나요?"),
    createQuestion("values-05", "values", "내가 생각하는 좋은 관계의 기준은 무엇인가요?"),
    createQuestion("values-06", "values", "지금의 나를 가장 많이 성장시킨 경험은 무엇인가요?"),
  ],
  memory: [
    createQuestion("memory-01", "memory", "우리의 첫인상 중 아직도 기억나는 장면은 무엇인가요?"),
    createQuestion("memory-02", "memory", "함께한 날 중 다시 하루를 보낼 수 있다면 언제인가요?"),
    createQuestion("memory-03", "memory", "서로에게 가장 고마웠던 순간은 언제인가요?"),
    createQuestion("memory-04", "memory", "함께 가장 많이 웃었던 기억은 무엇인가요?"),
    createQuestion("memory-05", "memory", "사진으로 꼭 다시 남기고 싶은 순간이 있나요?"),
    createQuestion("memory-06", "memory", "아직 제대로 말하지 못했던 고마운 일이 있나요?"),
  ],
  heart: [
    createQuestion("heart-01", "heart", "힘들 때 상대가 어떻게 곁에 있어주면 가장 도움이 되나요?"),
    createQuestion("heart-02", "heart", "사랑이나 우정을 가장 크게 느끼는 행동은 무엇인가요?"),
    createQuestion("heart-03", "heart", "우리가 대화할 때 더 편해졌으면 하는 부분은 무엇인가요?"),
    createQuestion("heart-04", "heart", "내가 알아줬으면 하는 요즘의 마음이 있나요?"),
    createQuestion("heart-05", "heart", "상대가 무심코 지나쳤을 수 있는 나의 노력이 있나요?"),
    createQuestion("heart-06", "heart", "서로에게 더 자주 표현했으면 하는 말은 무엇인가요?"),
  ],
  future: [
    createQuestion("future-01", "future", "앞으로 꼭 함께 가보고 싶은 곳은 어디인가요?"),
    createQuestion("future-02", "future", "1년 뒤 우리의 일상에서 달라졌으면 하는 점은 무엇인가요?"),
    createQuestion("future-03", "future", "앞으로 함께 만들고 싶은 작은 습관이 있나요?"),
    createQuestion("future-04", "future", "오래도록 지키고 싶은 우리만의 약속은 무엇인가요?"),
    createQuestion("future-05", "future", "나이가 들어도 함께 계속하고 싶은 일은 무엇인가요?"),
    createQuestion("future-06", "future", "상대의 꿈을 위해 도와주고 싶은 일이 있나요?"),
  ],
};

const TYPE_EXTRAS = {
  couple: {
    profile: [createQuestion("couple-profile", "profile", "서로를 부르는 가장 좋아하는 애칭은 무엇인가요?")],
    memory: [createQuestion("couple-memory", "memory", "우리의 첫 데이트에서 가장 기억나는 것은 무엇인가요?")],
    future: [createQuestion("couple-future", "future", "앞으로 우리 관계에서 꼭 지키고 싶은 약속은 무엇인가요?")],
  },
  married: {
    daily: [createQuestion("married-daily", "daily", "집에서 함께 보내는 시간 중 가장 좋아하는 순간은 언제인가요?")],
    heart: [createQuestion("married-heart", "heart", "생활 속에서 내가 조금 더 나눠 맡았으면 하는 일은 무엇인가요?")],
    future: [createQuestion("married-future", "future", "앞으로 함께 만들고 싶은 우리 집의 분위기는 어떤 모습인가요?")],
  },
  family: {
    profile: [createQuestion("family-profile", "profile", "우리 가족을 떠올리면 가장 먼저 생각나는 단어는 무엇인가요?")],
    memory: [createQuestion("family-memory", "memory", "가족과 함께했던 가장 따뜻한 기억은 무엇인가요?")],
    future: [createQuestion("family-future", "future", "앞으로 가족과 새로 만들고 싶은 전통이 있나요?")],
  },
  friends: {
    profile: [createQuestion("friends-profile", "profile", "우리가 친해진 계기를 한 문장으로 표현한다면 무엇인가요?")],
    memory: [createQuestion("friends-memory", "memory", "우리가 가장 웃겼던 순간은 언제였나요?")],
    future: [createQuestion("friends-future", "future", "나중에도 꼭 같이 해보고 싶은 일이 있나요?")],
  },
};

export function getQuestions(type, mood) {
  return [...(TYPE_EXTRAS[type]?.[mood] ?? []), ...(COMMON_QUESTIONS[mood] ?? [])];
}
