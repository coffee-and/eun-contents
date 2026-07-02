import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button.jsx";
import { GameStage } from "../../../shared/components/game/GameStage.jsx";
import {
  BOARD_SIZE,
  GAME_2048_BEST_SCORE_KEY,
  GAME_2048_DIRECTION,
  GAME_2048_PHASE,
  SWIPE_AXIS_DELTA,
  SWIPE_THRESHOLD,
  TARGET_TILES,
} from "./game2048.constants.js";
import {
  addRandomTile,
  createEmptyBoard,
  createInitialBoard,
  getEmptyCellCount,
  getMaxTile,
  hasAvailableMove,
  hasReachedTarget,
  moveBoard,
} from "./game2048.logic.js";
import "./game-2048.css";

const DEFAULT_GAME_META = {
  eyebrow: "NUMBER / MERGE",
  title: "2048",
  description: "목표 타일을 차례로 완성해 2048에 도전하세요.",
};

const KEY_TO_DIRECTION = {
  ArrowUp: GAME_2048_DIRECTION.UP,
  ArrowRight: GAME_2048_DIRECTION.RIGHT,
  ArrowDown: GAME_2048_DIRECTION.DOWN,
  ArrowLeft: GAME_2048_DIRECTION.LEFT,
  w: GAME_2048_DIRECTION.UP,
  W: GAME_2048_DIRECTION.UP,
  d: GAME_2048_DIRECTION.RIGHT,
  D: GAME_2048_DIRECTION.RIGHT,
  s: GAME_2048_DIRECTION.DOWN,
  S: GAME_2048_DIRECTION.DOWN,
  a: GAME_2048_DIRECTION.LEFT,
  A: GAME_2048_DIRECTION.LEFT,
};

function getBestScore() {
  try {
    const value = Number(window.localStorage.getItem(GAME_2048_BEST_SCORE_KEY));
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(GAME_2048_BEST_SCORE_KEY, String(score));
  } catch {
    return;
  }
}

function formatNumber(value) {
  return value.toLocaleString("ko-KR");
}

function getTileSizeClass(value) {
  if (value >= 16384) return "is-tiny";
  if (value >= 1024) return "is-small";
  if (value >= 128) return "is-medium";
  return "";
}

function getPhaseStatus(phase, round, currentTarget) {
  if (phase === GAME_2048_PHASE.IDLE) return "시작 전";
  if (phase === GAME_2048_PHASE.MILESTONE_CLEAR) return `라운드 ${round} 완료`;
  if (phase === GAME_2048_PHASE.COMPLETED) return "2048 완료";
  if (phase === GAME_2048_PHASE.ENDLESS) return "2048 완료, 계속 플레이 중";
  if (phase === GAME_2048_PHASE.GAME_OVER) return "게임 오버";
  return `라운드 ${round}, 목표 ${currentTarget}`;
}

function getNextTargetLabel(targetIndex) {
  return TARGET_TILES[targetIndex + 1] ?? TARGET_TILES[TARGET_TILES.length - 1];
}

