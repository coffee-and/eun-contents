import { useEffect, useMemo, useState } from "react";
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
].map(([id, name]) => ({ id, name, src: `${BASE}/${id}.svg` }));

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
  const cards = shuffle(sequence.map((cat, index) => ({ ...cat, cardId: `${round}-${cat.id}-${index}` })));
  return { ...rule, sequence, cards };
}

export function MemoryOrderGame({ onBack }) {
  const [round, setRound] = useState(1);
  const [data, setData] = useState(() => makeRound(1));
  const [phase, setPhase] = useState("preview");
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]);
  const [best, setBest] = useState(() => getBest());
  const [message, setMessage] = useState("순서를 천천히 기억해 주세요.");
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
    const timer = window.setTimeout(() => {
      setPhase("playing");
      setMessage("기억한 순서대로 고양이를 눌러 주세요.");
    }, data.seconds * 1000);
    return () => window.clearTimeout(timer);
  }, [data.seconds, phase]);

  function start(nextRound) {
    setRound(nextRound);
    setData(makeRound(nextRound));
    setPhase("preview");
    setStep(0);
    setSelected([]);
    setMessage("순서를 천천히 기억해 주세요.");
  }

  function choose(card) {
    if (phase !== "playing" || selectedSet.has(card.cardId)) return;
    if (card.id !== data.sequence[step].id) {
      setPhase("failed");
      setMessage("아쉬워요. 이번 라운드를 다시 해볼까요?");
      return;
    }
    const nextStep = step + 1;
    setStep(nextStep);
    setSelected((current) => [...current, card.cardId]);
    if (nextStep === data.sequence.length) {
      setPhase("cleared");
      setMessage("좋아요! 순서를 모두 맞췄어요.");
    } else {
      setMessage(`${nextStep + 1}번째 고양이를 골라 주세요.`);
    }
  }

  return (
    <div className="memory-game">
      <button type="button" className="memory-game__back" onClick={onBack}>← 게임 고르기</button>
      <EditorialCard className={`memory-game__panel${isNewRecord ? " is-new-record" : ""}`}>
        <div className={`memory-game__record-note${isNewRecord ? " is-celebrating" : ""}`} aria-live="polite">
          {isNewRecord ? <strong>✦ 새로운 최고 기록! {round}라운드에 도착했어요! ✦</strong> : <span>{best ? `이 기기에서 ${best}라운드까지 기록했어요!` : "아직 저장된 기록이 없어요. 첫 기록을 만들어 봐요!"}</span>}
        </div>
        <div className="memory-game__header">
          <div><EditorialLabel variant="section">MEMORY / ORDER</EditorialLabel><h2>기억력 게임</h2><p>처음에 보이는 고양이 순서를 기억하고, 섞인 카드에서 같은 순서로 눌러요.</p></div>
          <div className="memory-game__record" aria-label="기억력 게임 기록"><span>현재 라운드</span><strong>{round}</strong><span>최고 기록</span><strong>{best || "-"}</strong></div>
        </div>
        <div className="memory-game__rules" aria-label="현재 라운드 규칙"><span>{data.count}장</span><span>{data.seconds}초 기억</span><span>{data.duplicates ? "중복 카드 있음" : "중복 카드 없음"}</span></div>
        {phase === "preview" ? <section className="memory-game__preview" aria-live="polite"><p>이 순서를 기억해 주세요.</p><div className="memory-sequence" aria-label="기억해야 할 고양이 순서">{data.sequence.map((cat, index) => <div className="memory-sequence__item" key={`${cat.id}-${index}`}><span>{index + 1}</span><img src={cat.src} alt={`${cat.name}, 순서 ${index + 1}`} /></div>)}</div></section> : <section className="memory-game__board" aria-label="섞인 고양이 카드"><div className="memory-card-grid">{data.cards.map((card) => { const picked = selectedSet.has(card.cardId); return <button type="button" className={`memory-card${picked ? " is-selected" : ""}`} key={card.cardId} onClick={() => choose(card)} disabled={phase !== "playing" || picked}><img src={card.src} alt={card.name} /><span>{picked ? "선택됨" : "선택"}</span></button>; })}</div></section>}
        <div className="memory-game__status" aria-live="polite"><span>{message}</span>{phase === "playing" ? <strong>{step + 1} / {data.sequence.length}</strong> : null}</div>
        <div className="memory-game__actions">
          {phase === "cleared" ? <button type="button" className="memory-game__primary" onClick={() => start(round + 1)}>다음 라운드</button> : null}
          {phase === "failed" ? <button type="button" className="memory-game__primary" onClick={() => start(round)}>다시 도전</button> : null}
          {phase === "playing" || phase === "preview" ? <button type="button" className="memory-game__secondary" onClick={() => start(round)}>라운드 새로 시작</button> : null}
          <button type="button" className="memory-game__secondary" onClick={() => start(1)}>1라운드부터</button>
          <button type="button" className="memory-game__ghost" onClick={() => { window.localStorage.removeItem(KEY); setBest(0); start(1); }}>기록 초기화</button>
        </div>
      </EditorialCard>
    </div>
  );
}
