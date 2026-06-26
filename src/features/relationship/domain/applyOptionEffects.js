// 선택한 답변의 효과를 상태에 반영하는 함수
export function applyOptionEffects(state, question, option) {
  const originalEffects = option.effects ?? {};
  const isContextQuestion = question.category === "context";
  const effects = isContextQuestion ? {} : originalEffects;
  const nextTypeTags = { ...state.typeTags };

  if (effects.typeTag) {
    const inferredTypeWeight =
      effects.typeWeight ??
      (effects.conflictRisk >= 14 ? 3 : effects.conflictRisk >= 8 ? 2 : 1);

    nextTypeTags[effects.typeTag] =
      (nextTypeTags[effects.typeTag] ?? 0) + inferredTypeWeight;
  }

  return {
    ...state,
    answers: [
      ...state.answers,
      {
        questionId: question.id,
        category: question.category,
        question: question.prompt,
        selectedOptionId: option.id,
        selectedLabel: option.label,
        effects,
      },
    ],
    totalScore: state.totalScore + (effects.totalScore ?? 0),
    totalRisk: state.totalRisk + (effects.totalRisk ?? 0),
    conflictRisk: state.conflictRisk + (effects.conflictRisk ?? 0),
    categoryScores: {
      ...state.categoryScores,
      emotion: state.categoryScores.emotion + (effects.categoryScore?.emotion ?? 0),
      stability: state.categoryScores.stability + (effects.categoryScore?.stability ?? 0),
      future: state.categoryScores.future + (effects.categoryScore?.future ?? 0),
    },
    typeTags: nextTypeTags,
    currentIndex: state.currentIndex + 1,
    selectedOptionId: null,
  };
}
