export const MINI_GAME_STATUS = {
  READY: "ready",
  COMING_SOON: "coming-soon",
};

export const MINI_GAMES = [
  {
    id: "memory",
    title: "기억력 게임",
    eyebrow: "MEMORY / ORDER",
    description: "이모지 순서를 기억해 선택하세요.",
    status: MINI_GAME_STATUS.READY,
    statusLabel: "구현됨",
  },
  {
    id: "2048",
    title: "2048",
    eyebrow: "NUMBER / MERGE",
    description: "같은 숫자를 합쳐 2048을 완성하세요.",
    status: MINI_GAME_STATUS.READY,
    statusLabel: "구현됨",
  },
  {
    id: "gomoku",
    title: "오목",
    eyebrow: "BOARD / FIVE",
    description: "다섯 개의 돌을 먼저 이어보세요.",
    status: MINI_GAME_STATUS.COMING_SOON,
    statusLabel: "준비 중",
  },
  {
    id: "sudoku",
    title: "스도쿠",
    eyebrow: "NUMBER / LOGIC",
    description: "가로·세로·영역의 숫자를 완성하세요.",
    status: MINI_GAME_STATUS.COMING_SOON,
    statusLabel: "준비 중",
  },
  {
    id: "nonogram",
    title: "노노그램",
    eyebrow: "PIXEL / LOGIC",
    description: "숫자 힌트로 숨겨진 그림을 완성하세요.",
    status: MINI_GAME_STATUS.COMING_SOON,
    statusLabel: "준비 중",
  },
  {
    id: "one-stroke",
    title: "한붓그리기",
    eyebrow: "LINE / TRACE",
    description: "모든 선을 한 번씩 지나 완성하세요.",
    status: MINI_GAME_STATUS.COMING_SOON,
    statusLabel: "준비 중",
  },
];
