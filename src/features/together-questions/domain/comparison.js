// 두 사람이 제출한 답변을 질문별 결과와 간단한 대화 주제로 정리합니다.
import { EMPTY_ANSWER_TEXT } from "../constants/sessionFlow.js";

function normalizeAnswer(value) {
  return String(value ?? "").trim();
}

function tokenize(value) {
  return normalizeAnswer(value)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length >= 2);
}

export function buildQuestionComparisons(questions, answers = []) {
  const answerMap = new Map(
    answers.map((answer) => [`${answer.questionId}:${answer.role}`, answer.answer])
  );

  return questions.map((question) => {
    const creatorAnswer = normalizeAnswer(answerMap.get(`${question.id}:creator`));
    const inviteeAnswer = normalizeAnswer(answerMap.get(`${question.id}:invitee`));
    const creatorWords = new Set(tokenize(creatorAnswer));
    const inviteeWords = new Set(tokenize(inviteeAnswer));
    const sharedWords = [...creatorWords].filter((word) => inviteeWords.has(word));

    return {
      question,
      creatorAnswer: creatorAnswer || EMPTY_ANSWER_TEXT,
      inviteeAnswer: inviteeAnswer || EMPTY_ANSWER_TEXT,
      sharedWords: sharedWords.slice(0, 6),
      isBothEmpty: !creatorAnswer && !inviteeAnswer,
    };
  });
}

export function summarizeComparison(comparisons) {
  const shared = comparisons
    .filter((item) => item.sharedWords.length > 0)
    .slice(0, 3)
    .map((item) => `${item.question.category}: ${item.sharedWords.join(", ")}`);

  const different = comparisons
    .filter((item) => !item.isBothEmpty && item.sharedWords.length === 0)
    .slice(0, 3)
    .map((item) => item.question.prompt);

  const followUps = comparisons
    .filter((item) => !item.isBothEmpty)
    .slice(-3)
    .map((item) => `${item.question.prompt}에 대해 조금 더 이야기해보기`);

  return {
    shared: shared.length ? shared : ["서로의 답변을 읽으며 겹치는 표현과 마음을 직접 찾아보세요."],
    different: different.length ? different : ["큰 차이보다 비슷한 방향이 더 많이 보였어요."],
    followUps: followUps.length ? followUps : ["오늘 답변 중 오래 기억하고 싶은 문장을 골라 이야기해보세요."],
  };
}
