import {
  categoryReportRules,
  relationshipLevelRules,
  conflictRiskRules,
  conflictTypeDescriptions,
} from "../data/reportRules.js";
import { TYPE_LABELS } from "../data/config.js";

// 기준값에 맞는 첫 번째 규칙을 찾아 결과로 사용
function pickRule(value, rules) {
  return rules.find((rule) => value >= rule.min);
}

// 가장 많이 나온 갈등 태그를 대표 갈등 경향으로 선택
function getTopTypeTag(typeTags, conflictRisk, finalValue) {
  const entries = Object.entries(typeTags);
  if (!entries.length) {
    return conflictRisk >= 25 || finalValue < 25 ? "mixed" : "stable";
  }

  const topTypeTag = entries.sort((a, b) => b[1] - a[1])[0][0];

  if (topTypeTag === "stable" && (conflictRisk >= 25 || finalValue < 25)) {
    return "mixed";
  }

  return topTypeTag;
}

function calibrateFinalValue(finalValue, result) {
  let calibratedValue = finalValue;

  if (result.categoryScores.emotion <= -25 || result.conflictRisk >= 35) {
    calibratedValue = Math.min(calibratedValue, 69);
  }

  if (
    result.categoryScores.emotion <= -55 ||
    result.categoryScores.stability < 10 ||
    result.conflictRisk >= 60
  ) {
    calibratedValue = Math.min(calibratedValue, 24);
  }

  return calibratedValue;
}

// 개인화 요약 문구 생성
function buildPersonalizedSummary({
  finalValue,
  emotionScore,
  stabilityScore,
  conflictRisk,
  futureScore,
}) {
  const lines = [];

  if (emotionScore <= -56) {
    lines.push(
      "현재 관계에서는 편안함보다 긴장과 감정 소모가 더 크게 작용하고 있을 가능성이 있습니다.",
    );
  } else if (emotionScore <= -16) {
    lines.push(
      "관계를 유지하려는 힘은 있으나, 갈등 이후 감정이 회복되는 속도는 다소 느려질 수 있습니다.",
    );
  } else {
    lines.push("감정적 연결감은 비교적 안정적으로 유지되고 있는 편입니다.");
  }

  if (stabilityScore >= 55) {
    lines.push(
      "서로를 향한 신뢰와 관계 유지 의지는 관계를 지탱하는 중요한 기반으로 작용하고 있습니다.",
    );
  } else if (stabilityScore < 10) {
    lines.push(
      "애정과 별개로, 관계를 안정적으로 유지하는 구조적 기반은 다시 점검할 필요가 있습니다.",
    );
  }

  if (conflictRisk >= 41) {
    lines.push(
      "특히 갈등을 해결하는 방식이 관계 만족도를 낮추는 주요 요인으로 작용할 수 있습니다.",
    );
  } else if (conflictRisk >= 11) {
    lines.push(
      "갈등의 빈도보다 갈등 이후의 회복 과정이 관계 안정성에 더 큰 영향을 줄 수 있습니다.",
    );
  } else {
    lines.push(
      "갈등을 다루는 방식은 현재 관계의 강점 중 하나일 가능성이 있습니다.",
    );
  }

  if (futureScore <= 2) {
    lines.push(
      "장기적인 방향을 함께 그릴 수 있는지에 대한 대화가 조금 더 필요해 보입니다.",
    );
  } else {
    lines.push(
      "미래 방향성은 관계를 유지하게 하는 긍정적인 요소로 작용할 수 있습니다.",
    );
  }

  if (finalValue < -15) {
    lines.push(
      "지금은 관계를 억지로 유지하기보다, 무엇이 반복적으로 감정 소모를 만드는지 확인하는 과정이 중요합니다.",
    );
  } else if (finalValue < 25) {
    lines.push(
      "관계를 이어갈 가능성은 있으나, 같은 문제가 반복되지 않도록 구체적인 조율이 필요합니다.",
    );
  } else {
    lines.push(
      "현재의 긍정적인 기반을 유지하려면 솔직한 대화와 작은 조율을 지속하는 것이 중요합니다.",
    );
  }

  return lines;
}

// 퀴즈 결과를 최종 리포트 포맷으로 변환
export function analyzeRelationship(result) {
  const rawFinalValue = result.totalScore - result.totalRisk;
  const finalValue = calibrateFinalValue(rawFinalValue, result);
  const topTypeTag = getTopTypeTag(
    result.typeTags,
    result.conflictRisk,
    finalValue,
  );

  const relationshipLevel = pickRule(finalValue, relationshipLevelRules);
  const emotionReport = pickRule(
    result.categoryScores.emotion,
    categoryReportRules.emotion,
  );
  const stabilityReport = pickRule(
    result.categoryScores.stability,
    categoryReportRules.stability,
  );
  const futureReport = pickRule(
    result.categoryScores.future,
    categoryReportRules.future,
  );

  const conflictRiskRule = conflictRiskRules.find(
    (rule) => result.conflictRisk <= rule.max,
  );

  return {
    finalValue,
    topTypeTag,
    topTypeLabel: TYPE_LABELS[topTypeTag] ?? "분석 중",
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
    }),
  };
}
