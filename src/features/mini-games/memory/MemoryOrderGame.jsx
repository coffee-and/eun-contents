import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button.jsx";
import { GameStage } from "../../../shared/components/game/GameStage.jsx";
import "./memory-game.css";

const KEY = "eunContents.memoryOrderGame.bestRound";
const COUNTDOWN_LABELS = ["3", "2", "1", "START!"];
const COUNTDOWN_STEP_MS = 1000;
const ROUND_TRANSITION_MS = 900;
const SELECTION_SECONDS_PER_TARGET = 2;

const PHASE = {
  IDLE: "idle",
  COUNTDOWN: "countdown",
  PREVIEW: "preview",
  PLAYING: "playing",
  PAUSED: "paused",
  CLEARED: "cleared",
  FAILED: "failed",
};

const FAILURE_REASON = {
  WRONG: "wrong",
  TIMEOUT: "timeout",
};

const DEFAULT_GAME_META = {
  eyebrow: "MEMORY / ORDER",
  title: "기억력 게임",
  description: "이모지 순서를 기억해 선택하세요.",
};

const SYMBOLS = [
  { id: "tulip", symbol: "🌷", name: "튤립" },
  { id: "sunflower", symbol: "🌻", name: "해바라기" },
  { id: "clover", symbol: "🍀", name: "네잎클로버" },
  { id: "cherry", symbol: "🍒", name: "체리" },
  { id: "cloud", symbol: "☁️", name: "구름" },
  { id: "moon", symbol: "🌙", name: "초승달" },
  { id: "star", symbol: "⭐", name: "별" },
  { id: "heart", symbol: "❤️", name: "하트" },
];

