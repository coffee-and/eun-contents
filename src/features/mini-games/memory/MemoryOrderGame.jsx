import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../shared/components/Button.jsx";
import { TextAction } from "../../../shared/components/TextAction.jsx";
import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";
import "./memory-game.css";

const BASE = "/images/mini-games/memory";
const KEY = "eunContents.memoryOrderGame.bestRound";
const COUNTDOWN_LABELS = ["3", "2", "1", "시작"];
const COUNTDOWN_STEP_MS = 1000;
const FEEDBACK_DURATION_MS = 650;
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

const CATS = [
  ["cat-01", "빨간 나비넥타이를 한 샴 고양이"],
  ["cat-02", "초록 안경을 쓴 회색 고양이"],
  ["cat-03", "금색 방울 목걸이를 한 턱시도 고양이"],
  ["cat-04", "데이지 꽃을 단 삼색 고양이"],
  ["cat-05", "남색 나비넥타이를 한 은색 태비 고양이"],
  ["cat-06", "분홍 리본을 단 흰 고양이"],
  ["cat-07", "금색 안경을 쓴 검은 고양이"],
  ["cat-08", "초록 나비넥타이를 한 주황 태비 고양이"],
].map(([id, name]) => ({ id, name, src: `${BASE}/${id}.webp` }));

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
    ? Array.from({ length: rule.count }, () => CATS[Math.floor(Math.random() * CATS.length)])
    : shuffle(CATS).slice(0, rule.count);
  const cards = shuffle(
    sequence.map((cat, index) => ({
      ...cat,
      cardId: `${round}-${cat.id}-${index}`,
    }))
  );

  return { ...rule, sequence, cards };
}

function formatCountdown(milliseconds) {
  return `${Math.max(0, milliseconds / 1000).toFixed(2)} sec`;
}

function formatSelectionTime(milliseconds) {
  return `${Math.ceil(Math.max(0, milliseconds) / 1000)}초`;
}

function getSelectionDuration(targetCount) {
  return targetCount * SELECTION_SECONDS_PER_TARGET * 1000;
}

function getFeedbackKind(message) {
  if (message === "TRUE") return "true";
  if (message === "FALSE") return "false";
  return "timeout";
}

