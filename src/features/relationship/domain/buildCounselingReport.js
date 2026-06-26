import { CATEGORY_META } from "../data/config.js";
import {
  MODE_PROFILES,
  SPECIAL_MEANINGS,
} from "../data/modeCounselingContent.js";

function getOptionRank(answer) {
  const value = String(answer?.selectedOptionId ?? "").split("-").pop();
  const rank = Number(value);
  return Number.isFinite(rank) ? rank : 2;
}

function getRisk(answer) {
  const effects = answer.effects ?? {};
  return Math.max(effects.totalRisk ?? 0, effects.conflictRisk ?? 0);
}

function getScore(answer) {
  return answer.effects?.totalScore ?? 0;
}

function classifyAnswer(answer) {
  if (!answer) return { level: "missing", severity: 0, strength: 0 };

  if (answer.category === "context") {
    const rank = getOptionRank(answer);
    if (rank <= 1) return { level: "strong", severity: 0, strength: 3 };
    if (rank === 2) return { level: "mixed", severity: 1, strength: 1 };
    if (rank === 3) return { level: "concern", severity: 2, strength: 0 };
    return { level: "high", severity: 3, strength: 0 };
  }

  const risk = getRisk(answer);
  const score = getScore(answer);

  if (risk >= 12 || score <= -18) {
    return { level: "high", severity: 3, strength: 0 };
  }
  if (risk > 0 || score < 0) {
    return { level: "concern", severity: 2, strength: 0 };
  }
  if (score >= 10) {
    return { level: "strong", severity: 0, strength: 3 };
  }
  return { level: "mixed", severity: 1, strength: 1 };
}

function getEvidence(answer) {
  return `'${answer.question}' 문항에 '${answer.selectedLabel}'라고 답했습니다.`;
}

function getMeaning(answer) {
  if (SPECIAL_MEANINGS[answer.questionId]) {
    return SPECIAL_MEANINGS[answer.questionId];
  }

  const meanings = {
    emotion:
      "감정을 표현하고 받아들이는 안전감, 친밀감, 애정 표현의 균형과 연결된 응답입니다.",
    stability:
      "약속, 신뢰, 책임, 생활 운영처럼 관계가 실제 일상에서 유지되는 방식과 연결된 응답입니다.",
    future:
      "결혼, 자녀, 커리어, 주거와 장기 목표처럼 관계의 방향성과 연결된 응답입니다.",
    conflict:
      "갈등이 시작되고 커지고 회복되는 과정에서 반복되는 반응을 보여주는 응답입니다.",
    context:
      "현재 관계가 어떤 방식으로 운영되고 있는지 이해하는 핵심 맥락 응답입니다.",
  };

  return meanings[answer.category] ?? meanings.context;
}

function buildAnswerInsights(answers) {
  const assessed = answers
    .filter((answer) => answer.questionId !== 1)
    .map((answer) => ({ ...answer, assessment: classifyAnswer(answer) }));

  return {
    strengths: assessed
      .filter((answer) => answer.assessment.level === "strong")
      .sort((a, b) => b.assessment.strength - a.assessment.strength)
      .slice(0, 4),
    concerns: assessed
      .filter((answer) => ["concern", "high"].includes(answer.assessment.level))
      .sort((a, b) => b.assessment.severity - a.assessment.severity)
      .slice(0, 4),
  };
}

function getWeakestArea(analysis) {
  const areas = [
    ["감정적 안전감", analysis.categoryScores.emotion],
    ["현실적 안정성", analysis.categoryScores.stability],
    ["미래 방향성", analysis.categoryScores.future],
  ];

  if (analysis.conflictRisk >= 65) {
    return ["갈등 회복 구조", 100 - analysis.conflictRisk];
  }

  return areas.sort((a, b) => a[1] - b[1])[0];
}

function getStrongestArea(analysis) {
  return [
    ["감정적 안전감", analysis.categoryScores.emotion],
    ["현실적 안정성", analysis.categoryScores.stability],
    ["미래 방향성", analysis.categoryScores.future],
  ].sort((a, b) => b[1] - a[1])[0];
}

