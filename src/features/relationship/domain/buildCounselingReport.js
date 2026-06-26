import { MODE_PROFILES } from "../data/modeCounselingContent.js";

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const relationshipStability = (analysis) => clamp(100 - clamp(analysis.conflictRisk));

function classify(answer) {
  if (!answer) return "mixed";
  const effects = answer.effects ?? {};
  const risk = Math.max(effects.totalRisk ?? 0, effects.conflictRisk ?? 0);
  const score = effects.totalScore ?? 0;
  if (risk >= 12 || score <= -18) return "high";
  if (risk > 0 || score < 0) return "concern";
  if (score >= 10) return "strong";
  return "mixed";
}

function buildInsights(answers) {
  const assessed = answers
    .filter((answer) => answer?.questionId !== 1)
    .map((answer) => ({ ...answer, level: classify(answer) }));
  return {
    strengths: assessed.filter((answer) => answer.level === "strong"),
    concerns: assessed.filter((answer) => ["concern", "high"].includes(answer.level)),
  };
}

function getAreas(analysis) {
  return [
    { key: "emotion", label: "정서 교감", value: clamp(analysis.categoryScores?.emotion) },
    { key: "reality", label: "현실 조율", value: clamp(analysis.categoryScores?.stability) },
    { key: "stability", label: "관계 안정", value: relationshipStability(analysis) },
    { key: "future", label: "미래 정렬", value: clamp(analysis.categoryScores?.future) },
  ];
}

function tone(value) {
  if (value >= 85) return "strong";
  if (value >= 70) return "steady";
  if (value >= 50) return "mixed";
  return "care";
}

const AREA_COPY = {
  emotion: {
    strong: "서로의 감정을 표현하고 받아들이는 기반이 비교적 안정적입니다. 친밀감이 갈등 뒤에도 다시 연결될 수 있는 자원으로 작동할 가능성이 높습니다.",
    steady: "정서적 교감의 기반은 있지만 사랑을 표현하고 확인하는 방식에는 차이가 있을 수 있습니다. 말, 시간, 행동 중 무엇이 서로에게 중요한지 확인하면 만족도가 더 높아질 수 있습니다.",
    mixed: "감정을 나누는 순간과 혼자 견디는 순간이 섞여 있을 수 있습니다. 해결책보다 먼저 감정을 이해받는 경험을 만드는 것이 필요합니다.",
    care: "감정 표현이 부담스럽거나 충분히 받아들여지지 않는다고 느낄 수 있습니다. 더 많이 말하기보다 안전하게 말할 수 있는 조건을 먼저 만드는 것이 중요합니다.",
  },
  reality: {
    strong: "생활 방식과 책임을 함께 조정하는 힘이 비교적 잘 형성되어 있습니다. 암묵적인 배려를 구체적인 합의로 바꾸면 장기적인 안정감이 더 커질 수 있습니다.",
    steady: "일상과 책임에서 큰 충돌은 적지만 시간, 경제, 역할 분담의 기준은 아직 구체적이지 않을 수 있습니다. 대체로 맞는다는 감각을 실제 행동 합의로 연결해보세요.",
    mixed: "생활 운영 방식에서 한쪽이 더 많이 맞추거나 책임질 가능성이 있습니다. 누가 무엇을 언제 맡는지 관찰 가능한 기준으로 정리하는 것이 좋습니다.",
    care: "현실적인 부담과 책임의 불균형이 관계 피로로 이어질 수 있습니다. 애정의 크기보다 약속 이행과 공정한 분담이 가능한지를 우선 확인해야 합니다.",
  },
  stability: {
    strong: "갈등이 생겨도 관계 전체가 쉽게 무너지기보다 다시 대화와 조정으로 돌아올 힘이 큽니다. 다만 갈등이 적다는 이유로 중요한 문제를 미루지는 않는지 점검해보세요.",
    steady: "갈등 이후 회복할 수 있는 기반은 남아 있습니다. 사과와 좋은 의도가 실제 행동 변화로 이어질 때 안정감이 더 단단해집니다.",
    mixed: "갈등이 생기면 해결보다 거리 두기, 추궁, 방어가 먼저 나타날 수 있습니다. 감정이 낮아진 뒤 대화를 재개할 시간과 방식을 미리 합의하는 것이 필요합니다.",
    care: "현재는 갈등이 관계의 안전감과 신뢰를 크게 흔들 수 있습니다. 대화를 더 오래 하기보다 멈추고 다시 돌아올 수 있는 구조를 만드는 것이 먼저입니다.",
  },
  future: {
    strong: "장기적인 방향과 중요한 가치가 비교적 잘 맞습니다. 큰 방향뿐 아니라 시기와 역할까지 구체적으로 확인하면 불확실성을 더 줄일 수 있습니다.",
    steady: "미래에 대한 큰 방향은 비슷하지만 결혼, 자녀, 주거, 커리어의 시기와 조건은 더 조율할 필요가 있습니다.",
    mixed: "장기 계획에 대한 기대와 속도가 다를 수 있습니다. 미래 대화를 사랑의 확인으로만 해석하지 말고 선택 가능한 조건과 기한을 함께 정리해보세요.",
    care: "앞으로의 방향에 대한 차이가 관계 불안의 핵심이 될 수 있습니다. 서로 양보 가능한 부분과 어려운 부분을 구분해 확인해야 합니다.",
  },
};