function shuffle(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function getBest() {
  const value = Number(window.localStorage.getItem(KEY));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function config(round) {
  if (round >= 17) return { count: 20, seconds: 2, duplicates: true };
  if (round >= 14) return { count: 15, seconds: 2, duplicates: true };
  if (round >= 11) return { count: 12, seconds: 3, duplicates: true };
  if (round >= 8) return { count: 10, seconds: 3, duplicates: true };
  if (round >= 6) return { count: 8, seconds: 3, duplicates: false };
  return { count: 5, seconds: round <= 3 ? 4 : 3, duplicates: false };
}

function makeRound(round) {
  const rule = config(round);
  const sequence = rule.duplicates
    ? Array.from({ length: rule.count }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
    : shuffle(SYMBOLS).slice(0, rule.count);
  const cards = shuffle(
    sequence.map((item, index) => ({
      ...item,
      cardId: `${round}-${item.id}-${index}`,
    }))
  );

  return { ...rule, sequence, cards };
}

function formatTimer(milliseconds) {
  return Math.max(0, milliseconds / 1000).toFixed(2);
}

function getSelectionDuration(targetCount) {
  return targetCount * SELECTION_SECONDS_PER_TARGET * 1000;
}

function MemorySymbol({ value }) {
  return (
    <span className="memory-symbol" aria-hidden="true">
      {value}
    </span>
  );
}

function StopwatchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="memory-game__clock-icon"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M12 8v5l3 2M9 3h6M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function MemoryOrderGame({ game = DEFAULT_GAME_META }) {
  const initialData = useMemo(() => makeRound(1), []);
  const [round, setRound] = useState(1);
  const [data, setData] = useState(initialData);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [best, setBest] = useState(() => getBest());
  const [remainingMs, setRemainingMs] = useState(getSelectionDuration(initialData.sequence.length));
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [failureReason, setFailureReason] = useState(null);
  const [didBreakRecordThisAttempt, setDidBreakRecordThisAttempt] = useState(false);

  const activeTimerRef = useRef(null);
  const roundTransitionTimerRef = useRef(null);
  const previousPhaseRef = useRef(null);
  const resolvingRef = useRef(false);
  const phaseRef = useRef(phase);
  const roundRef = useRef(round);
  const dataRef = useRef(data);
  const stepRef = useRef(step);
  const countdownIndexRef = useRef(countdownIndex);
  const selectedSetRef = useRef(new Set());
  const stageContentRef = useRef(null);
  const pauseButtonRef = useRef(null);
  const resumeButtonRef = useRef(null);
  const retryButtonRef = useRef(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const canPause = phase === PHASE.COUNTDOWN || phase === PHASE.PREVIEW || phase === PHASE.PLAYING;
  const isStageCovered = phase === PHASE.COUNTDOWN || phase === PHASE.PAUSED || phase === PHASE.FAILED;
  const shouldShowRound =
    phase === PHASE.COUNTDOWN ||
    phase === PHASE.PREVIEW ||
    phase === PHASE.PLAYING ||
    phase === PHASE.CLEARED;
  const shouldShowTimer = phase === PHASE.PREVIEW || phase === PHASE.PLAYING;
  const timerText = formatTimer(remainingMs);
  const isTimerCritical = remainingMs > 0 && remainingMs <= 3000;
  const isTimerWarning = remainingMs > 0 && remainingMs <= 5000;

  phaseRef.current = phase;
  roundRef.current = round;
  dataRef.current = data;
  stepRef.current = step;
  countdownIndexRef.current = countdownIndex;
  selectedSetRef.current = selectedSet;

  useEffect(() => {
    if (round > best) {
      window.localStorage.setItem(KEY, String(round));
      setBest(round);
      setDidBreakRecordThisAttempt(true);
    }
  }, [best, round]);

  useEffect(() => {
    if (!stageContentRef.current) return;
    stageContentRef.current.inert = isStageCovered;
  }, [isStageCovered]);

  useEffect(() => {
    if (phase === PHASE.PAUSED) {
      resumeButtonRef.current?.focus();
    }

    if (phase === PHASE.FAILED) {
      retryButtonRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => () => clearGameTimers(), []);

  function clearActiveTimer({ preserve = false } = {}) {
    const timer = activeTimerRef.current;
    if (!timer) return;

    window.clearTimeout(timer.timeoutId);
    window.clearInterval(timer.intervalId);

    if (preserve) {
      activeTimerRef.current = {
        ...timer,
        intervalId: null,
        timeoutId: null,
        remainingMs: Math.max(0, timer.deadline - performance.now()),
      };
      return;
    }

    activeTimerRef.current = null;
  }

  function clearRoundTransitionTimer() {
    if (!roundTransitionTimerRef.current) return;
    window.clearTimeout(roundTransitionTimerRef.current);
    roundTransitionTimerRef.current = null;
  }

  function clearGameTimers() {
    clearActiveTimer();
    clearRoundTransitionTimer();
  }

  function runTimer(kind, durationMs) {
    clearActiveTimer();

    const safeDuration = Math.max(0, durationMs);
    const deadline = performance.now() + safeDuration;
    const updateRemaining = () => {
      const next = Math.max(0, deadline - performance.now());
      if (kind === "preview" || kind === "selection") {
        setRemainingMs(next);
      }
    };

    updateRemaining();

    const intervalId = window.setInterval(updateRemaining, 50);
    const timeoutId = window.setTimeout(() => {
      clearActiveTimer();
      handleTimerComplete(kind);
    }, safeDuration);

    activeTimerRef.current = {
      kind,
      deadline,
      durationMs: safeDuration,
      remainingMs: safeDuration,
      intervalId,
      timeoutId,
    };
  }

  function resumeActiveTimer() {
    const timer = activeTimerRef.current;
    if (!timer) return;
    runTimer(timer.kind, timer.remainingMs);
  }

  function handleTimerComplete(kind) {
    if (phaseRef.current === PHASE.PAUSED) return;

    if (kind === "countdown") {
      const nextIndex = countdownIndexRef.current + 1;
      if (nextIndex < COUNTDOWN_LABELS.length) {
        startCountdown(nextIndex, COUNTDOWN_STEP_MS);
        return;
      }
      startPreview();
      return;
    }

    if (kind === "preview") {
      startSelection();
      return;
    }

    if (kind === "selection") {
      failRound(FAILURE_REASON.TIMEOUT);
    }
  }

  function startCountdown(index = 0, durationMs = COUNTDOWN_STEP_MS) {
    setPhase(PHASE.COUNTDOWN);
    phaseRef.current = PHASE.COUNTDOWN;
    setCountdownIndex(index);
    countdownIndexRef.current = index;
    runTimer("countdown", durationMs);
  }

  function startPreview() {
    const nextDuration = dataRef.current.seconds * 1000;
    setPhase(PHASE.PREVIEW);
    phaseRef.current = PHASE.PREVIEW;
    setRemainingMs(nextDuration);
    runTimer("preview", nextDuration);
  }

  function startSelection() {
    const selectionDuration = getSelectionDuration(dataRef.current.sequence.length);
    resolvingRef.current = false;
    setPhase(PHASE.PLAYING);
    phaseRef.current = PHASE.PLAYING;
    setRemainingMs(selectionDuration);
    runTimer("selection", selectionDuration);
  }

  function startRound(nextRound) {
    clearGameTimers();
    resolvingRef.current = false;

    const nextData = makeRound(nextRound);
    setRound(nextRound);
    roundRef.current = nextRound;
    setData(nextData);
    dataRef.current = nextData;
    setStep(0);
    stepRef.current = 0;
    setSelected([]);
    selectedSetRef.current = new Set();
    setFailureReason(null);
    setDidBreakRecordThisAttempt(false);
    setRemainingMs(getSelectionDuration(nextData.sequence.length));
    startCountdown(0);
  }

  function resetToIdle() {
    clearGameTimers();
    resolvingRef.current = false;

    const nextData = makeRound(1);
    setRound(1);
    roundRef.current = 1;
    setData(nextData);
    dataRef.current = nextData;
    setPhase(PHASE.IDLE);
    phaseRef.current = PHASE.IDLE;
    previousPhaseRef.current = null;
    setStep(0);
    stepRef.current = 0;
    setSelected([]);
    selectedSetRef.current = new Set();
    setFailureReason(null);
    setDidBreakRecordThisAttempt(false);
    setCountdownIndex(0);
    setRemainingMs(getSelectionDuration(nextData.sequence.length));
  }

  function startGame() {
    if (phaseRef.current !== PHASE.IDLE) return;
    startRound(1);
  }

  function retryRound() {
    startRound(roundRef.current);
  }

  function failRound(reason) {
    if (resolvingRef.current) return;

    resolvingRef.current = true;
    clearActiveTimer();
    clearRoundTransitionTimer();
    setFailureReason(reason);
    setPhase(PHASE.FAILED);
    phaseRef.current = PHASE.FAILED;
  }

  function completeRound() {
    if (resolvingRef.current) return;

    resolvingRef.current = true;
    clearActiveTimer();
    setPhase(PHASE.CLEARED);
    phaseRef.current = PHASE.CLEARED;
    clearRoundTransitionTimer();
    roundTransitionTimerRef.current = window.setTimeout(() => {
      roundTransitionTimerRef.current = null;
      startRound(roundRef.current + 1);
    }, ROUND_TRANSITION_MS);
  }

  function choose(card) {
    if (phaseRef.current !== PHASE.PLAYING || resolvingRef.current || selectedSetRef.current.has(card.cardId)) {
      return;
    }

    const currentStep = stepRef.current;

    if (card.id !== dataRef.current.sequence[currentStep].id) {
      failRound(FAILURE_REASON.WRONG);
      return;
    }

    const nextSelectedSet = new Set(selectedSetRef.current);
    nextSelectedSet.add(card.cardId);
    selectedSetRef.current = nextSelectedSet;

    const nextStep = currentStep + 1;
    stepRef.current = nextStep;
    setStep(nextStep);
    setSelected([...nextSelectedSet]);

    if (nextStep === dataRef.current.sequence.length) {
      completeRound();
    }
  }

  function pauseGame() {
    if (!canPause || phaseRef.current === PHASE.PAUSED) return;

    previousPhaseRef.current = phaseRef.current;
    clearActiveTimer({ preserve: true });
    setPhase(PHASE.PAUSED);
    phaseRef.current = PHASE.PAUSED;
  }

  function resumeGame() {
    const previousPhase = previousPhaseRef.current;
    if (!previousPhase || phaseRef.current !== PHASE.PAUSED) return;

    setPhase(previousPhase);
    phaseRef.current = previousPhase;
    previousPhaseRef.current = null;
    resumeActiveTimer();
    window.setTimeout(() => pauseButtonRef.current?.focus(), 0);
  }

  function shouldReveal(index) {
    return phase === PHASE.PREVIEW || index < step || phase === PHASE.CLEARED;
  }

  const resultTitle = didBreakRecordThisAttempt ? "최고기록 갱신!" : "GAME OVER";
  const isTimeoutFailure = failureReason === FAILURE_REASON.TIMEOUT;
  const gameActions = canPause ? (
    <Button
      ref={pauseButtonRef}
      className="memory-game__pause"
      variant="secondary"
      type="button"
      onClick={pauseGame}
    >
      일시정지
    </Button>
  ) : null;

  return (
    <GameStage
      className="memory-game"
      eyebrow={game.eyebrow}
      title={game.title}
      description={game.description}
      actions={gameActions}
      fullscreenEnabled
      ariaLabel={game.title}
    >
      <div className="memory-game__stage">
        <div
          ref={stageContentRef}
          className="memory-game__stage-content"
          aria-hidden={isStageCovered ? "true" : undefined}
        >
          {phase === PHASE.IDLE ? (
            <section className="memory-game__idle" aria-labelledby="memory-game-start-title">
              <h3 id="memory-game-start-title">이모지 순서를 기억해 보세요.</h3>
              <p>
                제한시간 동안 보여지는 이모지를 순서대로 다시 선택하면 다음 라운드로 넘어갑니다.
              </p>
              <Button className="memory-game__primary" type="button" onClick={startGame}>
                게임 시작
              </Button>
            </section>
          ) : (
            <>
              <div className="memory-game__play-meta">
                <span aria-hidden="true" />
                {shouldShowRound ? (
                  <p className="memory-game__round" aria-label={`현재 ${round}라운드`}>
                    — {round} ROUND —
                  </p>
                ) : null}
                {shouldShowTimer ? (
                  <div
                    className={`memory-game__clock${isTimerWarning ? " is-warning" : ""}${isTimerCritical ? " is-critical" : ""}`}
                    aria-label={`남은 시간 ${timerText}초`}
                  >
                    <StopwatchIcon />
                    <span>{timerText}</span>
                  </div>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>

              <div className="memory-game__play-area">
                <section className="memory-game__challenge" aria-live="polite">
                  <div className="memory-sequence" aria-label="기억해야 할 이모지 순서">
                    {data.sequence.map((item, index) => {
                      const revealed = shouldReveal(index);
                      return (
                        <div
                          className={`memory-sequence__item${revealed ? " is-revealed" : " is-covered"}`}
                          key={`${item.id}-${index}`}
                          aria-label={revealed ? `${item.name}, 순서 ${index + 1}` : `${index + 1}번째 순서 가려짐`}
                        >
                          {revealed ? <MemorySymbol value={item.symbol} /> : <span className="memory-sequence__cover" />}
                        </div>
                      );
                    })}
                  </div>

                  {phase === PHASE.CLEARED ? (
                    <div className="memory-game__feedback" aria-live="assertive">
                      CLEAR!
                    </div>
                  ) : null}
                </section>

                <section className="memory-game__board" aria-label="선택할 이모지">
                  <p>이모지를 순서대로 선택하세요.</p>
                  <div className="memory-card-grid">
                    {data.cards.map((card) => {
                      const picked = selectedSet.has(card.cardId);
                      return (
                        <button
                          type="button"
                          className={`memory-card${picked ? " is-selected" : ""}`}
                          key={card.cardId}
                          onClick={() => choose(card)}
                          disabled={phase !== PHASE.PLAYING || picked}
                          aria-label={`${card.name}${picked ? ", 선택됨" : ""}`}
                        >
                          <MemorySymbol value={card.symbol} />
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            </>
          )}
        </div>

        {phase === PHASE.COUNTDOWN ? (
          <div className="memory-game__countdown" role="status" aria-live="assertive">
            <p className="memory-game__round" aria-label={`현재 ${round}라운드`}>
              — {round} ROUND —
            </p>
            <span>{COUNTDOWN_LABELS[countdownIndex]}</span>
          </div>
        ) : null}

        {phase === PHASE.PAUSED ? (
          <div className="memory-game__pause-overlay" role="dialog" aria-modal="true" aria-labelledby="memory-game-pause-title">
            <div className="memory-game__modal">
              <h3 id="memory-game-pause-title">일시정지</h3>
              <div className="memory-game__modal-actions">
                <Button ref={resumeButtonRef} className="memory-game__modal-button" type="button" onClick={resumeGame}>
                  계속하기
                </Button>
                <Button
                  className="memory-game__modal-button"
                  variant="secondary"
                  type="button"
                  onClick={resetToIdle}
                >
                  처음부터 다시 시작
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {phase === PHASE.FAILED ? (
          <div className="memory-game__result-overlay" role="dialog" aria-modal="true" aria-labelledby="memory-game-result-title">
            <div className="memory-game__modal">
              <h3 id="memory-game-result-title">{resultTitle}</h3>
              <p className="memory-game__result-round">{round}라운드 실패</p>
              {isTimeoutFailure ? (
                <p className="memory-game__result-detail">시간 초과</p>
              ) : null}
              <div className="memory-game__modal-actions">
                <Button ref={retryButtonRef} className="memory-game__modal-button" type="button" onClick={retryRound}>
                  재도전
                </Button>
                <Button
                  className="memory-game__modal-button"
                  variant="secondary"
                  type="button"
                  onClick={resetToIdle}
                >
                  처음부터 다시 시작
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </GameStage>
  );
}