export function Game2048({ game = DEFAULT_GAME_META }) {
  const [board, setBoard] = useState(() => createEmptyBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => getBestScore());
  const [targetIndex, setTargetIndex] = useState(0);
  const [phase, setPhase] = useState(GAME_2048_PHASE.IDLE);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const boardRef = useRef(board);
  const scoreRef = useRef(score);
  const bestScoreRef = useRef(bestScore);
  const targetIndexRef = useRef(targetIndex);
  const phaseRef = useRef(phase);
  const stageContentRef = useRef(null);
  const boardElementRef = useRef(null);
  const startButtonRef = useRef(null);
  const milestoneButtonRef = useRef(null);
  const completedContinueButtonRef = useRef(null);
  const gameOverButtonRef = useRef(null);
  const resetCancelButtonRef = useRef(null);
  const pointerStartRef = useRef(null);

  const round = targetIndex + 1;
  const currentTarget = TARGET_TILES[targetIndex] ?? TARGET_TILES[TARGET_TILES.length - 1];
  const maxTile = useMemo(() => getMaxTile(board), [board]);
  const emptyCellCount = useMemo(() => getEmptyCellCount(board), [board]);
  const phaseStatus = getPhaseStatus(phase, round, currentTarget);
  const canMoveBoard =
    (phase === GAME_2048_PHASE.PLAYING || phase === GAME_2048_PHASE.ENDLESS) &&
    !isResetConfirmOpen;
  const hasStarted = phase !== GAME_2048_PHASE.IDLE;
  const isStageCovered =
    isResetConfirmOpen ||
    phase === GAME_2048_PHASE.MILESTONE_CLEAR ||
    phase === GAME_2048_PHASE.COMPLETED ||
    phase === GAME_2048_PHASE.GAME_OVER;

  boardRef.current = board;
  scoreRef.current = score;
  bestScoreRef.current = bestScore;
  targetIndexRef.current = targetIndex;
  phaseRef.current = phase;

  useEffect(() => {
    if (!stageContentRef.current) return;
    stageContentRef.current.inert = isStageCovered;
  }, [isStageCovered]);

  useEffect(() => {
    if (phase === GAME_2048_PHASE.IDLE) {
      startButtonRef.current?.focus();
    }

    if (phase === GAME_2048_PHASE.MILESTONE_CLEAR && !isResetConfirmOpen) {
      milestoneButtonRef.current?.focus();
    }

    if (phase === GAME_2048_PHASE.COMPLETED && !isResetConfirmOpen) {
      completedContinueButtonRef.current?.focus();
    }

    if (phase === GAME_2048_PHASE.GAME_OVER && !isResetConfirmOpen) {
      gameOverButtonRef.current?.focus();
    }
  }, [isResetConfirmOpen, phase]);

  useEffect(() => {
    if (isResetConfirmOpen) {
      resetCancelButtonRef.current?.focus();
    }
  }, [isResetConfirmOpen]);

  function focusBoard() {
    window.setTimeout(() => boardElementRef.current?.focus(), 0);
  }

  function updateBestScore(nextScore) {
    if (nextScore <= bestScoreRef.current) return;
    bestScoreRef.current = nextScore;
    setBestScore(nextScore);
    saveBestScore(nextScore);
  }

  function startNewGame() {
    const nextBoard = createInitialBoard();
    setBoard(nextBoard);
    setScore(0);
    setTargetIndex(0);
    setIsResetConfirmOpen(false);
    setPhase(GAME_2048_PHASE.PLAYING);
    focusBoard();
  }

  function requestNewGame() {
    if (phaseRef.current === GAME_2048_PHASE.IDLE) {
      startNewGame();
      return;
    }

    if (
      phaseRef.current === GAME_2048_PHASE.GAME_OVER ||
      phaseRef.current === GAME_2048_PHASE.COMPLETED
    ) {
      startNewGame();
      return;
    }

    setIsResetConfirmOpen(true);
  }

  function closeResetConfirm() {
    setIsResetConfirmOpen(false);

    window.setTimeout(() => {
      if (
        phaseRef.current === GAME_2048_PHASE.PLAYING ||
        phaseRef.current === GAME_2048_PHASE.ENDLESS
      ) {
        boardElementRef.current?.focus();
        return;
      }

      if (phaseRef.current === GAME_2048_PHASE.MILESTONE_CLEAR) {
        milestoneButtonRef.current?.focus();
      }
    }, 0);
  }

  function finishMove(nextBoard, scoreDelta) {
    const nextScore = scoreRef.current + scoreDelta;
    setBoard(nextBoard);
    setScore(nextScore);
    updateBestScore(nextScore);

    if (
      phaseRef.current !== GAME_2048_PHASE.ENDLESS &&
      hasReachedTarget(nextBoard, TARGET_TILES[targetIndexRef.current])
    ) {
      if (targetIndexRef.current === TARGET_TILES.length - 1) {
        setPhase(GAME_2048_PHASE.COMPLETED);
        return;
      }

      setPhase(GAME_2048_PHASE.MILESTONE_CLEAR);
      return;
    }

    if (!hasAvailableMove(nextBoard)) {
      setPhase(GAME_2048_PHASE.GAME_OVER);
    }
  }

  function handleMove(direction) {
    if (!canMoveBoard) return;

    const result = moveBoard(boardRef.current, direction);
    if (!result.changed) {
      if (!hasAvailableMove(boardRef.current)) {
        setPhase(GAME_2048_PHASE.GAME_OVER);
      }
      return;
    }

    finishMove(addRandomTile(result.board), result.scoreDelta);
  }

  function handleBoardKeyDown(event) {
    const direction = KEY_TO_DIRECTION[event.key];
    if (!direction || !canMoveBoard) return;

    event.preventDefault();
    handleMove(direction);
  }

  function handlePointerDown(event) {
    if (!canMoveBoard) return;
    pointerStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  function handlePointerUp(event) {
    if (!canMoveBoard || !pointerStartRef.current) return;

    const deltaX = event.clientX - pointerStartRef.current.x;
    const deltaY = event.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const maxDelta = Math.max(absX, absY);
    const axisDelta = Math.abs(absX - absY);

    if (maxDelta < SWIPE_THRESHOLD || axisDelta < SWIPE_AXIS_DELTA) return;

    if (absX > absY) {
      handleMove(deltaX > 0 ? GAME_2048_DIRECTION.RIGHT : GAME_2048_DIRECTION.LEFT);
      return;
    }

    handleMove(deltaY > 0 ? GAME_2048_DIRECTION.DOWN : GAME_2048_DIRECTION.UP);
  }

  function handlePointerCancel() {
    pointerStartRef.current = null;
  }

  function continueToNextTarget() {
    const nextIndex = targetIndexRef.current + 1;
    setTargetIndex(nextIndex);

    if (hasReachedTarget(boardRef.current, TARGET_TILES[nextIndex])) {
      if (nextIndex === TARGET_TILES.length - 1) {
        setPhase(GAME_2048_PHASE.COMPLETED);
        return;
      }

      setPhase(GAME_2048_PHASE.MILESTONE_CLEAR);
      return;
    }

    if (!hasAvailableMove(boardRef.current)) {
      setPhase(GAME_2048_PHASE.GAME_OVER);
      return;
    }

    setPhase(GAME_2048_PHASE.PLAYING);
    focusBoard();
  }

  function continueEndless() {
    if (!hasAvailableMove(boardRef.current)) {
      setPhase(GAME_2048_PHASE.GAME_OVER);
      return;
    }

    setPhase(GAME_2048_PHASE.ENDLESS);
    focusBoard();
  }

  const gameActions = hasStarted ? (
    <Button type="button" variant="secondary" onClick={requestNewGame}>
      새 게임
    </Button>
  ) : null;

  return (
    <GameStage
      className="game-2048"
      eyebrow={game.eyebrow}
      title={game.title}
      description={game.description}
      actions={gameActions}
      fullscreenEnabled
      ariaLabel="2048 게임"
    >
      <div
        ref={stageContentRef}
        className="game-2048__stage-content"
        aria-hidden={isStageCovered ? "true" : undefined}
      >
          {phase === GAME_2048_PHASE.IDLE ? (
            <section className="game-2048__idle" aria-labelledby="game-2048-start-title">
              <p className="game-2048__idle-round">ROUND 1</p>
              <h3 id="game-2048-start-title">TARGET 128</h3>
              <p>같은 숫자를 합쳐 목표 타일을 만들어 보세요.</p>
              <Button ref={startButtonRef} type="button" onClick={startNewGame}>
                게임 시작
              </Button>
            </section>
          ) : (
            <>
              <section className="game-2048__meta" aria-label="2048 게임 정보">
                <div>
                  <span>ROUND</span>
                  <strong>{phase === GAME_2048_PHASE.ENDLESS ? "COMPLETE" : round}</strong>
                </div>
                <div>
                  <span>{phase === GAME_2048_PHASE.ENDLESS ? "MODE" : "TARGET"}</span>
                  <strong>{phase === GAME_2048_PHASE.ENDLESS ? "ENDLESS" : formatNumber(currentTarget)}</strong>
                </div>
                <div>
                  <span>SCORE</span>
                  <strong>{formatNumber(score)}</strong>
                </div>
                <div>
                  <span>BEST</span>
                  <strong>{formatNumber(bestScore)}</strong>
                </div>
              </section>

              <p className="visually-hidden" aria-live="polite">
                {phaseStatus}. 현재 점수 {formatNumber(score)}점, 최고 점수 {formatNumber(bestScore)}점, 최대 타일 {formatNumber(maxTile)}.
              </p>

              <div
                ref={boardElementRef}
                className="game-2048__board"
                role="grid"
                tabIndex={0}
                aria-label="2048 게임 보드. 방향키 또는 스와이프로 타일을 이동하세요."
                aria-rowcount={BOARD_SIZE}
                aria-colcount={BOARD_SIZE}
                onKeyDown={handleBoardKeyDown}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                {board.map((value, index) => {
                  const row = Math.floor(index / BOARD_SIZE) + 1;
                  const column = (index % BOARD_SIZE) + 1;
                  const label = value ? `${row}행 ${column}열, 숫자 ${value}` : `${row}행 ${column}열, 빈칸`;

                  return (
                    <div
                      className={`game-2048__cell ${value ? `has-value ${getTileSizeClass(value)}` : "is-empty"}`}
                      data-value={value}
                      role="gridcell"
                      aria-label={label}
                      key={`${row}-${column}`}
                    >
                      {value ? <span>{value}</span> : null}
                    </div>
                  );
                })}
              </div>

              <p className="game-2048__hint">
                방향키 또는 스와이프로 이동하세요. 빈칸 {emptyCellCount}칸 · 최대 타일 {formatNumber(maxTile)}
              </p>
            </>
          )}
      </div>

      {isStageCovered ? (
        <div className="game-2048__overlay-layer">
            {phase === GAME_2048_PHASE.MILESTONE_CLEAR && !isResetConfirmOpen ? (
              <div className="game-2048__overlay" role="dialog" aria-labelledby="game-2048-milestone-title">
                <div className="game-2048__modal">
                  <p className="game-2048__modal-eyebrow">ROUND {round} CLEAR</p>
                  <h3 id="game-2048-milestone-title">{formatNumber(currentTarget)} 타일을 완성했어요.</h3>
                  <p>NEXT TARGET</p>
                  <strong>{formatNumber(getNextTargetLabel(targetIndex))}</strong>
                  <Button ref={milestoneButtonRef} type="button" onClick={continueToNextTarget}>
                    다음 목표 {formatNumber(getNextTargetLabel(targetIndex))}
                  </Button>
                </div>
              </div>
            ) : null}

            {phase === GAME_2048_PHASE.COMPLETED && !isResetConfirmOpen ? (
              <div className="game-2048__overlay" role="dialog" aria-labelledby="game-2048-complete-title">
                <div className="game-2048__modal">
                  <h3 id="game-2048-complete-title">2048 COMPLETE</h3>
                  <p>모든 목표를 달성했어요.</p>
                  <p>최종 목표를 완성했습니다.</p>
                  <div className="game-2048__modal-actions">
                    <Button ref={completedContinueButtonRef} type="button" onClick={continueEndless}>
                      계속 플레이
                    </Button>
                    <Button type="button" variant="secondary" onClick={startNewGame}>
                      새 게임
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            {phase === GAME_2048_PHASE.GAME_OVER && !isResetConfirmOpen ? (
              <div className="game-2048__overlay" role="dialog" aria-labelledby="game-2048-game-over-title">
                <div className="game-2048__modal">
                  <h3 id="game-2048-game-over-title">GAME OVER</h3>
                  <p>최종 점수</p>
                  <strong>{formatNumber(score)}</strong>
                  <p>최대 타일 {formatNumber(maxTile)}</p>
                  <Button ref={gameOverButtonRef} type="button" onClick={startNewGame}>
                    새 게임
                  </Button>
                </div>
              </div>
            ) : null}

            {isResetConfirmOpen ? (
              <div className="game-2048__overlay" role="dialog" aria-labelledby="game-2048-reset-title">
                <div className="game-2048__modal">
                  <h3 id="game-2048-reset-title">새 게임을 시작할까요?</h3>
                  <p>현재 보드와 점수가 초기화됩니다. 최고 점수는 유지됩니다.</p>
                  <div className="game-2048__modal-actions">
                    <Button ref={resetCancelButtonRef} type="button" variant="secondary" onClick={closeResetConfirm}>
                      계속 플레이
                    </Button>
                    <Button type="button" onClick={startNewGame}>
                      새 게임
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
        </div>
      ) : null}
    </GameStage>
  );
}
