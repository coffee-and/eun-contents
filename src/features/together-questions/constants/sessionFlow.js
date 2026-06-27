// Together Questions 화면 단계와 입력 제한값을 관리합니다.
export const SESSION_STEPS = {
  START: "start",
  CREATOR_ANSWER: "creator-answer",
  CREATOR_DONE: "creator-done",
  INVITE: "invite",
  INVITEE_ANSWER: "invitee-answer",
  WAITING: "waiting",
  RESULT: "result",
  ERROR: "error",
};

export const PARTICIPANT_ROLES = {
  CREATOR: "creator",
  INVITEE: "invitee",
};

export const ANSWER_LIMITS = {
  displayName: 24,
  answer: 1000,
};

export const EMPTY_ANSWER_TEXT = "아직 적지 않았어요.";
