export const PLAN = {
  FREE: "FREE",
  PREMIUM: "PREMIUM",
};

export const RELATIONSHIP_MODE = {
  COUPLE: "couple",
  MARRIED: "married",
};

export const RELATIONSHIP_MODE_META = {
  [RELATIONSHIP_MODE.COUPLE]: {
    label: "연인",
    shortLabel: "연인 버전",
    title: "연인 관계 리포트",
    description:
      "연락과 친밀감, 관계 유지 노력의 상호성, 신뢰 경계, 결혼과 다음 단계 준비도를 중심으로 봅니다.",
  },
  [RELATIONSHIP_MODE.MARRIED]: {
    label: "부부",
    shortLabel: "부부 버전",
    title: "부부 관계 리포트",
    description:
      "배우자 친밀감, 가사와 보이지 않는 노동, 경제·자녀·양가 경계, 장기 생활 운영을 중심으로 봅니다.",
  },
};

export const APP_COPY = {
  brand: "우리 관계 진단",
  eyebrow: "RELATIONSHIP REPORT",
  title: "관계 지속성 리포트",
  subtitle:
    "관계의 감정 상태와 안정성, 갈등 패턴, 미래 방향성을 살펴봅니다.",
  footer:
    "이 결과는 감정 상태, 관계 안정성, 갈등 패턴, 미래 방향성을 바탕으로 구성한 참고용 리포트입니다.",
};

export const CATEGORY_META = {
  context: { label: "관계 맥락", shortLabel: "Context" },
  emotion: { label: "감정 상태", shortLabel: "Emotion" },
  stability: { label: "관계 안정성", shortLabel: "Stability" },
  conflict: { label: "갈등 패턴", shortLabel: "Conflict" },
  future: { label: "미래 방향성", shortLabel: "Future" },
};

export const TYPE_LABELS = {
  avoidant: "회피형",
  explosive: "폭발형",
  cold: "냉담형",
  pursuer: "추적형",
  stable: "안정형",
  mixed: "복합형",
};

export const SHARE = {
  title: "관계 지속성 리포트 결과",
  fileName: "relationship-analyzer-result.png",
};
