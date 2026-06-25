import {
  categoryReportRules,
  relationshipLevelRules,
  conflictRiskRules,
  conflictTypeDescriptions,
} from "../data/reportRules.js";
import { getQuestionsByMode } from "../data/questions.js";
import { RELATIONSHIP_MODE, TYPE_LABELS } from "../data/config.js";

const SCORE_CATEGORIES = ["emotion", "stability", "future"];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeScore(value, min, max) {
  if (max === min) return 50;
  return Math.round(clamp(((value - min) / (max - min)) * 100, 0, 100));
}

function pickRule(value, rules) {
  return rules.find((rule) => value >= rule.min);
}

function getScoreRanges(relationshipMode) {
  const activeQuestions = getQuestionsByMode(relationshipMode).filter(
    (question) => question.category !== "context"
  );
  const categoryRanges = Object.fromEntries(
    SCORE_CATEGORIES.map((category) => [category, { min: 0, max: 0 }])
  );
  let finalMin = 0;
  let finalMax = 0;
  let conflictMax = 0;

  activeQuestions.forEach((question) => {
    const finalValues = question.options.map((option) => {
      const effects = option.effects ?? {};
      return (effects.totalScore ?? 0) - (effects.totalRisk ?? 0);
    });

    finalMin += Math.min(...finalValues);
    finalMax += Math.max(...finalValues);
    conflictMax += Math.max(
      ...question.options.map((option) => option.effects?.conflictRisk ?? 0)
    );

    SCORE_CATEGORIES.forEach((category) => {
      const values = question.options.map(
        (option) => option.effects?.categoryScore?.[category] ?? 0
      );
      categoryRanges[category].min += Math.min(...values);
      categoryRanges[category].max += Math.max(...values);
    });
  });

  return {
    final: { min: finalMin, max: finalMax },
    conflict: { min: 0, max: conflictMax },
    categories: categoryRanges,
  };
}

function getLegacyRelationshipRuleInput(index) {
  if (index >= 75) return 170;
  if (index >= 50) return 90;
  if (index >= 25) return 20;
  return Number.NEGATIVE_INFINITY;
}

function getLegacyCategoryRuleInput(category, index) {
  if (category === "emotion") {
    if (index >= 70) return 90;
    if (index >= 40) return 20;
    return Number.NEGATIVE_INFINITY;
  }

  if (category === "stability") {
    if (index >= 70) return 110;
    if (index >= 40) return 30;
    return Number.NEGATIVE_INFINITY;
  }

  if (index >= 70) return 80;
  if (index >= 40) return 20;
  return Number.NEGATIVE_INFINITY;
}

function getLegacyConflictRuleInput(conflictBurden) {
  if (conflictBurden <= 30) return 40;
  if (conflictBurden <= 60) return 100;
  return Number.POSITIVE_INFINITY;
}

function calibrateRelationshipIndex(index, categoryScores, conflictBurden) {
  let calibratedIndex = index;

  if (categoryScores.emotion <= 45 || conflictBurden >= 45) {
    calibratedIndex = Math.min(calibratedIndex, 74);
  }

  if (
    categoryScores.emotion <= 30 ||
    categoryScores.stability < 40 ||
    conflictBurden >= 65
  ) {
    calibratedIndex = Math.min(calibratedIndex, 49);
  }

  if (
    categoryScores.emotion <= 15 ||
    categoryScores.stability < 25 ||
    conflictBurden >= 80
  ) {
    calibratedIndex = Math.min(calibratedIndex, 24);
  }

  return Math.round(calibratedIndex);
}

function getTopTypeTag(typeTags, conflictBurden, relationshipIndex) {
  const entries = Object.entries(typeTags);

  if (!entries.length) {
    return conflictBurden >= 45 || relationshipIndex < 50 ? "mixed" : "stable";
  }

  const topTypeTag = entries.sort((a, b) => b[1] - a[1])[0][0];

  if (
    topTypeTag === "stable" &&
    (conflictBurden >= 45 || relationshipIndex < 50)
  ) {
    return "mixed";
  }

  return topTypeTag;
}

