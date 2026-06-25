import { RELATIONSHIP_MODE } from "./config.js";

const contextOption = (id, label) => ({ id, label, effects: {} });

const modeContextQuestions = [
  {
    id: 42,
    modes: [RELATIONSHIP_MODE.COUPLE],
    category: "context",
    prompt:
      "만남, 연락, 약속, 갈등 회복을 위한 관계 유지 노력은 서로 비슷하게 기울이고 있나요?",
    options: [
      contextOption(
        "42-1",
        "서로 비슷하게 먼저 연락하고 계획하며 관계를 돌봐요"
      ),
      contextOption(
        "42-2",
        "시기마다 차이는 있지만 대체로 균형이 맞아요"
      ),
      contextOption(
        "42-3",
        "한쪽이 대부분 먼저 움직여야 관계가 유지돼요"
      ),
      contextOption(
        "42-4",
        "내가 노력을 멈추면 관계도 멈출 것 같아요"
      ),
    ],
  },
  {
    id: 43,
    modes: [RELATIONSHIP_MODE.COUPLE],
    category: "context",
    prompt:
      "동거·결혼 등 다음 단계에 필요한 주거, 경제, 역할 조건을 현실적으로 함께 검토할 수 있나요?",
    options: [
      contextOption(
        "43-1",
        "구체적인 조건과 역할까지 함께 이야기할 수 있어요"
      ),
      contextOption(
        "43-2",
        "큰 방향은 맞지만 현실 조건은 더 정리해야 해요"
      ),
      contextOption(
        "43-3",
        "이야기를 꺼내면 부담스러워하거나 자주 미뤄져요"
      ),
      contextOption(
        "43-4",
        "다음 단계의 조건을 함께 맞추기 어렵다고 느껴요"
      ),
    ],
  },
  {
    id: 44,
    modes: [RELATIONSHIP_MODE.MARRIED],
    category: "context",
    prompt:
      "가사·육아뿐 아니라 일정 관리, 가족 챙김, 정서적 돌봄 같은 보이지 않는 부담도 공정하게 나뉘나요?",
    options: [
      contextOption(
        "44-1",
        "보이는 일과 보이지 않는 부담까지 서로 알아보고 나눠요"
      ),
      contextOption(
        "44-2",
        "한쪽 부담이 조금 더 크지만 조정할 수 있어요"
      ),
      contextOption(
        "44-3",
        "한쪽이 대부분 기억하고 챙기느라 지쳐 있어요"
      ),
      contextOption(
        "44-4",
        "보이지 않는 부담을 인정받지 못해 큰 원망이 쌓였어요"
      ),
    ],
  },
  {
    id: 45,
    modes: [RELATIONSHIP_MODE.MARRIED],
    category: "context",
    prompt:
      "부모나 생활 공동체의 역할을 넘어, 연인·배우자로서의 대화와 친밀감을 유지하고 있나요?",
    options: [
      contextOption(
        "45-1",
        "일상 속에서도 둘만의 대화와 애정 표현을 유지해요"
      ),
      contextOption(
        "45-2",
        "시간은 부족하지만 서로 연결되어 있다는 느낌은 있어요"
      ),
      contextOption(
        "45-3",
        "생활 이야기만 남고 부부만의 친밀감은 많이 줄었어요"
      ),
      contextOption(
        "45-4",
        "배우자보다 동거인이나 공동 양육자처럼 느껴질 때가 많아요"
      ),
    ],
  },
];

export function getModeContextQuestions(mode) {
  if (!mode) return [];

  return modeContextQuestions.filter((question) =>
    question.modes.includes(mode)
  );
}
