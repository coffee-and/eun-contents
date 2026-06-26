// 초기 상태를 함수로 분리
export function createInitialState(planType = "FREE") {
  return {
    planType,
    currentIndex: 0,
    selectedOptionId: null,
    history: [],
    answers: [],
    totalScore: 0,
    totalRisk: 0,
    categoryScores: {
      emotion: 0,
      stability: 0,
      future: 0,
    },
    conflictRisk: 0,
    typeTags: {},
  };
}
