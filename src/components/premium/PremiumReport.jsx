import { CATEGORY_META } from "../../data/config.js";

function PremiumSection({ title, description, points }) {
  return (
    <article className="premium-report__section">
      <h4>{title}</h4>
      <p>{description}</p>

      {points?.length ? (
        <ul className="premium-report__points">
          {points.map((point) => (
            <li key={point}>{point}</li>
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
      core:
        "부부 관계는 애정만으로 유지되기보다 역할, 경제, 자녀, 양가, 생활 운영이 함께 맞물리는 장기 시스템에 가깝습니다.",
      conversation:
        "이번 달 우리를 가장 지치게 한 생활 운영 주제는 무엇이고, 다음 한 달 동안 딱 하나만 바꾼다면 무엇을 바꾸면 좋을까요?",
    };
  }

  return {
    label: "연인 관계",
    core:
      "연인 관계는 현재의 감정 만족도와 함께 결혼, 출산, 커리어, 개인 시간처럼 다음 단계에서 커질 주제를 미리 확인하는 과정이 중요합니다.",
    conversation:
      "우리가 계속 만난다면 1년 뒤 서로에게 기대하는 관계 모습은 무엇이고, 지금부터 맞춰야 할 현실 조건은 무엇일까요?",
  };
}

function getAnswerImpact(answer) {
  const effects = answer.effects ?? {};
  const categoryScore = effects.categoryScore ?? {};
  const categoryImpact = Object.values(categoryScore).reduce(
    (sum, value) => sum + value,
    0
  );

  return (
    (effects.totalScore ?? 0) +
    categoryImpact -
    (effects.totalRisk ?? 0) -
    (effects.conflictRisk ?? 0)
  );
}

function getAnswerReading(answer) {
  const categoryLabel =
    CATEGORY_META[answer.category]?.label ?? answer.category ?? "기타";
  const impact = getAnswerImpact(answer);
  const risk =
    (answer.effects?.totalRisk ?? 0) + (answer.effects?.conflictRisk ?? 0);

  if (impact > 8 && risk === 0) {
    return `${categoryLabel} 영역에서 '${answer.selectedLabel}'라고 답한 부분은 관계를 버티게 하는 실제 자원입니다. 이 응답은 단순히 기분이 좋다는 뜻을 넘어, 두 사람이 반복해서 사용할 수 있는 안정 행동이 있다는 의미로 볼 수 있습니다.`;
  }

  if (risk > 0 || impact < 0) {
    return `${categoryLabel} 영역에서 '${answer.selectedLabel}'라고 답한 부분은 먼저 다뤄야 할 주제입니다. 이 응답은 상대가 나쁘다는 판정이 아니라, 지금 방식이 반복되면 피로감이나 불신이 커질 수 있다는 신호로 보는 편이 정확합니다.`;
  }

  return `${categoryLabel} 영역의 '${answer.selectedLabel}' 응답은 중간 지점에 가깝습니다. 큰 위험 신호로 단정하기보다, 두 사람이 어떤 기준을 편안하게 느끼는지 확인해두면 좋은 항목입니다.`;
}

function buildAnswerInsights(answers) {
  const mappedAnswers = answers.map((answer) => ({
    ...answer,
    impact: getAnswerImpact(answer),
    risk:
      (answer.effects?.totalRisk ?? 0) + (answer.effects?.conflictRisk ?? 0),
  }));

  const strengths = mappedAnswers
    .filter((answer) => answer.impact > 8 && answer.risk === 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 4);

  const concerns = mappedAnswers
    .filter((answer) => answer.impact < 0 || answer.risk > 0)
    .sort((a, b) => a.impact - b.impact || b.risk - a.risk)
    .slice(0, 5);

  return {
    strengths,
    concerns,
    hasAnswerData: mappedAnswers.length > 0,
  };
}

function getWeakestAreaGuide(analysis) {
  const entries = [
    {
      key: "emotion",
      label: "감정 상태",
      value: analysis.categoryScores.emotion,
      guide:
        "감정 상태가 우선 과제라면 연락 빈도, 애정 표현, 서운함 표현, 나다운 모습의 안전감을 먼저 다루는 것이 좋습니다.",
    },
    {
      key: "stability",
      label: "관계 안정성",
      value: analysis.categoryScores.stability,
      guide:
        "관계 안정성이 우선 과제라면 돈, 책임감, 가족 경계, 생활 습관, 희생의 균형처럼 반복 행동으로 확인되는 영역을 먼저 점검해야 합니다.",
    },
    {
      key: "future",
      label: "미래 방향성",
      value: analysis.categoryScores.future,
      guide:
        "미래 방향성이 우선 과제라면 결혼, 자녀, 커리어, 거주지, 장기 목표를 감정 논쟁이 아니라 현실 합의의 언어로 정리하는 것이 필요합니다.",
    },
  ];

  const weakest = entries.sort((a, b) => a.value - b.value)[0];

  if (analysis.conflictRisk >= 130) {
    return {
      label: "갈등 회복력",
      guide:
        "갈등 리스크가 높게 나타났기 때문에 지금은 누가 맞는지보다 대화가 안전하게 끝나는 구조를 만드는 것이 가장 중요합니다.",
    };
  }

  return weakest;
}

function getPlainResultReading(analysis, modeGuide, weakestArea) {
  if (analysis.finalValue >= 170) {
    return `${modeGuide.label}로 보면 현재 관계는 기본 체력이 좋은 편입니다. 다만 좋은 점수가 나왔다는 말은 아무것도 하지 않아도 된다는 뜻이 아니라, 이미 잘 되고 있는 행동을 의식적으로 반복하면 더 안정될 수 있다는 뜻입니다. 특히 ${weakestArea.label} 영역은 앞으로 관계의 질을 더 올리는 데 중요한 점검 포인트입니다.`;
  }

  if (analysis.finalValue >= 90) {
    return `${modeGuide.label}로 보면 현재 관계는 이어갈 힘과 조율 과제가 함께 있는 상태입니다. 서로를 좋아하는 마음이 있어도, 생활 기준이나 갈등 방식이 정리되지 않으면 같은 문제가 반복될 수 있습니다. 지금은 ${weakestArea.label} 영역을 먼저 다루면서 관계의 기준을 말로 맞춰보는 단계가 필요합니다.`;
  }

  if (analysis.finalValue >= 20) {
    return `${modeGuide.label}로 보면 현재 관계는 감정만으로 밀고 가기에는 부담이 커진 상태입니다. 이 구간에서는 '우리가 사랑하느냐'보다 '서로를 안전하게 대하고 있는가', '같은 문제가 반복될 때 회복할 방법이 있는가'가 더 중요합니다. 특히 ${weakestArea.label} 영역은 미루지 말고 확인해야 합니다.`;
  }

  return `${modeGuide.label}로 보면 현재 관계는 지속 여부를 신중하게 다시 봐야 하는 상태입니다. 이 결과는 이별을 단정하는 말이 아니라, 지금의 방식으로 계속 가면 한쪽 또는 양쪽의 감정 소모가 커질 가능성이 높다는 뜻입니다. 먼저 ${weakestArea.label} 영역에서 최소한의 존중, 안전감, 책임이 회복 가능한지 확인해야 합니다.`;
}

function getConflictNextStep(analysis) {
  if (analysis.conflictRisk >= 130) {
    return "갈등 리스크가 높을 때는 더 오래 대화하는 것이 답이 아닐 수 있습니다. 먼저 말투, 중단 규칙, 다시 이야기하는 시간처럼 대화의 안전장치를 정해야 합니다.";
  }

  if (analysis.conflictRisk >= 60) {
    return "갈등 리스크가 중간 수준일 때는 큰 문제 하나보다 작은 반응 패턴이 쌓이는 경우가 많습니다. 싸움이 시작되는 첫 신호와 서로가 예민해지는 지점을 같이 찾는 것이 도움이 됩니다.";
  }

  return "갈등 리스크가 낮은 편이라면 지금의 회복 방식을 유지하는 것이 중요합니다. 다만 안정적인 관계일수록 돈, 가족, 미래처럼 나중에 커질 주제는 평온할 때 미리 말해두는 편이 좋습니다.";
}

function getStrengthIntro(answerInsights) {
  if (!answerInsights.strengths.length) {
    return "이번 응답에서는 한두 가지 강점이 크게 튀기보다 여러 영역이 섞여 나타났습니다. 이런 경우에는 특별한 이벤트를 만들기보다, 평소에 서로가 편안하다고 느끼는 행동을 조금 더 자주 반복하는 것이 관계 체력을 키우는 방법입니다.";
  }

  const topStrength = answerInsights.strengths[0];
  const categoryLabel =
    CATEGORY_META[topStrength.category]?.label ?? topStrength.category ?? "관계";

  return `좋게 답한 부분도 그냥 지나치지 않는 것이 중요합니다. 특히 ${categoryLabel} 영역의 '${topStrength.selectedLabel}' 응답은 현재 관계가 완전히 무너진 상태가 아니라, 아직 회복에 사용할 수 있는 자원이 남아 있다는 뜻입니다. 이 강점은 칭찬으로 끝내기보다, 앞으로 두 사람이 의식적으로 반복해야 할 행동 기준으로 삼는 것이 좋습니다.`;
}

function getConcernIntro(answerInsights, weakestArea) {
  if (!answerInsights.concerns.length) {
    return `큰 위험 응답이 두드러지지는 않았습니다. 다만 '${weakestArea.label}' 영역은 앞으로 관계의 질을 좌우할 가능성이 있으니, 문제가 터진 뒤가 아니라 평온할 때 미리 기준을 맞춰두는 것이 좋습니다.`;
  }

  const topConcern = answerInsights.concerns[0];
  const categoryLabel =
    CATEGORY_META[topConcern.category]?.label ?? topConcern.category ?? "관계";

  return `가장 먼저 다룰 신호는 ${categoryLabel} 영역에서 보입니다. '${topConcern.selectedLabel}'라고 답한 부분은 누가 잘못했는지 따지는 항목이 아니라, 지금 방식이 반복될 때 관계 안의 안전감과 신뢰가 약해질 수 있다는 경고입니다.`;
}

function buildStrengthCoachingPoints(answerInsights) {
  if (!answerInsights.strengths.length) {
    return [
      "강점 만들기: 이번 결과에서 강점이 약하게 보인다면 먼저 작은 성공 경험을 만들어야 합니다. 하루 한 번 짧은 안부, 갈등 후 다시 이야기하는 약속, 고마운 행동을 말로 확인하는 것부터 시작해도 충분합니다.",
    ];
  }

  return answerInsights.strengths.slice(0, 3).map((answer) => {
    const categoryLabel =
      CATEGORY_META[answer.category]?.label ?? answer.category ?? "관계";

    return `강점 강화: ${categoryLabel} 영역의 '${answer.selectedLabel}' 응답은 관계를 지탱하는 좋은 신호입니다. 이 부분은 당연한 것으로 넘기지 말고, 상대에게 "이런 점이 우리 관계를 편하게 만든다"고 구체적으로 말해주면 강점이 더 오래 유지됩니다.`;
  });
}

function buildConcernCoachingPoints(answerInsights) {
  if (!answerInsights.concerns.length) {
    return [
      "점검 주제: 위험 신호가 크지 않을 때는 오히려 미래 주제를 미리 다루기 좋습니다. 돈, 가족, 개인 시간, 장기 계획 중 하나를 골라 서로의 기준을 확인해보세요.",
    ];
  }

  return answerInsights.concerns.slice(0, 3).map((answer) => {
    const categoryLabel =
      CATEGORY_META[answer.category]?.label ?? answer.category ?? "관계";

    return `우선 대화: ${categoryLabel} 영역의 '${answer.selectedLabel}' 응답은 그냥 참거나 넘기기보다 기준을 정해야 하는 항목입니다. "앞으로 어떻게 할까?"를 묻기 전에, 먼저 "이 상황에서 내가 무엇을 불안하거나 외롭게 느꼈는지"를 한 문장으로 정리하는 것이 좋습니다.`;
  });
}

function stripSectionNumber(title) {
  return title.replace(/^\d+\.\s*/, "");
}

export function PremiumReport({ analysis, answers = [] }) {
  const modeGuide = getModeGuide(analysis);
  const answerInsights = buildAnswerInsights(answers);
  const weakestArea = getWeakestAreaGuide(analysis);
  const strengthIntro = getStrengthIntro(answerInsights);
  const concernIntro = getConcernIntro(answerInsights, weakestArea);

  const personalizedSections = [
    {
      title: "1. 전문가식 종합 판독",
      description:
        getPlainResultReading(analysis, modeGuide, weakestArea),
      points: [
        `전체 결과는 '${analysis.relationshipLevel.title}'입니다. 이 말은 관계의 좋고 나쁨을 한 문장으로 낙인찍는 것이 아니라, 지금 관계를 유지하려면 어떤 조건을 먼저 확인해야 하는지 알려주는 요약입니다.`,
        `감정 상태는 ${analysis.categoryScores.emotion}입니다. 이 영역은 함께 있을 때 편안한지, 서운함을 말해도 괜찮은지, 애정 표현과 친밀감이 서로에게 부담 없이 오가는지를 보여줍니다.`,
        `관계 안정성은 ${analysis.categoryScores.stability}입니다. 이 영역은 약속, 책임감, 금전 감각, 가족과의 거리, 생활 습관처럼 시간이 지날수록 더 중요해지는 현실 조건을 봅니다.`,
        `미래 방향성은 ${analysis.categoryScores.future}입니다. 이 영역은 결혼, 자녀, 커리어, 주거, 장기 목표처럼 지금은 작아 보여도 나중에 큰 갈등으로 커질 수 있는 주제를 확인합니다.`,
        `대표 갈등 경향은 '${analysis.topTypeLabel}'이고 갈등 리스크는 ${analysis.conflictRisk}입니다. 중요한 것은 싸움의 횟수보다 싸운 뒤에 서로가 더 안전해지는지, 아니면 더 불안해지는지입니다.`,
        strengthIntro,
        concernIntro,
      ],
    },
    {
      title: "2. 응답 기반 맞춤 판독",
      description:
        answerInsights.hasAnswerData
          ? `아래 내용은 선택한 답변을 그대로 다시 보여주는 목록이 아니라, 답변이 관계 안에서 어떤 의미를 갖는지 풀어쓴 해석입니다. 현재 가장 먼저 볼 축은 '${weakestArea.label}'입니다. ${weakestArea.guide}`
          : `저장된 답변 원본을 확인할 수 없어 점수 중심으로 해석합니다. 현재 가장 먼저 볼 축은 '${weakestArea.label}'입니다. ${weakestArea.guide}`,
      points: [
        ...(answerInsights.strengths.length
          ? answerInsights.strengths.map(
              (answer) =>
                `관계 자원: ${getAnswerReading(answer)} 근거가 된 답변은 '${answer.question}' 문항입니다.`
            )
          : [
              "관계 자원: 뚜렷하게 한 영역에 몰린 강점보다 여러 영역이 섞여 나타났습니다. 이 경우에는 한 번의 큰 이벤트보다 평소의 작은 안정 행동을 반복하는 것이 더 중요합니다.",
            ]),
        ...(answerInsights.concerns.length
          ? answerInsights.concerns.map(
              (answer) =>
                `우선 점검: ${getAnswerReading(answer)} 근거가 된 답변은 '${answer.question}' 문항입니다.`
            )
          : [
              "우선 점검: 선택 답변상 큰 위험 신호가 두드러지지는 않습니다. 다만 좋은 결과일수록 돈, 가족, 미래, 개인 시간처럼 나중에 커질 주제를 미리 말로 합의해두는 것이 좋습니다.",
            ]),
        "읽는 법: 강점은 앞으로 더 자주 반복해야 할 행동이고, 우선 점검 항목은 비난할 거리가 아니라 대화로 기준을 정해야 할 주제입니다.",
        ...buildStrengthCoachingPoints(answerInsights),
        ...buildConcernCoachingPoints(answerInsights),
      ],
    },
    {
      title: "3. 성숙한 사랑의 5요소 해석",
      description:
        `${modeGuide.label}의 현재 결과를 성숙한 사랑의 관점으로 풀어보면, 중요한 기준은 '좋아하는 마음이 있느냐'보다 '그 마음이 실제 행동으로 이어지고 있느냐'입니다. ${strengthIntro} 반대로 ${concernIntro}`,
      points: [
        "보호와 관심: 상대의 하루와 성장에 관심을 기울이는지, 힘든 순간에 실제로 곁에 있어주는지가 중요합니다. 관심이 통제가 되면 안 되고, 무관심이 자유로 포장되어도 안 됩니다.",
        "책임: 상대의 필요에 자발적으로 반응하는 능력입니다. 말로는 중요하다고 하면서 반복적으로 회피한다면 관계의 안정성은 낮아집니다.",
        "존경: 상대를 내 방식대로 고치려 하지 않고, 독립적인 인격체로 인정하는 태도입니다. 비난, 조롱, 무시는 존경의 축을 직접적으로 약화시킵니다.",
        "지식: 상대의 겉모습이나 반응만 보는 것이 아니라 왜 그런 감정을 느끼는지 이해하려는 노력입니다. 오래 만난 관계일수록 '이미 안다'는 착각을 조심해야 합니다.",
        "자유: 사랑한다는 이유로 소유하거나 감시하지 않는 태도입니다. 개인 시간, 친구 관계, 성장 욕구를 존중할 수 있어야 장기적 친밀감이 유지됩니다.",
      ],
    },
    {
      title: "4. 탄탄한 관계를 만드는 5가지 실천 요소",
      description:
        `좋은 관계는 마음만으로 유지되지 않습니다. 이번 결과에서 특히 '${weakestArea.label}' 영역을 먼저 다루는 것이 중요해 보입니다. 실천 요소는 거창한 숙제가 아니라, 오늘부터 대화 방식과 반복 행동을 조금씩 바꾸는 기준입니다.`,
      points: [
        "커뮤니케이션: 감정을 말하는 것에서 끝나지 않고, 상대가 이해할 수 있는 언어로 구체화해야 합니다. '항상 그래'보다 '어제 그 상황에서 나는 소외감을 느꼈어'가 훨씬 효과적입니다.",
        "정직: 모든 사생활을 공개하라는 뜻이 아니라, 관계에 영향을 주는 중요한 사실을 숨기지 않는 태도입니다. 신뢰는 한 번의 선언보다 반복된 투명성으로 만들어집니다.",
        "존중: 다툼 중에도 상대의 자존감을 깎지 않는 최소선입니다. 논쟁은 가능하지만 조롱, 비교, 인격 비난은 관계의 안전감을 크게 손상시킵니다.",
        "책임감: 내 말과 행동이 상대에게 미친 영향을 인정하는 태도입니다. 변명보다 '내가 그 부분은 놓쳤다'는 인정이 회복의 출발점이 됩니다.",
        "용서: 과거를 무조건 덮는 것이 아니라, 재발 방지 행동이 있을 때 관계를 다시 열어주는 과정입니다. 용서는 기억 삭제가 아니라 회복의 조건을 세우는 일입니다.",
      ],
    },
    {
      title: "5. 좋은 파트너 신호와 현재 관계의 점검 포인트",
      description:
        `장기적으로 함께할 만한 사람인지는 큰 이벤트보다 평소의 태도에서 드러납니다. 이번 답변에서 확인된 긍정 신호는 앞으로 더 키워야 할 자원이고, 불편 신호는 그냥 참을 문제가 아니라 관계 기준을 다시 맞춰야 할 지점입니다. ${strengthIntro}`,
      points: [
        "관계에 충실한 사람은 다른 이성과의 선만 지키는 사람이 아니라, 내가 힘들 때 내 편이 되어주려는 사람입니다.",
        "내 사람들에게 친절한 태도는 상대가 내 삶 전체를 존중하는지 보여줍니다. 가족과 친구를 대하는 방식은 장기 관계의 중요한 예고편입니다.",
        "함께 웃을 수 있는 능력은 사소해 보여도 관계 회복력을 높입니다. 연인은 결국 가장 가까운 친구의 역할도 합니다.",
        "존중을 표현할 줄 아는 사람은 다툼 중에도 선을 지킵니다. 비판은 가능하지만 자존감을 깎는 말은 관계의 끝을 빠르게 당깁니다.",
        "나의 가치를 알아보는 사람은 내 성장과 성공을 진심으로 기뻐합니다. 경쟁심이나 깎아내림이 반복된다면 친밀감보다 불안이 커집니다.",
        "약한 모습을 보일 수 있는 관계는 안전한 관계입니다. 약해진 나를 보였을 때 조롱이나 무시가 돌아온다면 깊은 신뢰는 만들어지기 어렵습니다.",
        "솔직한 사람은 중요한 문제를 혼자 품지 않고 상의합니다. 솔직함은 갈등을 없애는 것이 아니라 갈등을 다룰 수 있게 해주는 기반입니다.",
      ],
    },
    {
      title: "6. 현재 관계의 핵심 리스크 분석",
      description:
        `${analysis.conflictReport.desc} ${getConflictNextStep(analysis)} 쉽게 말하면, 지금 봐야 할 것은 "우리가 왜 또 싸웠지?"가 아니라 "같은 일이 생겼을 때 다음에는 덜 다치게 끝낼 수 있는가?"입니다. ${concernIntro}`,
      points: [
        `현재 대표 갈등 경향은 '${analysis.topTypeLabel}'입니다. 이 유형은 성격을 딱 잘라 규정하는 말이 아니라, 갈등 때 자주 나타나는 반응 방식을 요약한 것입니다.`,
        "회피가 반복되면 당장의 충돌은 줄어도 해결되지 않은 감정이 쌓입니다. 일정 시간 뒤 다시 이야기하는 약속이 필요합니다.",
        "추궁이 반복되면 상대는 방어적으로 닫히고, 불안한 쪽은 더 강하게 확인하려는 악순환이 생깁니다.",
        "폭발이 반복되면 대화의 내용보다 상처받은 말이 더 오래 남습니다. 감정 온도가 높아질 때 멈추는 규칙이 필요합니다.",
        "냉담이 반복되면 관계가 조용히 멀어집니다. 말이 없는 평화가 진짜 안정인지 체념인지 구분해야 합니다.",
        ...buildConcernCoachingPoints(answerInsights),
      ],
    },
    {
      title: "7. 바로 꺼내볼 수 있는 대화 주제 가이드",
      description:
        `관계를 점검할 때는 '우리 괜찮아?'처럼 큰 질문보다, 구체적인 주제를 하나씩 꺼내는 편이 좋습니다. 이번 결과에서는 '${weakestArea.label}'을 먼저 대화 주제로 삼는 것이 좋고, 아래 질문은 비난보다 이해와 조율을 목표로 합니다.`,
      points: [
        modeGuide.conversation,
        `이번 결과 기준 첫 질문: ${weakestArea.guide}`,
        "요즘 내가 관계 안에서 가장 편안했던 순간과 가장 외로웠던 순간은 각각 언제였을까요?",
        "우리가 반복해서 부딪히는 주제는 사실 어떤 욕구나 두려움에서 시작되는 걸까요?",
        "돈, 가족, 개인 시간, 애정 표현 중 지금 가장 먼저 합의해야 할 주제는 무엇일까요?",
        "다음 갈등 때 서로가 하지 않기로 약속할 말이나 행동은 무엇일까요?",
        "서로가 사랑받는다고 느끼는 행동은 무엇이고, 부담스럽다고 느끼는 행동은 무엇일까요?",
      ],
    },
    {
      title: "8. 7일 관계 점검 플랜",
      description:
        `관계 변화는 거창한 결심보다 작고 반복 가능한 행동에서 시작됩니다. 이번 결과에서는 강점은 더 자주 반복하고, 불편 신호는 기준을 정하는 방향이 필요합니다. 아래 플랜은 결과를 보고 바로 실천할 수 있도록 설계한 1주일 점검 루틴입니다.`,
      points: [
        "1일차: 최근 가장 많이 반복된 갈등 주제 하나를 고릅니다. 여러 문제를 한 번에 해결하려 하지 않습니다.",
        "2일차: 그 갈등에서 내가 느낀 감정을 비난 없이 한 문장으로 적습니다. 예: '나는 그때 중요하게 여겨지지 않는 느낌이 들었어.'",
        "3일차: 상대가 방어하지 않고 들을 수 있도록 상황, 감정, 요청을 분리해 말합니다.",
        "4일차: 돈, 연락, 가족, 개인 시간 중 하나를 골라 구체적인 기준을 정합니다.",
        "5일차: 다음 갈등 때 사용할 멈춤 규칙을 정합니다. 예: 감정이 8 이상이면 20분 쉬고 다시 이야기하기.",
        "6일차: 상대가 이번 주에 해준 작은 배려를 하나 말로 표현합니다. 관계 회복에는 문제 지적만큼 인정도 필요합니다.",
        "7일차: 일주일 동안 실제로 달라진 행동이 있었는지 확인합니다. 말보다 반복된 행동을 기준으로 봅니다.",
        ...buildStrengthCoachingPoints(answerInsights),
      ],
    },
    {
      title: "9. 내 행복을 기준으로 보는 관계 점검",
      description:
        `관계 개선은 두 사람이 더 잘 지내기 위한 일이기도 하지만, 동시에 내가 이 관계 안에서 건강하게 살아갈 수 있는지 확인하는 과정이기도 합니다. ${concernIntro} 좋은 관계는 나를 작게 만들지 않고, 내 삶의 에너지를 지속적으로 고갈시키지 않습니다.`,
      points: [
        "이 관계 안에서 나는 더 솔직해지고 있는지, 아니면 더 숨기고 조심하는 사람이 되고 있는지 확인해보세요.",
        "상대의 기분을 맞추기 위해 내 친구, 가족, 일, 성장 계획을 계속 뒤로 미루고 있다면 관계 균형을 다시 봐야 합니다.",
        "함께 있을 때의 안정감과 헤어진 뒤의 피로감을 나누어 살펴보세요. 만남 직후 늘 탈진한다면 관계의 감정 비용이 큰 상태일 수 있습니다.",
        "관계를 유지하기 위해 내가 감수하는 불편이 일시적인 조율인지, 반복되는 자기 포기인지 구분해야 합니다.",
        "좋은 관계는 완벽한 상대를 만나는 것이 아니라, 서로가 더 나은 사람이 되도록 돕는 방향으로 작동합니다.",
      ],
    },
    {
      title: "10. 주의해서 봐야 할 위험 신호",
      description:
        `모든 갈등이 이별 신호는 아니지만, 반복될수록 관계의 안전감을 무너뜨리는 행동들이 있습니다. 이번 결과에서 특히 확인해야 할 부분은 '${weakestArea.label}'입니다. 아래 신호가 자주 보인다면 단순한 성격 차이로 넘기기보다 관계의 기본 조건을 다시 점검해야 합니다.`,
      points: [
        "무시, 조롱, 비교, 인격 비난이 다툼 때마다 반복된다면 존중의 최소선이 흔들리고 있는 것입니다.",
        "사과는 하지만 같은 행동이 반복된다면 회복이 아니라 갈등 순환이 유지되고 있을 가능성이 큽니다.",
        "상대의 사생활을 확인해야만 안심되는 상태라면 신뢰가 아닌 통제 구조가 만들어질 수 있습니다.",
        "내가 힘든 순간마다 상대가 사라지거나 책임을 피한다면 관계의 충실성 축이 약한 상태입니다.",
        "미래 이야기를 꺼낼 때마다 회피, 분노, 냉소로 끝난다면 장기 관계의 핵심 합의가 미뤄지고 있는 것입니다.",
        "약한 모습을 보였을 때 위로보다 평가나 조롱이 돌아온다면 깊은 친밀감이 생기기 어렵습니다.",
        ...buildConcernCoachingPoints(answerInsights),
      ],
    },
    {
      title: "11. 실제로 사용할 수 있는 대화 스크립트",
      description:
        `관계 대화는 좋은 의도만으로 잘 되지 않습니다. 특히 감정이 올라온 상태에서는 문장을 준비해두는 것이 도움이 됩니다. 이번 결과처럼 '${analysis.topTypeLabel}' 경향이 보일 때는 상대를 몰아붙이기보다 내 감정, 사실, 요청을 분리해서 말하는 방식이 더 안전합니다.`,
      points: [
        "감정 표현: '네가 틀렸다는 말을 하려는 게 아니라, 그 상황에서 나는 혼자 남겨진 느낌이 들었어.'",
        "연락 문제: '답장이 늦는 것 자체보다 이유를 모른 채 기다릴 때 불안이 커져. 바쁠 때는 짧게라도 알려주면 좋겠어.'",
        "존중 문제: '우리가 다툴 수는 있지만, 비꼬거나 깎아내리는 말은 서로 하지 않았으면 해.'",
        "미래 대화: '당장 결론을 내자는 게 아니라, 서로가 어느 방향을 생각하는지 확인하고 싶어.'",
        "가족 문제: '네 가족을 부정하려는 게 아니라, 우리 둘의 기준도 함께 존중받았으면 해.'",
        "회복 요청: '사과를 듣고 싶은 것만이 아니라, 다음에는 어떤 행동이 달라질 수 있는지 같이 정하고 싶어.'",
      ],
    },
  ];

  const orderedSections = [
    personalizedSections[0],
    personalizedSections[5],
    personalizedSections[1],
    personalizedSections[6],
    personalizedSections[7],
    personalizedSections[8],
    personalizedSections[9],
    personalizedSections[4],
    personalizedSections[10],
    personalizedSections[2],
    personalizedSections[3],
  ];

  return (
    <section className="card premium-report">
      <div className="premium-report__label">DETAILED REPORT</div>

      <h3 className="premium-report__title">관계 심층 분석 리포트</h3>

      <p className="premium-report__desc">
        이 리포트는 답변 점수를 바탕으로 관계의 정서적 안정감, 현실적 지속 가능성, 갈등 회복력, 미래 합의 수준을 종합적으로 해석합니다. 결론을 단정하기보다, 어떤 대화를 시작해야 하는지와 어떤 행동을 확인해야 하는지에 초점을 둡니다.
      </p>

      <div className="premium-report__summary">
        <div>
          <span>관계 결과</span>
          <strong>{analysis.relationshipLevel.title}</strong>
        </div>
        <div>
          <span>대표 갈등 경향</span>
          <strong>{analysis.topTypeLabel}</strong>
        </div>
        <div>
          <span>최종 판단값</span>
          <strong>{analysis.finalValue}</strong>
        </div>
        <div>
          <span>갈등 리스크</span>
          <strong>{analysis.conflictRisk}</strong>
        </div>
      </div>

      <div className="premium-report__sections">
        {orderedSections.map((section, index) => (
          <PremiumSection
            key={section.title}
            title={`${index + 1}. ${stripSectionNumber(section.title)}`}
            description={section.description}
            points={section.points}
          />
        ))}
      </div>
    </section>
  );
}
