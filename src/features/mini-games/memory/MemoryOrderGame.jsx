import { useEffect, useMemo, useRef, useState } from "react";
import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";
import "./memory-game.css";

const BASE = "/images/mini-games/memory";
const KEY = "eunContents.memoryOrderGame.bestRound";

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

export function MemoryOrderGame({ onBack }) {
  const initialData = useMemo(() => makeRound(1), []);
  const [round, setRound] = useState(1);
  const [data, setData] = useState(initialData);
  const [phase, setPhase] = useState("preview");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [best, setBest] = useState(() => getBest());
  const [remainingMs, setRemainingMs] = useState(initialData.seconds * 1000);
  const [feedback, setFeedback] = useState("");
  const deadlineRef = useRef(0);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const isNewRecord = best > 1 && round >= best;

  useEffect(() => {
    if (round > best) {
      window.localStorage.setItem(KEY, String(round));
      setBest(round);
    }
  }, [best, round]);

  useEffect(() => {
    if (phase !== "preview") return undefined;

    deadlineRef.current = performance.now() + data.seconds * 1000;
    setRemainingMs(data.seconds * 1000);

    const timer = window.setInterval(() => {
      const next = Math.max(0, deadlineRef.current - performance.now());
      setRemainingMs(next);

      if (next <= 0) {
        window.clearInterval(timer);
        setPhase("playing");
      }
    }, 10);

    return () => window.clearInterval(timer);
  }, [data.seconds, phase]);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = window.setTimeout(() => setFeedback(""), 650);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function start(nextRound) {
    const nextData = makeRound(nextRound);
    setRound(nextRound);
    setData(nextData);
    setPhase("preview");
    setStep(0);
    setSelected([]);
    setRemainingMs(nextData.seconds * 1000);
    setFeedback("");
  }

  function choose(card) {
    if (phase !== "playing" || selectedSet.has(card.cardId)) return;

    if (card.id !== data.sequence[step].id) {
      setFeedback("FALSE");
      setPhase("failed");
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    setSelected((current) => [...current, card.cardId]);
    setFeedback("TRUE");

    if (nextStep === data.sequence.length) {
      setPhase("cleared");
    }
  }

  const shouldReveal = (index) => phase === "preview" || index < step || phase === "cleared";

  return (
    <div className="memory-game">
      <button type="button" className="memory-game__back" onClick={onBack}>
        ← 게임 고르기
      </button>

      <EditorialCard className={`memory-game__panel${isNewRecord ? " is-new-record" : ""}`}>
        <div className="memory-game__header">
          <div>
            <EditorialLabel variant="section">MEMORY / ORDER</EditorialLabel>
            <h2>기억력 게임</h2>
            <p>제한시간 동안 고양이 순서를 기억한 뒤, 아래 아이콘을 같은 순서로 눌러요.</p>
          </div>
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
        </div>

        <section className="memory-game__challenge" aria-live="polite">
          <div className="memory-game__challenge-head">
            <p>{phase === "preview" ? "이 순서를 기억해 주세요." : "가려진 순서를 맞혀 주세요."}</p>
            <strong className={`memory-game__timer${phase !== "preview" ? " is-finished" : ""}`}>
              {phase === "preview" ? formatCountdown(remainingMs) : "00.00 sec"}
            </strong>
          </div>

          <div className="memory-sequence" aria-label="기억해야 할 고양이 순서">
            {data.sequence.map((cat, index) => {
              const revealed = shouldReveal(index);
              return (
                <div
                  className={`memory-sequence__item${revealed ? " is-revealed" : " is-covered"}`}
                  key={`${cat.id}-${index}`}
                >
                  <span className="memory-sequence__number">{index + 1}</span>
                  {revealed ? (
                    <img src={cat.src} alt={`${cat.name}, 순서 ${index + 1}`} />
                  ) : (
                    <span className="memory-sequence__cover" aria-label={`${index + 1}번째 아이콘 가려짐`}>?</span>
                  )}
                </div>
              );
            })}
          </div>

          {feedback ? <div className={`memory-game__feedback is-${feedback.toLowerCase()}`}>{feedback}</div> : null}
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
                  disabled={phase !== "playing" || picked}
                  aria-label={`${card.name}${picked ? ", 선택됨" : ""}`}
                >
                  <img src={card.src} alt="" />
                  {picked ? <span>✓</span> : null}
                </button>
              );
            })}
          </div>
        </section>

        <div className="memory-game__actions">
          {phase === "cleared" ? <button type="button" className="memory-game__primary" onClick={() => start(round + 1)}>다음 라운드</button> : null}
          {phase === "failed" ? <button type="button" className="memory-game__primary" onClick={() => start(round)}>다시 도전</button> : null}
          {phase === "playing" || phase === "preview" ? <button type="button" className="memory-game__secondary" onClick={() => start(round)}>라운드 새로 시작</button> : null}
          <button type="button" className="memory-game__secondary" onClick={() => start(1)}>1라운드부터</button>
        </div>
      </EditorialCard>
    </div>
  );
}
