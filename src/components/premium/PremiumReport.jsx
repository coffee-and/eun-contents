import { CATEGORY_META } from "../../data/config.js";

function PremiumSection({ title, description, points }) {
  return (
    <article className="premium-report__section">
      <h4>{title}</h4>
      <p>{description}</p>

      {points?.length ? (
        <ul className="premium-report__points">
          {points.map((point, index) => (
            <li key={`${title}-${index}`}>{point}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function getModeGuide(analysis) {
  if (analysis.relationshipMode === "married") {
    return {
      label: "부부 관계",
      conversation:
        "이번 달 우리를 가장 지치게 한 생활 운영 주제는 무엇이고, 다음 한 달 동안 딱 하나만 바꾼다면 무엇을 바꾸면 좋을까요?",
    };
  }

  return {
    label: "연인 관계",
    conversation:
      "우리가 계속 만난다면 1년 뒤 서로에게 기대하는 관계 모습은 무엇이고, 지금부터 맞춰야 할 현실 조건은 무엇일까요?",
  };
}

function getCategoryLabel(category) {
  return CATEGORY_META[category]?.label ?? category ?? "관계";
}

function getAnswerRisk(answer) {
  const effects = answer.effects ?? {};
  return Math.max(effects.totalRisk ?? 0, effects.conflictRisk ?? 0);
}

function getAnswerScore(answer) {
  return answer.effects?.totalScore ?? 0;
}

function buildAnswerInsights(answers) {
  const scoredAnswers = answers
    .filter((answer) => answer.category !== "context")
    .map((answer) => {
      const score = getAnswerScore(answer);
      const risk = getAnswerRisk(answer);

      return {
        ...answer,
        score,
        risk,
        strengthPriority: risk === 0 && score > 0 ? score : -1,
        concernPriority: risk * 2 + Math.max(0, -score),
      };
    });

  return {
    strengths: scoredAnswers
      .filter((answer) => answer.strengthPriority >= 8)
      .sort((a, b) => b.strengthPriority - a.strengthPriority)
      .slice(0, 3),
    concerns: scoredAnswers
      .filter((answer) => answer.risk > 0 || answer.score < 0)
      .sort((a, b) => b.concernPriority - a.concernPriority)
      .slice(0, 3),
    hasAnswerData: scoredAnswers.length > 0,
  };
}

function getDurationContext(answers) {
  const durationAnswer = answers.find((answer) => answer.questionId === 1);

  if (!durationAnswer) {
    return "관계 기간 정보는 점수에 반영하지 않고, 해석 맥락으로만 사용합니다.";
  }

  return `관계 기간은 '${durationAnswer.selectedLabel}'로 응답했습니다. 관계가 오래 이어졌다는 사실 자체를 안정성 점수로 계산하지 않고, 현재 패턴이 형성된 맥락을 이해하는 정보로만 사용했습니다.`;
}

function getAreaLevel(score) {
  if (score >= 70) return "강점 구간";
  if (score >= 40) return "조율 구간";
  return "우선 점검 구간";
}

function getWeakestAreaGuide(analysis) {
  const entries = [
    {
      key: "emotion",
      label: "감정적 안전감",
      value: analysis.categoryScores.emotion,
      guide:
        "연락 빈도, 애정 표현, 서운함 표현, 나다운 모습으로 있어도 괜찮다는 감각을 먼저 다루는 것이 좋습니다.",
    },
    {
      key: "stability",
      label: "현실적 안정성",
      value: analysis.categoryScores.stability,
      guide:
        "돈, 책임감, 가족 경계, 생활 습관, 희생의 균형처럼 반복 행동으로 확인되는 영역을 먼저 점검해야 합니다.",
    },
    {
      key: "future",
      label: "미래 방향성",
      value: analysis.categoryScores.future,
      guide:
        "결혼, 자녀, 커리어, 거주지, 장기 목표를 감정 논쟁이 아니라 현실 합의의 언어로 정리하는 것이 필요합니다.",
    },
  ];
  const weakest = [...entries].sort((a, b) => a.value - b.value)[0];

  if (analysis.conflictRisk >= 65) {
    return {
      key: "conflict",
      label: "갈등 회복 구조",
      value: 100 - analysis.conflictRisk,
      guide:
        "지금은 누가 맞는지보다 말투, 중단 규칙, 다시 이야기하는 시간을 정해 대화가 안전하게 끝나는 구조를 만드는 것이 우선입니다.",
    };
  }

  return weakest;
}

function getRelationshipReading(analysis, modeGuide, weakestArea) {
  if (analysis.finalValue >= 75) {
    return `${modeGuide.label}로 보면 현재 관계는 기본 체력이 좋은 편입니다. 다만 높은 지수는 아무것도 하지 않아도 된다는 뜻이 아니라, 이미 잘 작동하는 행동을 반복할 자원이 충분하다는 뜻입니다. 다음 개선 지점은 '${weakestArea.label}'입니다.`;
  }

  if (analysis.finalValue >= 50) {
    return `${modeGuide.label}로 보면 현재 관계는 이어갈 힘과 조율 과제가 함께 있습니다. 감정만 확인하기보다 '${weakestArea.label}'에서 기준과 역할을 구체적으로 맞추는 과정이 필요합니다.`;
  }

  if (analysis.finalValue >= 25) {
    return `${modeGuide.label}로 보면 감정만으로 관계를 밀고 가기에는 부담이 커진 상태입니다. 사랑의 유무보다 서로를 안전하게 대하는지, 같은 문제가 반복될 때 회복 경로가 있는지를 확인해야 합니다. 첫 우선순위는 '${weakestArea.label}'입니다.`;
  }

  return `${modeGuide.label}로 보면 현재 방식의 지속 가능성을 신중히 다시 봐야 합니다. 이 결과가 이별을 단정하지는 않지만, '${weakestArea.label}'에서 최소한의 존중과 책임, 행동 변화가 회복 가능한지부터 확인해야 합니다.`;
}

function getStrengthMeaning(answer) {
  const category = answer.category;

  if (category === "emotion") {
    return "감정을 표현하고 친밀감을 유지할 수 있는 보호 요인으로 해석됩니다.";
  }
  if (category === "stability") {
    return "말뿐 아니라 생활과 책임의 영역에서 관계를 지탱하는 현실 자원으로 해석됩니다.";
  }
  if (category === "future") {
    return "중요한 선택에서 두 사람이 같은 방향을 바라볼 가능성을 높이는 장기 자원으로 해석됩니다.";
  }
  if (category === "conflict") {
    return "갈등이 생겨도 관계를 다시 대화로 돌려놓을 수 있는 회복 자원으로 해석됩니다.";
  }

  return "현재 관계를 안정시키는 긍정적인 행동 자원으로 해석됩니다.";
}

function getStrengthAction(answer) {
  const label = getCategoryLabel(answer.category);
  return `${label}에서 잘 작동하는 이 행동을 당연하게 넘기지 말고, 상대에게 구체적으로 고마움을 표현하고 의식적으로 반복해보세요.`;
}

function getConcernMeaning(answer) {
  const category = answer.category;

  if (category === "emotion") {
    return "감정을 말해도 받아들여질 것이라는 기대가 약해지거나, 친밀감보다 긴장이 커졌다는 신호일 수 있습니다.";
  }
  if (category === "stability") {
    return "선의의 문제가 아니라 책임, 신뢰, 생활 규칙이 실제 행동으로 정착되지 않았다는 신호일 수 있습니다.";
  }
  if (category === "future") {
    return "현재 감정과 별개로 장기적인 선택에서 합의되지 않은 조건이 남아 있다는 신호일 수 있습니다.";
  }
  if (category === "conflict") {
    return "문제의 내용보다 대화를 끝내는 방식이 더 큰 상처를 만들고 있다는 신호일 수 있습니다.";
  }

  return "현재 방식이 반복될 때 관계 피로가 커질 수 있는 신호로 해석됩니다.";
}

function getRepeatedImpact(topTypeTag) {
  const impactMap = {
    avoidant:
      "문제를 미루거나 침묵하는 시간이 길어지면 상대는 더 불안해지고, 다음 대화의 감정 강도가 커질 수 있습니다.",
    explosive:
      "감정이 빠르게 올라오면 문제의 핵심보다 상처받은 표현이 오래 남아 다음 갈등까지 영향을 줄 수 있습니다.",
    cold:
      "겉으로는 조용해 보여도 무시와 단절이 반복되면 친밀감이 서서히 약해질 수 있습니다.",
    pursuer:
      "불안을 낮추기 위한 확인이 강해질수록 상대가 방어적으로 닫히고, 다시 더 많은 확인을 요구하는 악순환이 생길 수 있습니다.",
    mixed:
      "회피, 추궁, 폭발, 냉담이 번갈아 나타나면 갈등의 예측 가능성이 낮아지고 양쪽 모두 쉽게 지칠 수 있습니다.",
    stable:
      "현재는 회복 경로가 있지만, 불편을 오래 미루면 안정적인 대화 습관도 약해질 수 있습니다.",
  };

  return impactMap[topTypeTag] ?? impactMap.mixed;
}

function getBehaviorCriterion(answer) {
  if (answer.category === "emotion") {
    return "감정을 말했을 때 반박보다 경청이 먼저 나오는지, 비난 없이 대화가 끝나는지를 관찰하세요.";
  }
  if (answer.category === "stability") {
    return "사과나 약속보다 정해진 행동이 최소 2주 동안 반복되는지를 확인하세요.";
  }
  if (answer.category === "future") {
    return "막연한 동의가 아니라 시기, 역할, 비용, 양보 가능한 범위가 문장으로 정리되는지 확인하세요.";
  }
  if (answer.category === "conflict") {
    return "갈등 중 중단 규칙을 지키고, 약속한 시간에 대화를 다시 시작하는지를 확인하세요.";
  }

  return "말보다 같은 상황에서 실제 반응이 달라지는지를 확인하세요.";
}

function buildStrengthPoints(answerInsights) {
  if (!answerInsights.strengths.length) {
    return [
      "뚜렷하게 한 영역에 몰린 강점보다 여러 영역이 섞여 나타났습니다. 하루 한 번 짧은 안부, 갈등 후 다시 이야기하는 약속, 고마운 행동을 말로 확인하는 작은 성공 경험부터 만들어보세요.",
    ];
  }

  return answerInsights.strengths.map(
    (answer) =>
      `근거 응답: '${answer.question}'에 '${answer.selectedLabel}'라고 답했습니다. 해석: ${getStrengthMeaning(
        answer
      )} 유지 기준: ${getStrengthAction(answer)}`
  );
}

function buildConcernPoints(answerInsights, analysis) {
  if (!answerInsights.concerns.length) {
    return [
      "선택 답변에서 큰 위험 신호가 두드러지지는 않았습니다. 좋은 결과일수록 돈, 가족, 미래, 개인 시간처럼 나중에 커질 주제를 평온할 때 미리 합의해두는 것이 좋습니다.",
    ];
  }

  return answerInsights.concerns.map(
    (answer) =>
      `근거 응답: '${answer.question}'에 '${answer.selectedLabel}'라고 답했습니다. 의미: ${getConcernMeaning(
        answer
      )} 반복 영향: ${getRepeatedImpact(
        analysis.topTypeTag
      )} 행동 기준: ${getBehaviorCriterion(answer)}`
  );
}

function getConflictCycle(analysis, answerInsights) {
  const topConcern = answerInsights.concerns[0];
  const trigger = topConcern
    ? `'${topConcern.question}'에서 '${topConcern.selectedLabel}'라고 느끼는 상황`
    : "서로의 기대가 어긋나는 상황";
  const cycles = {
    avoidant: [
      `촉발 상황: ${trigger}`,
      "초기 반응: 불편을 말하기보다 침묵하거나 거리를 둡니다.",
      "상대 반응: 이유를 알기 어려워 불안해지거나 더 강하게 대화를 요구할 수 있습니다.",
      "반복 결과: 한쪽은 더 피하고 다른 쪽은 더 붙잡으면서 해결되지 않은 감정이 쌓입니다.",
      "차단 지점: 바로 해결하지 못하더라도 '몇 시에 다시 이야기하자'는 복귀 시간을 반드시 정합니다.",
    ],
    explosive: [
      `촉발 상황: ${trigger}`,
      "초기 반응: 감정 강도가 빠르게 올라가며 말의 속도와 강도가 세집니다.",
      "상대 반응: 방어, 맞대응, 단절 중 하나로 반응할 가능성이 커집니다.",
      "반복 결과: 원래 문제보다 상처 준 말이 더 오래 남고 다음 갈등의 재료가 됩니다.",
      "차단 지점: 감정이 10점 중 7점 이상이면 20분 중단하고, 인격 비난 없이 사실 한 가지부터 다시 말합니다.",
    ],
    cold: [
      `촉발 상황: ${trigger}`,
      "초기 반응: 대답을 줄이거나 비꼼, 무시, 냉담한 태도로 감정을 차단합니다.",
      "상대 반응: 인정받지 못했다는 감각이 커져 더 강하게 설명하거나 포기할 수 있습니다.",
      "반복 결과: 싸움은 조용해져도 친밀감과 신뢰가 함께 줄어듭니다.",
      "차단 지점: 동의하지 않더라도 상대의 감정을 한 문장으로 먼저 확인한 뒤 내 입장을 말합니다.",
    ],
    pursuer: [
      `촉발 상황: ${trigger}`,
      "초기 반응: 불안을 낮추기 위해 답변, 확인, 설명을 반복해서 요구합니다.",
      "상대 반응: 압박을 느껴 방어하거나 연락과 대화를 피할 수 있습니다.",
      "반복 결과: 확인이 늘수록 신뢰는 오히려 줄고, 불안한 쪽은 더 강한 확인을 원하게 됩니다.",
      "차단 지점: 확인 횟수를 늘리기보다 예측 가능한 연락 기준과 약속 불이행 시 대응을 구체적으로 합의합니다.",
    ],
    mixed: [
      `촉발 상황: ${trigger}`,
      "초기 반응: 추궁, 회피, 폭발, 냉담이 상황에 따라 번갈아 나타납니다.",
      "상대 반응: 다음 반응을 예측하기 어려워 양쪽 모두 빠르게 방어적으로 변합니다.",
      "반복 결과: 문제 하나가 해결되기 전에 감정적 상처가 겹치며 갈등 전체가 커집니다.",
      "차단 지점: 한 번의 대화에서는 사실 한 가지, 감정 한 가지, 요청 한 가지만 다룹니다.",
    ],
    stable: [
      `촉발 상황: ${trigger}`,
      "초기 반응: 감정을 조절한 뒤 문제를 구체적으로 말하려는 힘이 있습니다.",
      "상대 반응: 완벽하지 않더라도 다시 대화로 돌아올 가능성이 높습니다.",
      "반복 결과: 갈등이 관계 전체의 위협보다 조율할 문제로 남습니다.",
      "유지 지점: 사과 뒤 실제 행동이 달라졌는지 확인하고, 평온할 때 큰 주제를 미리 이야기합니다.",
    ],
  };

  return cycles[analysis.topTypeTag] ?? cycles.mixed;
}

function buildAreaPoints(analysis) {
  const areas = [
    {
      label: "감정적 안전감",
      score: analysis.categoryScores.emotion,
      report: analysis.emotionReport,
      action:
        "서운함을 말했을 때의 반응, 애정 표현의 균형, 나다운 모습으로 있을 수 있는지를 확인하세요.",
    },
    {
      label: "현실적 안정성",
      score: analysis.categoryScores.stability,
      report: analysis.stabilityReport,
      action:
        "약속, 책임, 돈, 가족 경계, 생활 습관에서 구체적인 역할과 기준이 있는지 확인하세요.",
    },
    {
      label: "미래 방향성",
      score: analysis.categoryScores.future,
      report: analysis.futureReport,
      action:
        "결혼, 자녀, 커리어, 주거, 장기 목표의 시기와 양보 가능한 범위를 구체화하세요.",
    },
  ];

  return areas.map(
    (area) =>
      `${area.label} ${area.score}/100 · ${getAreaLevel(area.score)}: ${
        area.report.desc
      } 확인할 기준: ${area.action}`
  );
}

function buildConversationPoints(modeGuide, weakestArea, answerInsights) {
  const topConcern = answerInsights.concerns[0];
  const concernSentence = topConcern
    ? `핵심 응답 대화: '${topConcern.selectedLabel}'라고 느낀 상황을 두고, "누가 맞는지 결론내기보다 그때 내가 왜 ${getCategoryLabel(
        topConcern.category
      )}에서 불안하거나 지쳤는지 먼저 설명하고 싶어."라고 시작해보세요.`
    : "예방 대화: 지금 큰 위험 신호가 없을 때 돈, 가족, 개인 시간, 장기 계획 중 한 가지를 골라 서로의 기준을 확인해보세요.";

  return [
    `첫 질문: ${modeGuide.conversation}`,
    `우선 과제: ${weakestArea.guide}`,
    concernSentence,
    "감정 표현: '네가 틀렸다는 말을 하려는 게 아니라, 그 상황에서 나는 혼자 남겨진 느낌이 들었어.'",
    "구체적 요청: '앞으로 잘하겠다는 말보다, 같은 상황에서 우리가 각각 무엇을 다르게 할지 한 가지씩 정하고 싶어.'",
    "대화 중단 기준: '지금은 서로를 이해하기보다 상처 주는 쪽으로 가고 있어. 20분 쉬고 오늘 안에 다시 이야기하자.'",
    "합의 확인: '우리가 정한 행동이 실제로 지켜졌는지 일주일 뒤에 다시 확인해보자.'",
  ];
}

function buildSevenDayPlan(weakestArea, answerInsights) {
  const topConcern = answerInsights.concerns[0];
  const focus = topConcern
    ? `'${topConcern.selectedLabel}'라고 답한 상황`
    : `'${weakestArea.label}' 영역`;

  return [
    `1일차 · 초점 정하기: ${focus} 하나만 이번 주의 점검 주제로 고릅니다. 여러 문제를 한 번에 해결하지 않습니다.`,
    "2일차 · 사실과 감정 분리: 실제 있었던 상황 한 가지와 그때 느낀 감정 한 가지를 적습니다. '항상', '절대' 같은 표현은 빼봅니다.",
    `3일차 · 대화 시작: ${weakestArea.label}에 대한 비난이 아니라, 내가 중요하게 여기는 기준과 필요한 행동을 한 문장으로 말합니다.`,
    "4일차 · 행동 합의: 누가, 언제, 무엇을 할지 확인 가능한 행동 하나를 정합니다. 예: 바쁠 때 한 줄 연락, 갈등 후 2시간 안에 복귀하기.",
    "5일차 · 갈등 안전장치: 감정이 10점 중 7점 이상이면 20분 멈추고, 다시 대화할 정확한 시간을 정합니다.",
    "6일차 · 보호 요인 강화: 이번 주에 실제로 도움이 된 상대의 행동 하나를 구체적으로 인정합니다.",
    "7일차 · 변화 판정: 사과를 들었는지가 아니라 합의한 행동이 지켜졌는지, 내 긴장과 피로가 줄었는지를 확인합니다.",
    "재점검 기준: 같은 약속이 2주 이상 반복해서 지켜지면 변화 가능성이 있는 신호입니다. 말은 반복되지만 행동이 달라지지 않으면 합의 방식을 다시 검토해야 합니다.",
  ];
}

export function PremiumReport({ analysis, answers = [] }) {
  const modeGuide = getModeGuide(analysis);
  const answerInsights = buildAnswerInsights(answers);
  const weakestArea = getWeakestAreaGuide(analysis);
  const durationContext = getDurationContext(answers);
  const topStrength = answerInsights.strengths[0];
  const topConcern = answerInsights.concerns[0];

  const sections = [
    {
      title: "응답 기반 종합 해석",
      description: getRelationshipReading(analysis, modeGuide, weakestArea),
      points: [
        `종합 관계 지수는 ${analysis.finalValue}/100, 갈등 부담 지수는 ${analysis.conflictRisk}/100입니다. 두 수치는 서로 다른 문항 배점 범위를 0~100으로 환산한 앱 내부 참고 지수입니다.`,
        `현재 가장 강한 영역은 ${[
          ["감정적 안전감", analysis.categoryScores.emotion],
          ["현실적 안정성", analysis.categoryScores.stability],
          ["미래 방향성", analysis.categoryScores.future],
        ].sort((a, b) => b[1] - a[1])[0].join(" ")}/100입니다.`,
        `가장 먼저 다룰 축은 '${weakestArea.label}'입니다. ${weakestArea.guide}`,
        durationContext,
        "이 결과는 관계의 좋고 나쁨을 확정하거나 임상적으로 진단하는 검사가 아닙니다. 응답을 바탕으로 대화와 행동 점검의 우선순위를 정리한 참고 자료입니다.",
      ],
    },
    {
      title: "관계를 지탱하는 강점과 보호 요인",
      description: topStrength
        ? `가장 강한 보호 요인은 '${topStrength.selectedLabel}'라고 답한 부분에서 확인됩니다. 좋은 답변은 칭찬으로 끝내는 것이 아니라, 앞으로 반복해야 할 행동 기준으로 바꾸는 것이 중요합니다.`
        : "한두 가지 강점이 크게 튀기보다 여러 영역이 섞여 나타났습니다. 이런 경우 작은 안정 행동을 의식적으로 반복해 관계 체력을 만드는 것이 중요합니다.",
      points: buildStrengthPoints(answerInsights),
    },
    {
      title: "우선 점검할 위험 요인과 행동 기준",
      description: topConcern
        ? `가장 우선순위가 높은 응답은 '${topConcern.selectedLabel}'라고 답한 부분입니다. 이는 상대의 성격을 판정하는 근거가 아니라, 같은 상황이 반복될 때 관계 안전감과 신뢰가 약해질 가능성을 보여주는 신호입니다.`
        : "큰 위험 신호는 두드러지지 않았습니다. 다만 위험이 적을 때일수록 평온한 시기에 장기 주제를 미리 합의하는 것이 좋습니다.",
      points: buildConcernPoints(answerInsights, analysis),
    },
    {
      title: "영역별 심층 분석",
      description:
        "세 영역은 질문 수와 배점 범위가 서로 달라 원점수를 직접 비교하지 않고, 각 영역의 가능한 범위를 기준으로 0~100으로 환산했습니다. 낮은 점수는 사람이나 관계의 가치가 아니라, 먼저 대화해야 할 영역을 뜻합니다.",
      points: buildAreaPoints(analysis),
    },
    {
      title: "반복 갈등의 작동 구조",
      description: `${analysis.conflictReport.desc} 현재 주요 갈등 반응은 '${analysis.topTypeLabel}'입니다. 이는 고정된 성격 유형이 아니라, 선택한 답변에서 상대적으로 강하게 나타난 반응 패턴을 요약한 것입니다.`,
      points: getConflictCycle(analysis, answerInsights),
    },
    {
      title: "맞춤 대화 가이드",
      description:
        "관계 대화는 좋은 의도만으로 잘 되지 않습니다. 사실, 감정, 요청을 분리하고 대화를 중단할 기준과 다시 시작할 시간을 함께 정해야 실제 합의로 이어질 가능성이 높아집니다.",
      points: buildConversationPoints(modeGuide, weakestArea, answerInsights),
    },
    {
      title: "7일 실행 플랜과 재점검 기준",
      description:
        "이번 플랜의 목표는 일주일 안에 관계를 완전히 바꾸는 것이 아니라, 말이 실제 행동으로 이어질 수 있는지 확인하는 것입니다. 한 번의 큰 대화보다 작고 관찰 가능한 행동을 기준으로 봅니다.",
      points: buildSevenDayPlan(weakestArea, answerInsights),
    },
  ];

  return (
    <section className="card premium-report">
      <div className="premium-report__label">PERSONALIZED REPORT</div>

      <h3 className="premium-report__title">응답 기반 관계 심층 분석 리포트</h3>

      <p className="premium-report__desc">
        선택한 답변을 근거로 관계의 보호 요인, 우선 위험 요인, 갈등의
        작동 구조와 실제 행동 기준을 정리했습니다. 일반적인 연애 조언보다
        지금 무엇을 먼저 확인해야 하는지에 초점을 둡니다.
      </p>

      <div className="premium-report__summary">
        <div>
          <span>현재 관계 단계</span>
          <strong>{analysis.relationshipLevel.title}</strong>
        </div>
        <div>
          <span>주요 갈등 반응</span>
          <strong>{analysis.topTypeLabel}</strong>
        </div>
        <div>
          <span>종합 관계 지수</span>
          <strong>{analysis.finalValue} / 100</strong>
        </div>
        <div>
          <span>갈등 부담 지수</span>
          <strong>{analysis.conflictRisk} / 100</strong>
        </div>
      </div>

      <div className="premium-report__sections">
        {sections.map((section, index) => (
          <PremiumSection
            key={section.title}
            title={`${index + 1}. ${section.title}`}
            description={section.description}
            points={section.points}
          />
        ))}
      </div>
    </section>
  );
}