function getOverallReading(analysis, profile, weakestArea) {
  if (analysis.finalValue >= 75) {
    return `${profile.noun}는 전반적으로 안정적인 자원을 갖고 있습니다. 다만 좋은 관계도 자동으로 유지되지는 않으므로, 현재 가장 낮은 '${weakestArea[0]}' 영역을 예방적으로 관리하는 것이 중요합니다.`;
  }
  if (analysis.finalValue >= 50) {
    return `${profile.noun}는 관계를 이어갈 자원과 반복 조율이 필요한 과제가 함께 나타납니다. 지금은 관계 전체를 평가하기보다 '${weakestArea[0]}'에서 구체적인 합의와 행동 변화를 만드는 단계가 필요합니다.`;
  }
  if (analysis.finalValue >= 25) {
    return `${profile.noun}는 감정만으로 버티기에는 부담이 커진 상태일 수 있습니다. 사랑의 유무보다 '${weakestArea[0]}'에서 안전감과 책임, 회복 가능한 행동이 실제로 존재하는지를 확인해야 합니다.`;
  }
  return `${profile.noun}는 현재 방식의 지속 가능성을 신중히 다시 살펴야 하는 구간입니다. 이 결과가 관계의 결론을 대신하지는 않지만, 최소한의 존중과 안전, 책임 있는 행동 변화가 가능한지를 우선 확인해야 합니다.`;
}

function buildStrengthPoints(insights, profile) {
  if (!insights.strengths.length) {
    return [
      `현재 뚜렷하게 한두 가지 강점이 튀기보다 여러 영역이 섞여 나타납니다. ${profile.noun}에서 작은 안정 행동을 의식적으로 반복해 보호 요인을 새로 만드는 과정이 필요합니다.`,
      "보호 요인은 거창한 이벤트보다 약속한 시간에 돌아오는 행동, 감정을 끝까지 듣는 태도, 상대의 부담을 알아차리는 반응처럼 반복 가능한 행동에서 만들어집니다.",
    ];
  }

  return insights.strengths.map(
    (answer) =>
      `응답 근거: ${getEvidence(answer)} 상담적 의미: ${getMeaning(answer)} 이 강점은 당연하게 넘기기보다 '${answer.selectedLabel}'에 해당하는 행동을 구체적으로 인정하고 반복할 때 관계의 회복 자원으로 유지됩니다.`
  );
}

function buildConcernPoints(insights) {
  if (!insights.concerns.length) {
    return [
      "선택 답변에서 강한 위험 신호는 두드러지지 않았습니다. 다만 문제가 없다는 뜻보다, 평온한 시기에 돈·가족·개인 시간·미래 계획 같은 주제를 미리 합의하기 좋은 상태로 해석하는 편이 정확합니다.",
      "예방적 점검에서는 갈등 횟수보다 불편을 말했을 때 서로가 방어적으로 변하지 않고 다시 대화로 돌아오는지를 확인하세요.",
    ];
  }

  return insights.concerns.map((answer) => {
    const levelText =
      answer.assessment.level === "high"
        ? "우선순위가 높은 위험 신호"
        : "반복 여부를 확인해야 할 조율 신호";

    return `응답 근거: ${getEvidence(answer)} 상담적 의미: ${getMeaning(
      answer
    )} 현재는 ${levelText}로 볼 수 있습니다. 상대의 의도보다 같은 상황에서 실제 행동이 달라지는지, 약속이 최소 2주 이상 반복되는지를 확인해야 합니다.`;
  });
}

function assessDimension(dimension, answers) {
  const relevantAnswers = answers.filter((answer) =>
    dimension.questionIds.includes(answer.questionId)
  );
  const assessed = relevantAnswers.map((answer) => ({
    ...answer,
    assessment: classifyAnswer(answer),
  }));
  const high = assessed.filter((answer) => answer.assessment.level === "high");
  const concerns = assessed.filter((answer) =>
    ["concern", "high"].includes(answer.assessment.level)
  );
  const strengths = assessed.filter(
    (answer) => answer.assessment.level === "strong"
  );

  let level = "mixed";
  if (high.length) level = "high";
  else if (concerns.length >= 2) level = "concern";
  else if (strengths.length >= Math.max(2, Math.ceil(assessed.length * 0.5))) {
    level = "strong";
  } else if (concerns.length) level = "concern";

  const evidence = [
    ...concerns.sort(
      (a, b) => b.assessment.severity - a.assessment.severity
    ),
    ...strengths,
    ...assessed.filter(
      (answer) => !concerns.includes(answer) && !strengths.includes(answer)
    ),
  ].slice(0, 3);

  return { level, evidence };
}