function areaSection(area) {
  const questions = {
    emotion: "서로가 사랑받고 있다고 느끼는 구체적인 행동은 무엇인가요?",
    reality: "일상에서 한쪽에게 더 많이 몰려 있는 책임은 무엇인가요?",
    stability: "갈등 뒤 다시 대화를 시작하기 위해 필요한 시간과 방식은 무엇인가요?",
    future: "앞으로 2~3년 동안 각자가 가장 중요하게 이루고 싶은 것은 무엇인가요?",
  };
  return {
    title: `${area.label} · ${area.value}/100`,
    description: AREA_COPY[area.key][tone(area.value)],
    points: [
      `${area.label} 점수는 관계의 가치를 평가하는 수치가 아니라 현재 대화와 조율의 우선순위를 보여주는 내부 참고 지수입니다.`,
      `함께 확인할 질문: ${questions[area.key]}`,
    ],
  };
}

function overallSection(analysis, profile, areas) {
  const strongest = [...areas].sort((a, b) => b.value - a.value)[0];
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  const description = analysis.finalValue >= 75
    ? `${profile.noun}는 정서적 연결과 관계를 유지하는 힘이 비교적 안정적입니다. 현재 필요한 것은 관계의 가능성을 다시 확인하는 일보다, 이미 가진 안정감을 생활과 미래의 구체적인 합의로 연결하는 것입니다.`
    : `${profile.noun}에는 관계를 이어갈 자원과 반복해서 조율해야 할 과제가 함께 보입니다. 전체를 좋다거나 나쁘다고 단정하기보다 가장 낮은 영역에서 작은 행동 변화를 만드는 것이 중요합니다.`;
  return {
    title: "핵심 소견",
    description,
    points: [
      `종합 관계 지수 ${clamp(analysis.finalValue)}/100 · 정서 교감 ${areas[0].value}/100 · 현실 조율 ${areas[1].value}/100 · 관계 안정 ${areas[2].value}/100 · 미래 정렬 ${areas[3].value}/100`,
      `현재 가장 강한 영역은 '${strongest.label}', 우선적으로 조율할 영역은 '${weakest.label}'입니다.`,
      "점수보다 중요한 것은 대화에서 정한 약속이 실제 행동으로 이어지고 그 변화가 일정 기간 반복되는지입니다.",
    ],
  };
}

function patternSection(analysis) {
  const cycles = {
    avoidant: ["갈등 부담이 커짐", "대화를 미루거나 거리를 둠", "상대는 더 확인하려 함", "거리감과 불안이 함께 커짐", "대화를 다시 시작할 정확한 시간과 주제 하나를 약속하기"],
    explosive: ["억울함과 긴장이 커짐", "말의 속도와 강도가 높아짐", "상대가 방어적으로 닫힘", "원래 문제보다 상처 준 표현이 남음", "감정이 낮아진 뒤 사실과 요청을 하나씩 말하기"],
    cold: ["상처받지 않기 위해 감정을 차단함", "짧은 대답이나 침묵으로 빠져나감", "상대가 더 강하게 반응함", "정서적 거리가 누적됨", "상대 감정을 한 문장으로 확인한 뒤 내 입장 말하기"],
    pursuer: ["관계가 멀어질 수 있다는 불안이 생김", "즉시 답변과 확인을 요구함", "상대는 압박을 느껴 피함", "확인이 늘수록 신뢰와 여유가 줄어듦", "확인 횟수보다 예측 가능한 연락 기준을 합의하기"],
    mixed: ["불안, 분노, 체념이 빠르게 바뀜", "추궁과 회피가 번갈아 나타남", "상대도 방어적으로 변함", "문제보다 감정적 상처가 겹침", "한 번의 대화에서 사실, 감정, 요청을 하나씩만 다루기"],
    stable: ["불편한 상황이 생김", "감정을 조절한 뒤 문제를 말함", "상대도 다시 대화로 돌아옴", "갈등이 조율할 문제로 남음", "사과 뒤 행동이 달라졌는지 확인하기"],
  };
  const cycle = cycles[analysis.topTypeTag] ?? cycles.mixed;
  return {
    title: "우리 관계의 반복 패턴",
    description: `주요 갈등 반응은 '${analysis.topTypeLabel}'로 나타났습니다. 이는 고정된 성격 유형이 아니라 부담이 생겼을 때 나타날 수 있는 반응을 요약한 것입니다.`,
    points: cycle.map((item, index) => `${index + 1}. ${item}`),
  };
}

