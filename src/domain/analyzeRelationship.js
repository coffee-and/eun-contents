import {
  categoryReportRules,
  relationshipLevelRules,
  conflictRiskRules,
  conflictTypeDescriptions,
} from "../data/reportRules.js";
import { RELATIONSHIP_MODE, TYPE_LABELS } from "../data/config.js";

function pickRule(value, rules) {
  return rules.find((rule) => value >= rule.min);
}

function getTopTypeTag(typeTags, conflictRisk, finalValue) {
  const entries = Object.entries(typeTags);
  if (!entries.length) {
    return conflictRisk >= 80 || finalValue < 70 ? "mixed" : "stable";
  }

  const topTypeTag = entries.sort((a, b) => b[1] - a[1])[0][0];

  if (topTypeTag === "stable" && (conflictRisk >= 80 || finalValue < 70)) {
    return "mixed";
  }

  return topTypeTag;
}

function calibrateFinalValue(finalValue, result) {
  let calibratedValue = finalValue;

  if (result.categoryScores.emotion <= 15 || result.conflictRisk >= 90) {
    calibratedValue = Math.min(calibratedValue, 169);
  }

  if (
    result.categoryScores.emotion <= -40 ||
    result.categoryScores.stability < 20 ||
    result.conflictRisk >= 130
  ) {
    calibratedValue = Math.min(calibratedValue, 89);
  }

  if (
    result.categoryScores.emotion <= -95 ||
    result.categoryScores.stability < -30 ||
    result.conflictRisk >= 180
  ) {
    calibratedValue = Math.min(calibratedValue, 19);
  }

  return calibratedValue;
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
  finalValue,
  emotionScore,
  stabilityScore,
  conflictRisk,
  futureScore,
  relationshipMode,
}) {
  const modeText = getModeText(relationshipMode);
  const lines = [];

  if (finalValue >= 170) {
    lines.push(
      `현재 ${modeText.noun}는 감정적 친밀감과 현실적 운영 조건이 함께 받쳐주는 편입니다. ${modeText.keyThemes}에서도 비교적 안정적인 흐름이 보입니다.`
    );
  } else if (finalValue >= 90) {
    lines.push(
      `현재 ${modeText.noun}는 유지 가능성이 있지만, 일부 영역에서 반복 조율이 필요합니다. 특히 ${modeText.keyThemes} 중 아직 말로 정리되지 않은 부분을 확인하는 것이 좋습니다.`
    );
  } else if (finalValue >= 20) {
    lines.push(
      `현재 ${modeText.noun}는 좋아하는 마음과 별개로 반복되는 불편이 누적될 수 있는 구간입니다. 감정 회복만이 아니라 실제 합의와 행동 변화가 함께 필요합니다.`
    );
  } else {
    lines.push(
      `현재 ${modeText.noun}는 지속 가능성을 신중히 다시 봐야 하는 상태로 보입니다. 관계를 이어갈지보다 먼저 안전감, 존중, 책임감, 미래 합의가 회복 가능한지 확인해야 합니다.`
    );
  }

  if (emotionScore >= 90) {
    lines.push(
      "감정 영역은 강점입니다. 상대 앞에서 비교적 편안하고, 애정 표현이나 일상적 친밀감이 관계를 지탱하는 긍정적 자원으로 작동합니다."
    );
  } else if (emotionScore >= 20) {
    lines.push(
      "감정 영역은 아직 기반이 있지만 섬세한 관리가 필요합니다. 연락, 애정 표현, 서운함 표현에서 한쪽만 참는 흐름이 생기지 않는지 살펴보세요."
    );
  } else {
    lines.push(
      "감정 영역은 피로가 큰 편입니다. 함께 있어도 긴장하거나 나다운 모습을 줄이고 있다면, 관계 안의 안전감부터 회복해야 합니다."
    );
  }

  if (stabilityScore >= 110) {
    lines.push(
      "관계 안정성은 높게 나타납니다. 책임감, 신뢰, 생활 조율이 관계를 현실적으로 유지하는 기반이 되고 있습니다."
    );
  } else if (stabilityScore >= 30) {
    lines.push(
      "관계 안정성은 중간 수준입니다. 선의는 있지만 돈, 가족, 생활 습관, 역할 분담 같은 현실 주제에서 구체적인 규칙이 더 필요합니다."
    );
  } else {
    lines.push(
      "관계 안정성은 낮은 편입니다. 일방적 희생, 책임 회피, 신뢰 흔들림이 반복된다면 감정보다 구조를 먼저 봐야 합니다."
    );
  }

  if (futureScore >= 80) {
    lines.push(
      "미래 방향성은 비교적 잘 맞습니다. 장기 목표와 중요한 가치관이 같은 방향을 향하고 있어 관계의 지속 가능성을 높입니다."
    );
  } else if (futureScore >= 20) {
    lines.push(
      `미래 방향성은 더 구체화될 필요가 있습니다. ${modeText.futureWarning}`
    );
  } else {
    lines.push(
      "미래 방향성 차이는 핵심 리스크입니다. 지금 좋은 감정이 있어도 결혼관, 자녀관, 돈, 가족, 커리어 방향이 맞지 않으면 장기 갈등으로 커질 수 있습니다."
    );
  }

  if (conflictRisk >= 130) {
    lines.push(
      "갈등 리스크가 높습니다. 같은 주제가 반복되거나 해결 과정에서 상처가 커지는 흐름이 있다면, 대화 내용보다 대화 방식 자체를 다시 설계해야 합니다."
    );
  } else if (conflictRisk >= 60) {
    lines.push(
      "갈등 리스크는 중간 수준입니다. 큰 위기라기보다 반복되는 반응 패턴이 피로를 만들 수 있으니, 갈등이 시작되는 신호와 멈추는 규칙을 정해두는 것이 좋습니다."
    );
  } else {
    lines.push(
      "갈등 리스크는 낮은 편입니다. 의견 차이가 있어도 관계 회복 경로가 남아 있는 상태로 보입니다."
    );
  }

  return lines;
}

export function analyzeRelationship(result, relationshipMode) {
  const rawFinalValue = result.totalScore - result.totalRisk;
  const finalValue = calibrateFinalValue(rawFinalValue, result);
  const topTypeTag = getTopTypeTag(
    result.typeTags,
    result.conflictRisk,
    finalValue
  );

  const relationshipLevel = pickRule(finalValue, relationshipLevelRules);
  const emotionReport = pickRule(
    result.categoryScores.emotion,
    categoryReportRules.emotion
  );
  const stabilityReport = pickRule(
    result.categoryScores.stability,
    categoryReportRules.stability
  );
  const futureReport = pickRule(
    result.categoryScores.future,
    categoryReportRules.future
  );

  const conflictRiskRule = conflictRiskRules.find(
    (rule) => result.conflictRisk <= rule.max
  );
  const modeText = getModeText(relationshipMode);

  return {
    finalValue,
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
      desc: `${conflictTypeDescriptions[topTypeTag] ?? "갈등 반응 패턴은 추가 관찰이 필요합니다."} ${conflictRiskRule.desc}`,
      points: conflictRiskRule.points,
    },
    categoryScores: result.categoryScores,
    totalScore: result.totalScore,
    totalRisk: result.totalRisk,
    conflictRisk: result.conflictRisk,
    summaryLines: buildPersonalizedSummary({
      finalValue,
      emotionScore: result.categoryScores.emotion,
      stabilityScore: result.categoryScores.stability,
      conflictRisk: result.conflictRisk,
      futureScore: result.categoryScores.future,
      relationshipMode,
    }),
  };
}