function buildDimensionSection(dimension, answers) {
  const assessment = assessDimension(dimension, answers);
  const levelLabel = {
    strong: "보호 요인",
    mixed: "관찰·조율 영역",
    concern: "우선 조율 영역",
    high: "집중 점검 영역",
  }[assessment.level];
  const evidenceText = assessment.evidence.length
    ? assessment.evidence.map(getEvidence).join(" ")
    : "해당 영역의 저장된 응답이 충분하지 않아 현재 점수와 공통 문항을 중심으로 해석했습니다.";

  return {
    title: dimension.title,
    description: dimension[assessment.level],
    points: [
      `상담적 분류: ${levelLabel}. 이 분류는 성격 진단이 아니라, 현재 관계에서 대화를 먼저 시작할 우선순위를 의미합니다.`,
      `응답 근거: ${evidenceText}`,
      `관계에 미치는 영향: ${dimension.impact}`,
      `상담 목표: ${dimension.goal}`,
      `함께 다룰 질문: ${dimension.question}`,
    ],
  };
}

function buildConflictCycle(analysis, insights, profile) {
  const topConcern = insights.concerns[0];
  const trigger = topConcern
    ? `${getEvidence(topConcern)}`
    : `${profile.noun}에서 기대가 어긋나는 상황`;
  const cycles = {
    avoidant: {
      emotion: "갈등이 커질 것이라는 부담과 압박",
      reaction: "침묵, 대화 미루기, 거리 두기로 감정을 낮추려 합니다.",
      partner:
        "상대는 이유를 알기 어려워 더 불안해지고 설명이나 답변을 강하게 요구할 수 있습니다.",
      result:
        "한쪽은 더 피하고 다른 쪽은 더 붙잡으면서 원래 주제보다 단절감이 핵심 문제가 됩니다.",
      exit:
        "지금 해결하지 못하더라도 대화를 다시 시작할 정확한 시간과 다룰 주제 한 가지를 약속합니다.",
    },
    explosive: {
      emotion: "무시당했다는 감각, 억울함, 통제되지 않는 긴장",
      reaction:
        "말의 속도와 강도가 높아지고 과거 문제까지 한꺼번에 꺼낼 수 있습니다.",
      partner:
        "상대는 맞대응하거나 방어적으로 닫히고, 대화 내용보다 공격받았다는 기억을 남길 수 있습니다.",
      result:
        "갈등의 본래 주제는 해결되지 않고 상처 준 표현이 다음 갈등의 촉발점이 됩니다.",
      exit:
        "감정 강도가 10점 중 7점을 넘으면 20분 이상 멈추고, 복귀 후 사실 한 가지와 요청 한 가지만 말합니다.",
    },
    cold: {
      emotion: "상처받지 않기 위해 감정을 차단하려는 마음",
      reaction:
        "짧은 대답, 비꼼, 무시, 무표정한 철수로 관계에서 빠져나갑니다.",
      partner:
        "상대는 인정받지 못했다고 느껴 더 강하게 설명하거나 결국 대화를 포기할 수 있습니다.",
      result: "겉으로 싸움은 줄어도 정서적 거리와 체념이 누적됩니다.",
      exit:
        "동의하지 않더라도 상대가 느낀 감정을 한 문장으로 확인한 뒤 내 입장을 설명합니다.",
    },
    pursuer: {
      emotion: "관계가 멀어질 수 있다는 불안과 중요하지 않다는 두려움",
      reaction:
        "답변, 설명, 확인을 반복적으로 요구하며 즉시 결론을 얻으려 합니다.",
      partner:
        "상대는 압박을 느껴 방어하거나 연락과 대화를 피할 수 있습니다.",
      result:
        "확인이 늘수록 신뢰는 줄고, 불안한 쪽은 다시 더 강한 확인을 원하게 됩니다.",
      exit:
        "확인 횟수를 늘리는 대신 예측 가능한 연락·복귀 기준과 약속 불이행 시 대응을 합의합니다.",
    },
    mixed: {
      emotion: "불안, 분노, 체념이 빠르게 바뀌는 혼란",
      reaction:
        "추궁, 회피, 폭발, 냉담이 상황에 따라 번갈아 나타납니다.",
      partner:
        "다음 반응을 예측하기 어려워 양쪽 모두 빠르게 방어적으로 변합니다.",
      result:
        "한 가지 문제가 해결되기 전에 감정적 상처가 겹치며 갈등 전체가 커집니다.",
      exit:
        "한 번의 대화에서는 사실 한 가지, 감정 한 가지, 요청 한 가지만 다루고 해결 범위를 제한합니다.",
    },
    stable: {
      emotion:
        "불편은 있지만 관계가 완전히 무너질 것이라는 두려움은 상대적으로 낮음",
      reaction:
        "감정을 조절한 뒤 문제를 구체적으로 말하려는 힘이 있습니다.",
      partner:
        "완벽하지 않더라도 다시 대화로 돌아오고 해결점을 찾을 가능성이 높습니다.",
      result:
        "갈등이 관계 전체의 위협보다 조율할 문제로 남을 수 있습니다.",
      exit:
        "사과 뒤 행동이 달라졌는지 확인하고, 평온할 때 큰 주제를 예방적으로 다룹니다.",
    },
  };
  const cycle = cycles[analysis.topTypeTag] ?? cycles.mixed;

  return {
    title: "갈등 악순환과 회복 구조",
    description: `현재 주요 갈등 반응은 '${analysis.topTypeLabel}'이며, 갈등 부담 지수는 ${analysis.conflictRisk}/100입니다. 이는 고정된 성격 유형이 아니라 선택 답변에서 상대적으로 강하게 나타난 보호 반응을 요약한 것입니다.`,
    points: [
      `주요 촉발 근거: ${trigger}`,
      `갈등 아래의 감정: ${cycle.emotion}`,
      `나타나는 보호 반응: ${cycle.reaction}`,
      `상대에게 유발할 수 있는 반응: ${cycle.partner}`,
      `반복 결과: ${cycle.result}`,
      `악순환 차단 지점: ${cycle.exit}`,
    ],
  };
}