function resourcesSection(insights) {
  return {
    title: "우리 관계 이해하기",
    description: "관계의 가능성은 갈등이 없는지보다 어려울 때 다시 사용할 수 있는 보호 요인과 반복을 멈출 수 있는 행동이 있는지에서 확인할 수 있습니다.",
    points: [
      insights.strengths.length
        ? `보호 요인: ${insights.strengths.length}개의 비교적 안정적인 반응이 확인됐습니다. 감정을 듣는 태도, 약속을 지키는 행동, 다시 연결하는 시도를 구체적으로 인정하고 반복해보세요.`
        : "보호 요인: 작은 약속을 지키고 감정을 끝까지 듣는 행동부터 새 보호 요인으로 만들어보세요.",
      insights.concerns.length
        ? `주의 요인: ${insights.concerns.length}개의 조율 신호가 확인됐습니다. 상대의 의도를 추측하기보다 같은 상황에서 행동이 달라지는지 확인하세요.`
        : "주의 요인: 강한 위험 신호는 두드러지지 않았지만 평온할 때 돈, 가족, 개인 시간, 미래 계획을 예방적으로 합의하는 것이 좋습니다.",
      "회복을 돕는 신호: 문제를 인정함, 감정을 반박하기 전에 들음, 구체적인 행동을 합의함, 정한 행동이 2주 이상 반복됨.",
      "회복을 방해하는 신호: 사과 뒤 같은 행동 반복, 모든 책임을 상대에게 돌림, 합의한 점검을 계속 미룸.",
    ],
  };
}

function prioritySection(areas, insights) {
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  const actions = {
    emotion: "감정을 설명한 뒤 상대가 이해한 내용을 한 문장으로 요약하게 해보세요.",
    reality: "생활, 시간, 책임 중 가장 부담이 큰 한 가지를 골라 누가 언제 무엇을 할지 정해보세요.",
    stability: "갈등이 커질 때 사용할 중단 문장과 대화를 다시 시작할 시간을 미리 합의해보세요.",
    future: "가장 중요한 미래 주제 하나를 골라 원하는 방향, 가능한 시기, 어려운 조건을 각각 말해보세요.",
  };
  return {
    title: "지금 가장 필요한 변화",
    description: insights.concerns.length
      ? `현재는 '${weakest.label}' 영역을 가장 먼저 다루는 것이 좋습니다. 감정을 더 길게 설명하는 것보다 한 번 정한 행동이 실제로 지켜지는 경험을 만드는 것이 우선입니다.`
      : `현재 가장 낮은 영역은 '${weakest.label}'이지만 강한 위험 신호라기보다 예방적으로 조율할 주제에 가깝습니다.`,
    points: [`이번 주 우선 과제: ${actions[weakest.key]}`, "확인 기준: 누가 언제 무엇을 하기로 했는지 명확하고 그 행동이 실제로 반복되었는지 확인합니다."],
  };
}

function conversationSection(profile) {
  return {
    title: "대화를 시작하는 방법",
    description: "감정 확인과 문제 해결을 한꺼번에 하려 하면 대화가 쉽게 방어적으로 흐를 수 있습니다. 사실, 감정, 의미, 요청을 나눠 짧게 말해보세요.",
    points: [
      "시작: '지금 당장 결론을 내리자는 뜻은 아니야. 이 문제가 나에게 왜 중요한지 먼저 설명하고 네 생각도 정확히 듣고 싶어.'",
      "감정: '이야기가 미뤄질 때 나는 우리 관계가 같은 방향으로 가는지 확인하기 어렵게 느껴져.'",
      "확인: '내 말을 듣고 어떤 뜻으로 이해했는지 먼저 이야기해줄래?'",
      "요청: '막연히 잘하겠다고 하기보다 다음에 같은 상황이 오면 우리가 각각 할 행동 하나를 정했으면 좋겠어.'",
      ...(profile.scripts ?? []).slice(0, 2),
    ],
  };
}

