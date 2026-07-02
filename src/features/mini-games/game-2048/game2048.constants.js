export const GAME_2048_BEST_SCORE_KEY = "eunContents.game2048.bestScore";

export const BOARD_SIZE = 4;
export const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;
export const TARGET_TILES = [128, 256, 512, 1024, 2048];
export const SWIPE_THRESHOLD = 28;
export const SWIPE_AXIS_DELTA = 8;

export const GAME_2048_PHASE = {
  IDLE: "idle",
  PLAYING: "playing",
  MILESTONE_CLEAR: "milestone-clear",
  COMPLETED: "completed",
  ENDLESS: "endless",
  GAME_OVER: "game-over",
};

export const GAME_2048_DIRECTION = {
  UP: "up",
  RIGHT: "right",
  DOWN: "down",
  LEFT: "left",
};
