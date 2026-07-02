import { expect, test } from "@playwright/test";
import {
  GAME_2048_DIRECTION,
} from "../src/features/mini-games/game-2048/game2048.constants.js";
import {
  addRandomTile,
  createEmptyBoard,
  getMaxTile,
  hasAvailableMove,
  hasReachedTarget,
  mergeLine,
  moveBoard,
} from "../src/features/mini-games/game-2048/game2048.logic.js";

function randomSequence(values) {
  let index = 0;
  return () => values[index++] ?? values[values.length - 1] ?? 0;
}

test.describe("2048 pure logic", () => {
  test("merges a line without double merging a tile", () => {
    expect(mergeLine([2, 2, 2, 2])).toEqual({ line: [4, 4, 0, 0], scoreDelta: 8 });
    expect(mergeLine([4, 4, 8, 0])).toEqual({ line: [8, 8, 0, 0], scoreDelta: 8 });
    expect(mergeLine([2, 0, 2, 2])).toEqual({ line: [4, 2, 0, 0], scoreDelta: 4 });
    expect(mergeLine([2, 2, 4, 4])).toEqual({ line: [4, 8, 0, 0], scoreDelta: 12 });
  });

  test("moves left and right with score delta and immutability", () => {
    const board = [
      2, 2, 2, 2,
      4, 4, 8, 0,
      2, 0, 2, 2,
      0, 0, 0, 0,
    ];
    const original = [...board];

    expect(moveBoard(board, GAME_2048_DIRECTION.LEFT)).toEqual({
      board: [
        4, 4, 0, 0,
        8, 8, 0, 0,
        4, 2, 0, 0,
        0, 0, 0, 0,
      ],
      changed: true,
      scoreDelta: 20,
    });
    expect(board).toEqual(original);

    expect(moveBoard(board, GAME_2048_DIRECTION.RIGHT)).toEqual({
      board: [
        0, 0, 4, 4,
        0, 0, 8, 8,
        0, 0, 2, 4,
        0, 0, 0, 0,
      ],
      changed: true,
      scoreDelta: 20,
    });
  });

  test("moves up and down and detects unchanged boards", () => {
    const board = [
      2, 0, 0, 0,
      2, 4, 0, 0,
      4, 4, 0, 0,
      0, 0, 0, 0,
    ];

    expect(moveBoard(board, GAME_2048_DIRECTION.UP)).toEqual({
      board: [
        4, 8, 0, 0,
        4, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
      ],
      changed: true,
      scoreDelta: 12,
    });

    expect(moveBoard(board, GAME_2048_DIRECTION.DOWN)).toEqual({
      board: [
        0, 0, 0, 0,
        0, 0, 0, 0,
        4, 0, 0, 0,
        4, 8, 0, 0,
      ],
      changed: true,
      scoreDelta: 12,
    });

    const unchanged = [
      2, 4, 8, 16,
      32, 64, 128, 256,
      512, 1024, 2048, 4096,
      8192, 16384, 32768, 65536,
    ];

    expect(moveBoard(unchanged, GAME_2048_DIRECTION.LEFT)).toEqual({
      board: unchanged,
      changed: false,
      scoreDelta: 0,
    });
  });

  test("adds random tiles only to empty cells with deterministic random values", () => {
    const board = createEmptyBoard();
    board[0] = 2;
    const next = addRandomTile(board, randomSequence([0, 0.95]));

    expect(board[1]).toBe(0);
    expect(next[0]).toBe(2);
    expect(next[1]).toBe(4);
    expect(next.filter(Boolean)).toHaveLength(2);

    const nextTwo = addRandomTile(next, randomSequence([0.99, 0.1]));
    expect(nextTwo[15]).toBe(2);

    const fullBoard = Array.from({ length: 16 }, (_, index) => 2 ** ((index % 11) + 1));
    expect(addRandomTile(fullBoard, randomSequence([0, 0]))).toEqual(fullBoard);
  });

  test("detects available moves, game over boards, max tile, and target reach", () => {
    expect(hasAvailableMove([
      2, 4, 8, 16,
      32, 0, 128, 256,
      512, 1024, 2048, 4096,
      8192, 16384, 32768, 65536,
    ])).toBe(true);

    expect(hasAvailableMove([
      2, 4, 8, 16,
      32, 64, 128, 256,
      512, 1024, 2048, 4096,
      8192, 16384, 32768, 65536,
    ])).toBe(false);

    expect(hasAvailableMove([
      2, 4, 8, 16,
      32, 64, 128, 256,
      512, 1024, 2048, 4096,
      8192, 16384, 32768, 32768,
    ])).toBe(true);

    const board = [
      2, 4, 8, 16,
      32, 64, 128, 256,
      512, 1024, 2048, 4096,
      8192, 16384, 32768, 65536,
    ];
    expect(getMaxTile(board)).toBe(65536);
    expect(hasReachedTarget(board, 2048)).toBe(true);
    expect(hasReachedTarget(board, 131072)).toBe(false);
  });
});