function getModeText(relationshipMode) {
  if (relationshipMode === RELATIONSHIP_MODE.MARRIED) {
    return {
      noun: "부부 관계",
      keyThemes: "가사와 경제 운영, 자녀와 양가 문제, 장기 생활 계획",
      futureWarning:
        "부부 관계에서는 감정의 좋고 나쁨만큼 역할 분담과 생활 운영의 공정성이 중요합니다.",
    };
  }

  return {
    noun: "연인 관계",
    keyThemes: "결혼과 출산관, 연락과 애정 표현, 개인 시간과 미래 계획",
    futureWarning:
      "연인 관계에서는 현재의 감정과 함께 결혼, 자녀, 커리어 같은 다음 단계의 방향성을 확인하는 것이 중요합니다.",
  };
}

function buildPersonalizedSummary({
  relationshipIndex,
  emotionScore,
  stabilityScore,
  conflictBurden,
  futureScore,
  relationshipMode,
}) {
  const modeText = getModeText(relationshipMode);
  const lines = [];

  if (relationshipIndex >= 75) {
    lines.push(
      `현재 ${modeText.noun}는 감정적 친밀감과 현실적 운영 조건이 함께 받쳐주는 편입니다. ${modeText.keyThemes}에서도 비교적 안정적인 흐름이 보입니다.`
    );
  } else if (relationshipIndex >= 50) {
    lines.push(
      `현재 ${modeText.noun}는 이어갈 힘과 조율 과제가 함께 있는 상태입니다. 특히 ${modeText.keyThemes} 중 아직 말로 정리되지 않은 부분을 확인하는 것이 좋습니다.`
    );
  } else if (relationshipIndex >= 25) {
    lines.push(
      `현재 ${modeText.noun}는 좋아하는 마음과 별개로 반복되는 불편이 누적될 수 있는 구간입니다. 감정 회복만이 아니라 실제 합의와 행동 변화가 함께 필요합니다.`
    );
  } else {
    lines.push(
      `현재 ${modeText.noun}는 지속 가능성을 신중히 다시 봐야 하는 상태로 보입니다. 관계를 이어갈지보다 먼저 안전감, 존중, 책임감, 미래 합의가 회복 가능한지 확인해야 합니다.`
    );
  }

  if (emotionScore >= 70) {
    lines.push(
      `감정적 안전감은 ${emotionScore}점으로 강점 구간입니다. 상대 앞에서 비교적 편안하고, 애정 표현과 일상적 친밀감이 관계를 지탱하는 자원으로 작동합니다.`
    );
  } else if (emotionScore >= 40) {
    lines.push(
      `감정적 안전감은 ${emotionScore}점으로 조율 구간입니다. 연락, 애정 표현, 서운함 표현에서 한쪽만 참는 흐름이 생기지 않는지 살펴보세요.`
    );
  } else {
    lines.push(
      `감정적 안전감은 ${emotionScore}점으로 우선 점검이 필요합니다. 함께 있어도 긴장하거나 나다운 모습을 줄이고 있다면, 관계 안의 안전감부터 회복해야 합니다.`
    );
  }

  if (stabilityScore >= 70) {
    lines.push(
      `현실적 안정성은 ${stabilityScore}점으로 강점 구간입니다. 책임감, 신뢰, 생활 조율이 관계를 현실적으로 유지하는 기반이 되고 있습니다.`
    );
  } else if (stabilityScore >= 40) {
    lines.push(
      `현실적 안정성은 ${stabilityScore}점으로 조율 구간입니다. 돈, 가족, 생활 습관, 역할 분담 같은 현실 주제에서 구체적인 규칙이 더 필요합니다.`
    );
  } else {
    lines.push(
      `현실적 안정성은 ${stabilityScore}점으로 우선 점검이 필요합니다. 일방적 희생, 책임 회피, 신뢰 흔들림이 반복된다면 감정보다 관계 구조를 먼저 봐야 합니다.`
    );
  }

  if (futureScore >= 70) {
    lines.push(
      `미래 방향성은 ${futureScore}점으로 비교적 잘 맞습니다. 장기 목표와 중요한 가치관이 같은 방향을 향하고 있어 관계의 지속 가능성을 높입니다.`
    );
  } else if (futureScore >= 40) {
    lines.push(
      `미래 방향성은 ${futureScore}점으로 더 구체화될 필요가 있습니다. ${modeText.futureWarning}`
    );
  } else {
    lines.push(
      `미래 방향성은 ${futureScore}점으로 핵심 리스크 구간입니다. 지금 좋은 감정이 있어도 결혼관, 자녀관, 돈, 가족, 커리어 방향이 맞지 않으면 장기 갈등으로 커질 수 있습니다.`
    );
  }

  if (conflictBurden >= 65) {
    lines.push(
      `갈등 부담 지수는 ${conflictBurden}점으로 높은 편입니다. 같은 주제가 반복되거나 해결 과정에서 상처가 커지는 흐름이 있다면, 대화 내용보다 대화 방식 자체를 다시 설계해야 합니다.`
    );
  } else if (conflictBurden >= 35) {
    lines.push(
      `갈등 부담 지수는 ${conflictBurden}점으로 중간 구간입니다. 반복되는 반응 패턴이 피로를 만들 수 있으니, 갈등이 시작되는 신호와 멈추는 규칙을 정해두는 것이 좋습니다.`
    );
  } else {
    lines.push(
      `갈등 부담 지수는 ${conflictBurden}점으로 낮은 편입니다. 의견 차이가 있어도 관계 회복 경로가 남아 있는 상태로 보입니다.`
    );
  }

  return lines;
}