function buildRecoverySection(analysis, insights, profile) {
  const highRiskCount = insights.concerns.filter(
    (answer) => answer.assessment.level === "high"
  ).length;
  const strengthCount = insights.strengths.length;
  let description;

  if (analysis.conflictRisk >= 70 || highRiskCount >= 3) {
    description =
      "현재는 좋은 의도나 한 번의 사과만으로 회복을 판단하기 어렵습니다. 관계를 계속 이어갈지보다 먼저 안전한 대화, 책임 인정, 반복 행동의 변화가 실제로 가능한지를 확인해야 합니다.";
  } else if (analysis.finalValue >= 50 && strengthCount >= 2) {
    description =
      "회복에 사용할 수 있는 보호 요인이 남아 있습니다. 다만 관계가 좋아질 가능성은 감정의 크기보다 두 사람이 불편한 주제를 피하지 않고 작은 행동 합의를 반복할 수 있는지에 달려 있습니다.";
  } else {
    description =
      "관계를 회복할 가능성은 열려 있지만 현재 방식이 자동으로 좋아질 가능성은 낮습니다. 문제를 개인 성격으로만 설명하지 않고 상호작용과 생활 구조를 함께 바꾸는 노력이 필요합니다.";
  }

  return {
    title: "회복 가능성을 가늠하는 조건",
    description,
    points: [
      `회복 자원: 현재 확인된 뚜렷한 보호 응답은 ${strengthCount}개, 우선 점검 응답은 ${insights.concerns.length}개입니다. 숫자 자체보다 강점이 실제 갈등 상황에서도 작동하는지가 중요합니다.`,
      "긍정적 변화 신호: 문제를 축소하지 않고 인정함, 상대 감정을 반박하기 전에 들음, 구체적인 행동 약속을 정함, 약속한 행동이 최소 2주 이상 반복됨.",
      "회복을 방해하는 신호: 사과 후 같은 행동 반복, 모든 책임을 상대에게 돌림, 대화를 처벌이나 침묵으로 사용함, 합의한 점검을 계속 미룸.",
      `모드별 확인점: ${profile.developmentalLens}`,
      "안전 기준: 두려움, 위협, 강압적 통제, 신체적·성적 폭력, 심각한 경제적 통제가 있다면 관계 개선 대화보다 개인의 안전과 외부 지원을 우선해야 합니다.",
    ],
  };
}