const sayThisSection = {
  title: "이렇게 말해보세요",
  description: "비난은 상대의 방어를 키우기 쉽습니다. 행동과 영향, 필요한 요청을 분리해서 말하면 대화의 초점을 유지하기 좋습니다.",
  points: [
    "'넌 항상 그래' 대신 → '이 상황이 반복되면 내 요구가 중요하게 받아들여지지 않는다고 느껴.'",
    "'내가 몇 번을 말해야 해?' 대신 → '지금 해결책보다 내 마음을 먼저 이해해줬으면 좋겠어.'",
    "'결국 내가 중요하지 않은 거지?' 대신 → '이 일이 나에게 어떤 의미였는지 설명하고 다음에는 어떤 행동이 필요할지 함께 정하고 싶어.'",
  ],
};

function questionsSection(areas) {
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  return {
    title: "함께 확인해볼 질문",
    description: "한 번에 모두 답하려 하기보다 가장 마음에 걸리는 질문 하나를 골라 20분 이내로 이야기해보세요.",
    points: [
      "내가 사랑받는다고 느끼는 구체적인 행동은 무엇인가요?",
      "갈등이 생겼을 때 내가 가장 두려워하는 것은 무엇인가요?",
      `현재 '${weakest.label}' 영역에서 상대에게 바라는 행동 한 가지는 무엇인가요?`,
      "앞으로 2주 동안 서로가 실제로 확인할 수 있는 변화는 무엇인가요?",
    ],
  };
}

function twoWeekSection(profile, areas) {
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  return {
    title: "2주 실천 가이드",
    description: "목표는 2주 안에 관계를 완전히 바꾸는 것이 아니라 말이 행동으로 이어지는지와 두 사람이 함께 조정할 수 있는지를 확인하는 것입니다.",
    points: [
      `1단계 · 관찰하기(1~3일): '${weakest.label}'과 관련해 감정이 움직인 상황, 원했던 반응, 실제 행동을 기록합니다.`,
      "2단계 · 핵심 욕구 정리(4~6일): 비난 문장 대신 중요하게 여기는 기준과 필요한 행동을 한 문장씩 적습니다.",
      "3단계 · 행동 합의(7~10일): 가장 중요한 주제 하나만 골라 누가 언제 무엇을 할지 정합니다.",
      "4단계 · 변화 확인(11~14일): 약속이 지켜졌는지, 감정적 피로가 줄었는지, 노력이 한쪽에만 몰리지 않았는지 점검합니다.",
      ...(profile.actionExamples ?? []).slice(0, 2).map((example) => `실천 예시: ${example}`),
    ],
  };
}

function finalSection(analysis, areas) {
  const weakest = [...areas].sort((a, b) => a.value - b.value)[0];
  return {
    title: "최종 소견",
    description: relationshipStability(analysis) >= 80
      ? `현재 관계는 갈등 이후 다시 연결될 수 있는 힘이 비교적 충분합니다. 앞으로의 핵심은 안정성을 다시 증명하는 것이 아니라 그 안정감을 '${weakest.label}' 영역의 구체적인 행동과 합의로 확장하는 것입니다.`
      : "현재 관계에는 회복 가능성과 조율 과제가 함께 보입니다. 감정의 크기보다 존중과 책임, 합의한 행동이 실제로 반복되는지를 기준으로 변화를 확인하는 것이 중요합니다.",
    points: ["좋은 관계는 갈등이 전혀 없는 관계보다 불편을 안전하게 말하고 작은 합의를 행동으로 이어갈 수 있는 관계에 가깝습니다.", "이 리포트는 진단이나 치료를 대신하지 않는 참고 자료입니다."],
  };
}

export function buildCounselingReport(analysis, answers = []) {
  const profile = MODE_PROFILES[analysis.relationshipMode] ?? MODE_PROFILES.couple;
  const insights = buildInsights(answers);
  const areas = getAreas(analysis);
  return {
    title: profile.reportTitle,
    eyebrow: profile.eyebrow,
    intro: profile.intro,
    sections: [
      overallSection(analysis, profile, areas),
      ...areas.map(areaSection),
      patternSection(analysis),
      resourcesSection(insights),
      prioritySection(areas, insights),
      conversationSection(profile),
      sayThisSection,
      questionsSection(areas),
      twoWeekSection(profile, areas),
      finalSection(analysis, areas),
    ],
  };
}