export function analyzeRelationship(result, relationshipMode) {
  const ranges = getScoreRanges(relationshipMode);
  const rawFinalValue = result.totalScore - result.totalRisk;
  const normalizedCategoryScores = Object.fromEntries(
    SCORE_CATEGORIES.map((category) => [
      category,
      normalizeScore(
        result.categoryScores[category],
        ranges.categories[category].min,
        ranges.categories[category].max
      ),
    ])
  );
  const conflictBurden = normalizeScore(
    result.conflictRisk,
    ranges.conflict.min,
    ranges.conflict.max
  );
  const rawRelationshipIndex = normalizeScore(
    rawFinalValue,
    ranges.final.min,
    ranges.final.max
  );
  const relationshipIndex = calibrateRelationshipIndex(
    rawRelationshipIndex,
    normalizedCategoryScores,
    conflictBurden
  );
  const topTypeTag = getTopTypeTag(
    result.typeTags,
    conflictBurden,
    relationshipIndex
  );

  const relationshipLevel = pickRule(
    getLegacyRelationshipRuleInput(relationshipIndex),
    relationshipLevelRules
  );
  const emotionReport = pickRule(
    getLegacyCategoryRuleInput("emotion", normalizedCategoryScores.emotion),
    categoryReportRules.emotion
  );
  const stabilityReport = pickRule(
    getLegacyCategoryRuleInput("stability", normalizedCategoryScores.stability),
    categoryReportRules.stability
  );
  const futureReport = pickRule(
    getLegacyCategoryRuleInput("future", normalizedCategoryScores.future),
    categoryReportRules.future
  );
  const conflictRiskRule = conflictRiskRules.find(
    (rule) => getLegacyConflictRuleInput(conflictBurden) <= rule.max
  );
  const modeText = getModeText(relationshipMode);

  return {
    finalValue: relationshipIndex,
    relationshipIndex,
    rawFinalValue,
    topTypeTag,
    topTypeLabel: TYPE_LABELS[topTypeTag] ?? "분석 중",
    relationshipMode,
    relationshipLabel: modeText.noun,
    relationshipLevel,
    emotionReport,
    stabilityReport,
    futureReport,
    conflictReport: {
      title: "갈등 패턴 분석",
      desc: `${
        conflictTypeDescriptions[topTypeTag] ??
        "갈등 반응 패턴은 추가 관찰이 필요합니다."
      } ${conflictRiskRule.desc}`,
      points: conflictRiskRule.points,
    },
    categoryScores: normalizedCategoryScores,
    rawCategoryScores: result.categoryScores,
    totalScore: result.totalScore,
    totalRisk: result.totalRisk,
    conflictRisk: conflictBurden,
    conflictBurden,
    rawConflictRisk: result.conflictRisk,
    scoreBasis:
      "각 영역의 서로 다른 배점 범위를 0~100으로 환산한 앱 내부 참고 지수입니다. 표준화된 심리검사 규준이나 임상 진단 점수가 아닙니다.",
    summaryLines: buildPersonalizedSummary({
      relationshipIndex,
      emotionScore: normalizedCategoryScores.emotion,
      stabilityScore: normalizedCategoryScores.stability,
      conflictBurden,
      futureScore: normalizedCategoryScores.future,
      relationshipMode,
    }),
  };
}