export function MemoryOrderGame({ onBack }) {
  const initialData = useMemo(() => makeRound(1), []);
  const [round, setRound] = useState(1);
  const [data, setData] = useState(initialData);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [best, setBest] = useState(() => getBest());
  const [remainingMs, setRemainingMs] = useState(getSelectionDuration(initialData.sequence.length));
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [feedback, setFeedback] = useState("");

  const activeTimerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const roundTransitionTimerRef = useRef(null);
  const previousPhaseRef = useRef(null);
  const pausedFeedbackRemainingRef = useRef(0);
  const resolvingRef = useRef(false);
  const phaseRef = useRef(phase);
  const roundRef = useRef(round);
  const dataRef = useRef(data);
  const stepRef = useRef(step);
  const countdownIndexRef = useRef(countdownIndex);
  const selectedSetRef = useRef(new Set());
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const isNewRecord = best > 1 && round >= best;
  const canPause = phase === PHASE.COUNTDOWN || phase === PHASE.PREVIEW || phase === PHASE.PLAYING;
  const isBoardHidden = phase === PHASE.PAUSED;

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
    }
  }, [best, round]);

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

  function clearFeedbackTimer({ preserve = false } = {}) {
    const timer = feedbackTimerRef.current;
    if (!timer) return;

    window.clearTimeout(timer.timeoutId);

    if (preserve) {
      pausedFeedbackRemainingRef.current = Math.max(0, timer.deadline - performance.now());
      feedbackTimerRef.current = null;
      return;
    }

    pausedFeedbackRemainingRef.current = 0;
    feedbackTimerRef.current = null;
  }

  function clearRoundTransitionTimer() {
    if (!roundTransitionTimerRef.current) return;
    window.clearTimeout(roundTransitionTimerRef.current);
    roundTransitionTimerRef.current = null;
  }

  function clearGameTimers() {
    clearActiveTimer();
    clearFeedbackTimer();
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

  function scheduleFeedbackClear(durationMs = FEEDBACK_DURATION_MS) {
    clearFeedbackTimer();
    const safeDuration = Math.max(0, durationMs);
    const deadline = performance.now() + safeDuration;
    const timeoutId = window.setTimeout(() => {
      feedbackTimerRef.current = null;
      pausedFeedbackRemainingRef.current = 0;
      setFeedback("");
    }, safeDuration);

    feedbackTimerRef.current = { deadline, timeoutId };
  }

  function showFeedback(message) {
    setFeedback(message);
    scheduleFeedbackClear();
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
      failRound("시간 초과");
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
    setFeedback("");
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
    setFeedback("");
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

  function failRound(message) {
    if (resolvingRef.current) return;

    resolvingRef.current = true;
    clearActiveTimer();
    clearRoundTransitionTimer();
    setPhase(PHASE.FAILED);
    phaseRef.current = PHASE.FAILED;
    showFeedback(message);
  }

  function completeRound() {
    if (resolvingRef.current) return;

    resolvingRef.current = true;
    clearActiveTimer();
    setPhase(PHASE.CLEARED);
    phaseRef.current = PHASE.CLEARED;
    showFeedback("TRUE");
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
      failRound("FALSE");
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
      return;
    }

    showFeedback("TRUE");
  }

  function pauseGame() {
    if (!canPause || phaseRef.current === PHASE.PAUSED) return;

    previousPhaseRef.current = phaseRef.current;
    clearActiveTimer({ preserve: true });
    clearFeedbackTimer({ preserve: true });
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

    if (feedback && pausedFeedbackRemainingRef.current > 0) {
      scheduleFeedbackClear(pausedFeedbackRemainingRef.current);
    }
  }

  function getChallengeText() {
    if (phase === PHASE.COUNTDOWN) return "곧 라운드가 시작됩니다.";
    if (phase === PHASE.PREVIEW) return "이 순서를 기억해 주세요.";
    if (phase === PHASE.PLAYING) return "가려진 순서를 맞혀 주세요.";
    if (phase === PHASE.CLEARED) return "라운드를 완료했어요. 다음 라운드를 준비합니다.";
    if (phase === PHASE.FAILED) return "이번 라운드는 다시 도전해 주세요.";
    return "게임 시작을 기다리고 있어요.";
  }

  function getTimerLabel() {
    if (phase === PHASE.PREVIEW) return formatCountdown(remainingMs);
    if (phase === PHASE.PLAYING) return `남은 시간 ${formatSelectionTime(remainingMs)}`;
    if (phase === PHASE.COUNTDOWN) return "준비";
    return "대기";
  }

  function shouldReveal(index) {
    return phase === PHASE.PREVIEW || index < step || phase === PHASE.CLEARED;
  }

  return (
    <div className="memory-game">
      <div className="editorial-top-actions">
        <TextAction className="editorial-top-action" onClick={onBack}>
          다른 게임하기
        </TextAction>
      </div>

      <EditorialCard className={`memory-game__panel${isNewRecord ? " is-new-record" : ""}`}>
        <div className="memory-game__header">
          <div>
            <EditorialLabel variant="section">MEMORY / ORDER</EditorialLabel>
            <h2>기억력 게임</h2>
            <p>제한시간 동안 고양이 순서를 기억한 뒤, 아래 아이콘을 같은 순서로 눌러요.</p>
          </div>
          <div className="memory-game__header-side">
            <div className="memory-game__record" aria-label="기억력 게임 기록">
              <div className="memory-game__record-pill">
                <span>현재 라운드</span>
                <strong>{round}</strong>
              </div>
              <div className="memory-game__record-pill">
                <span>최고 기록</span>
                <strong>{best || "-"}</strong>
              </div>
            </div>
            {canPause ? (
              <Button
                className="memory-game__pause"
                variant="secondary"
                type="button"
                onClick={pauseGame}
              >
                일시정지
              </Button>
            ) : null}
          </div>
        </div>

        {phase === PHASE.IDLE ? (
          <section className="memory-game__idle" aria-labelledby="memory-game-start-title">
            <h3 id="memory-game-start-title">고양이 순서를 기억해 보세요.</h3>
            <p>게임 시작을 누르면 3, 2, 1 카운트다운 뒤 첫 라운드가 시작됩니다.</p>
            <Button className="memory-game__primary" type="button" onClick={startGame}>
              게임 시작
            </Button>
          </section>
        ) : (
          <>
            <section className="memory-game__challenge" aria-live="polite">
              <div className="memory-game__challenge-head">
                <p>{getChallengeText()}</p>
                <strong
                  className={`memory-game__timer${
                    phase !== PHASE.PREVIEW && phase !== PHASE.PLAYING ? " is-finished" : ""
                  }`}
                >
                  {getTimerLabel()}
                </strong>
              </div>

              <div className="memory-sequence" aria-label="기억해야 할 고양이 순서">
                {data.sequence.map((cat, index) => {
                  const revealed = shouldReveal(index);
                  return (
                    <div
                      className={`memory-sequence__item${revealed ? " is-revealed" : " is-covered"}`}
                      key={`${cat.id}-${index}`}
                      aria-label={revealed ? `${cat.name}, 순서 ${index + 1}` : `${index + 1}번째 순서 가려짐`}
                    >
                      {revealed ? <img src={cat.src} alt="" /> : <span className="memory-sequence__cover" />}
                    </div>
                  );
                })}
              </div>

              {feedback ? <div className={`memory-game__feedback is-${getFeedbackKind(feedback)}`}>{feedback}</div> : null}
            </section>

            <section className="memory-game__board" aria-label="선택할 고양이 아이콘">
              <p>아이콘을 순서대로 선택하세요.</p>
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
                      <img src={card.src} alt="" />
                    </button>
                  );
                })}
              </div>
            </section>

            {phase === PHASE.COUNTDOWN ? (
              <div className="memory-game__countdown" role="status" aria-live="assertive">
                <span>{COUNTDOWN_LABELS[countdownIndex]}</span>
              </div>
            ) : null}
          </>
        )}

        <div className="memory-game__actions">
          {phase === PHASE.FAILED ? (
            <Button className="memory-game__primary" type="button" onClick={retryRound}>
              재도전
            </Button>
          ) : null}
          {phase !== PHASE.IDLE && phase !== PHASE.PAUSED ? (
            <Button
              className="memory-game__secondary"
              variant="secondary"
              type="button"
              onClick={resetToIdle}
            >
              처음부터 다시 시작
            </Button>
          ) : null}
        </div>

        {isBoardHidden ? (
          <div className="memory-game__pause-overlay" role="dialog" aria-modal="true" aria-labelledby="memory-game-pause-title">
            <div className="memory-game__pause-dialog">
              <h3 id="memory-game-pause-title">일시정지</h3>
              <Button className="memory-game__primary" type="button" onClick={resumeGame}>
                계속하기
              </Button>
              <Button
                className="memory-game__secondary"
                variant="secondary"
                type="button"
                onClick={resetToIdle}
              >
                처음부터 다시 시작
              </Button>
            </div>
          </div>
        ) : null}
      </EditorialCard>
    </div>
  );
}