function buildConversationSection(profile, insights) {
  const topConcern = insights.concerns[0];
  const dynamicScript = topConcern
    ? `핵심 응답 시작 문장: '${topConcern.selectedLabel}'라고 답한 상황을 두고, "누가 맞는지 결론내기 전에 그 상황이 나에게 어떤 의미였는지와 다음에는 어떤 행동이 필요할지 차례로 말하고 싶어."라고 시작해보세요.`
    : "예방 대화 시작 문장: '요즘 큰 문제가 생기기 전에, 우리가 잘하고 있는 점과 앞으로 맞춰야 할 기준을 하나씩 확인하고 싶어.'";

  return {
    title: "상담식 대화 스크립트",
    description:
      "좋은 대화는 감정을 억누르는 것이 아니라 사실·감정·의미·요청을 분리하는 과정입니다. 아래 문장을 그대로 사용하거나 관계 상황에 맞게 짧게 바꿔도 됩니다.",
    points: [
      dynamicScript,
      "감정 확인: '네가 틀렸다는 말을 하려는 게 아니라, 그 상황에서 나는 중요하게 여겨지지 않는 느낌이 들었어.'",
      "영향 설명: '그 일이 한 번이라서가 아니라 반복될 때 내가 우리 관계를 안전하게 느끼기 어려워져.'",
      "행동 요청: '앞으로 잘하겠다는 말보다 다음에 같은 상황이 오면 우리가 각각 무엇을 다르게 할지 한 가지씩 정하고 싶어.'",
      "중단과 복귀: '지금은 서로를 이해하기보다 상처 주는 쪽으로 가고 있어. 30분 쉬고 오늘 밤 9시에 이 주제만 다시 이야기하자.'",
      "점검 합의: '우리가 정한 행동이 실제로 지켜졌는지 2주 뒤에 같이 확인하자.'",
      ...profile.scripts,
    ],
  };
}

function buildTwoWeekPlan(profile, weakestArea, insights) {
  const topConcern = insights.concerns[0];
  const focus = topConcern
    ? `'${topConcern.selectedLabel}'라고 답한 상황`
    : `'${weakestArea[0]}' 영역`;

  return {
    title: "14일 실행·관찰 플랜",
    description:
      "이 계획의 목표는 2주 안에 관계를 완전히 바꾸는 것이 아니라, 말이 실제 행동으로 이어지는지와 두 사람이 함께 조정할 능력이 있는지를 확인하는 것입니다.",
    points: [
      `1~2일차 · 관찰: ${focus}가 발생하는 구체적인 상황, 당시 감정, 자동 반응을 기록합니다. 상대의 의도는 추측하지 않습니다.`,
      "3일차 · 욕구 정리: 비난 문장 대신 내가 중요하게 여기는 기준과 필요한 행동을 각각 한 문장으로 적습니다.",
      "4일차 · 강점 확인: 현재 관계에서 유지하고 싶은 보호 행동 두 가지를 서로 말합니다.",
      "5일차 · 한 주제 대화: 여러 문제를 묶지 않고 가장 중요한 주제 하나만 30분 이내로 다룹니다.",
      "6일차 · 행동 합의: 누가, 언제, 무엇을 할지 관찰 가능한 행동 한 가지를 정합니다.",
      "7일차 · 중간 점검: 약속이 지켜졌는지, 감정 강도와 피로가 줄었는지 10점 척도로 확인합니다.",
      "8~9일차 · 연결 회복: 문제 해결과 무관한 대화 또는 함께하는 시간을 짧게 확보합니다.",
      "10일차 · 경계 점검: 하지 않기로 한 말과 행동, 대화를 멈춰야 할 기준, 복귀 시간을 다시 확인합니다.",
      "11~12일차 · 반복 관찰: 같은 상황에서 이전과 다른 행동이 한 번이라도 나타났는지 기록합니다.",
      "13일차 · 공정성 확인: 변화 노력이 한쪽에만 쏠리지 않았는지, 상대도 자발적으로 참여했는지 확인합니다.",
      "14일차 · 재평가: 약속 이행, 정서적 안전감, 책임 분담, 미래 대화 가능성을 기준으로 유지·수정·추가 지원 필요 여부를 정합니다.",
      ...profile.actionExamples.map(
        (example) => `모드별 실천 예시: ${example}`
      ),
      "변화 판정 기준: 좋은 말을 했는지가 아니라 합의한 행동이 반복되었는지, 갈등 후 복귀 시간이 짧아졌는지, 한쪽의 긴장과 피로가 실제로 줄었는지를 봅니다.",
    ],
  };
}

function buildModeContextPoints(answers, profile) {
  const modeAnswerIds = profile.dimensions.flatMap(
    (dimension) => dimension.questionIds
  );
  const contextAnswers = answers.filter(
    (answer) =>
      answer.category === "context" &&
      answer.questionId !== 1 &&
      modeAnswerIds.includes(answer.questionId)
  );

  if (!contextAnswers.length) {
    return [
      "이번 결과에는 새로 추가된 모드별 맥락 응답이 저장되지 않았습니다. 기존 저장 결과일 수 있으므로 공통 문항과 점수를 중심으로 해석했습니다.",
    ];
  }

  return contextAnswers.map((answer) => {
    const assessment = classifyAnswer(answer);
    const label = {
      strong: "보호 요인",
      mixed: "조율 가능 영역",
      concern: "우선 점검 영역",
      high: "집중 점검 영역",
    }[assessment.level];

    return `모드별 핵심 응답 · ${label}: ${getEvidence(answer)} ${getMeaning(
      answer
    )}`;
  });
}

export function buildCounselingReport(analysis, answers = []) {
  const profile =
    MODE_PROFILES[analysis.relationshipMode] ?? MODE_PROFILES.couple;
  const insights = buildAnswerInsights(answers);
  const weakestArea = getWeakestArea(analysis);
  const strongestArea = getStrongestArea(analysis);
  const modeSections = profile.dimensions.map((dimension) =>
    buildDimensionSection(dimension, answers)
  );

  const sections = [
    {
      title: "상담 관점 종합 소견",
      description: getOverallReading(analysis, profile, weakestArea),
      points: [
        `종합 관계 지수 ${analysis.finalValue}/100 · 갈등 부담 지수 ${analysis.conflictRisk}/100. 각 점수는 이 서비스 문항의 배점 범위를 0~100으로 환산한 내부 참고 지수입니다.`,
        `가장 강한 영역은 '${strongestArea[0]}' ${strongestArea[1]}/100, 가장 먼저 살펴볼 영역은 '${weakestArea[0]}' ${weakestArea[1]}/100입니다.`,
        `관계 발달 관점: ${profile.developmentalLens}`,
        ...buildModeContextPoints(answers, profile),
        "이 리포트는 진단이나 치료를 대신하지 않으며, 선택한 답변을 바탕으로 대화와 행동 점검의 우선순위를 정리한 참고 자료입니다.",
      ],
    },
    {
      title: "관계를 지탱하는 보호 요인",
      description:
        "상담에서는 문제의 크기뿐 아니라 관계가 어려울 때 다시 사용할 수 있는 자원을 함께 봅니다. 보호 요인은 갈등이 없다는 뜻이 아니라, 갈등 뒤 다시 연결될 가능성을 높이는 행동과 태도를 의미합니다.",
      points: buildStrengthPoints(insights, profile),
    },
    {
      title: "핵심 취약 지점과 위험 요인",
      description:
        "아래 항목은 상대를 나쁜 사람으로 규정하기 위한 것이 아니라, 같은 상황이 반복될 때 신뢰와 안전감이 손상될 가능성이 높은 지점을 우선순위에 따라 정리한 것입니다.",
      points: buildConcernPoints(insights),
    },
    ...modeSections,
    buildConflictCycle(analysis, insights, profile),
    buildRecoverySection(analysis, insights, profile),
    buildConversationSection(profile, insights),
    buildTwoWeekPlan(profile, weakestArea, insights),
  ];

  return {
    title: profile.reportTitle,
    eyebrow: profile.eyebrow,
    intro: profile.intro,
    sections,
  };
}
