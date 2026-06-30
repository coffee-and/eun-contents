import { useEffect, useMemo, useState } from "react";
import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";

const MEMORY_IMAGE_BASE_PATH = "/images/mini-games/memory";
const BEST_ROUND_STORAGE_KEY = "eunContents.memoryOrderGame.bestRound";

const CAT_IMAGES = [
  { id: "cat-01", name: "빨간 나비넥타이를 한 샴 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-01.png` },
  { id: "cat-02", name: "초록 안경을 쓴 회색 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-02.png` },
  { id: "cat-03", name: "금색 방울 목걸이를 한 턱시도 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-03.png` },
  { id: "cat-04", name: "데이지 꽃을 단 삼색 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-04.png` },
  { id: "cat-05", name: "남색 나비넥타이를 한 은색 태비 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-05.png` },
  { id: "cat-06", name: "분홍 리본을 단 흰 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-06.png` },
  { id: "cat-07", name: "금색 안경을 쓴 검은 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-07.png` },
  { id: "cat-08", name: "초록 나비넥타이를 한 주황 태비 고양이", src: `${MEMORY_IMAGE_BASE_PATH}/cat-08.png` },
];

function readBestRound() {
  if (typeof window === "undefined") {
    return 0;
  }

  const value = Number(window.localStorage.getItem(BEST_ROUND_STORAGE_KEY));
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function writeBestRound(round) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BEST_ROUND_STORAGE_KEY, String(round));
  }
}

function shuffle(items) {
  const copiedItems = [...items];

  for (let index = copiedItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copiedItems[index], copiedItems[randomIndex]] = [copiedItems[randomIndex], copiedItems[index]];
  }

  return copiedItems;
}

function pickUniqueImages(count) {
  return shuffle(CAT_IMAGES).slice(0, Math.min(count, CAT_IMAGES.length));
}

function pickImagesWithDuplicates(count) {
  return Array.from({ length: count }, () => {
    const randomIndex = Math.floor(Math.random() * CAT_IMAGES.length);
    return CAT_IMAGES[randomIndex];
  });
}

function createCardsFromSequence(sequence, round) {
  return shuffle(
    sequence.map((image, index) => ({
      ...image,
      cardId: `${round}-${image.id}-${index}`,
    }))
  );
}

function getRoundConfig(round) {
  if (round >= 17) {
    return { cardCount: 20, previewSeconds: 2, allowDuplicates: true };
  }

  if (round >= 14) {
    return { cardCount: 15, previewSeconds: 2, allowDuplicates: true };
  }

  if (round >= 11) {
    return { cardCount: 12, previewSeconds: 3, allowDuplicates: true };
  }

  if (round >= 8) {
    return { cardCount: 10, previewSeconds: 3, allowDuplicates: true };
  }

  if (round >= 6) {
    return { cardCount: 8, previewSeconds: 3, allowDuplicates: false };
  }

  return {
    cardCount: 5,
    previewSeconds: round <= 3 ? 4 : 3,
    allowDuplicates: false,
  };
}

function createRound(round) {
  const config = getRoundConfig(round);
  const sequence = config.allowDuplicates
    ? pickImagesWithDuplicates(config.cardCount)
    : pickUniqueImages(config.cardCount);

  return {
    ...config,
    sequence,
    cards: createCardsFromSequence(sequence, round),
  };
}

export function MemoryOrderGame({ onBack }) {
  const [round, setRound] = useState(1);
  const [roundData, setRoundData] = useState(() => createRound(1));
  const [phase, setPhase] = useState("preview");
  const [step, setStep] = useState(0);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [message, setMessage] = useState("순서를 천천히 기억해 주세요.");
  const [bestRound, setBestRound] = useState(readBestRound);
  const [previousBestRound, setPreviousBestRound] = useState(readBestRound);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const selectedCardSet = useMemo(() => new Set(selectedCardIds), [selectedCardIds]);

  useEffect(() => {
    if (round <= bestRound) {
      setIsNewRecord(false);
      return;
    }

    setBestRound(round);
    writeBestRound(round);
    setIsNewRecord(previousBestRound > 0 && round > previousBestRound);
  }, [bestRound, previousBestRound, round]);

  useEffect(() => {
    if (phase !== "preview") {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setPhase("playing");
      setMessage("기억한 순서대로 고양이를 눌러 주세요.");
    }, roundData.previewSeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [phase, roundData.previewSeconds, round]);

  function startRound(nextRound) {
    setRound(nextRound);
    setRoundData(createRound(nextRound));
    setPhase("preview");
    setStep(0);
    setSelectedCardIds([]);
    setMessage("순서를 천천히 기억해 주세요.");
  }

  function restartCurrentRound() {
    setRoundData(createRound(round));
    setPhase("preview");
    setStep(0);
    setSelectedCardIds([]);
    setMessage("순서를 천천히 기억해 주세요.");
  }

  function resetGame() {
    startRound(1);
  }

  function resetRecord() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(BEST_ROUND_STORAGE_KEY);
    }

    setBestRound(0);
    setPreviousBestRound(0);
    setIsNewRecord(false);
    resetGame();
  }

  function handleCardClick(card) {
    if (phase !== "playing" || selectedCardSet.has(card.cardId)) {
      return;
    }

    const correctImage = roundData.sequence[step];

    if (card.id !== correctImage.id) {
      setPhase("failed");
      setMessage("아쉬워요. 이번 라운드를 다시 해볼까요?");
      return;
    }

    const nextStep = step + 1;
    setStep(nextStep);
    setSelectedCardIds((currentIds) => [...currentIds, card.cardId]);

    if (nextStep === roundData.sequence.length) {
      setPhase("cleared");
      setMessage("좋아요! 순서를 모두 맞췄어요.");
      return;
    }

    setMessage(`${nextStep + 1}번째 고양이를 골라 주세요.`);
  }

  const recordMessage = previousBestRound > 0
    ? `이 기기에서 ${previousBestRound}라운드까지 기록했어요!`
    : "아직 저장된 기록이 없어요. 첫 기록을 만들어 봐요!";

  return (
    <div className="memory-game">
      <button type="button" className="memory-game__back" onClick={onBack}>
        ← 게임 고르기
      </button>

      <EditorialCard className={`memory-game__panel${isNewRecord ? " is-new-record" : ""}`}>
        <div className={`memory-game__record-note${isNewRecord ? " is-celebrating" : ""}`} aria-live="polite">
          {isNewRecord ? (
            <>
              <span aria-hidden="true">✦</span>
              <strong>새로운 최고 기록! {round}라운드에 도착했어요!</strong>
              <span aria-hidden="true">✦</span>
            </>
          ) : (
            <span>{recordMessage}</span>
          )}
        </div>

        <div className="memory-game__header">
          <div>
            <EditorialLabel variant="section">MEMORY / ORDER</EditorialLabel>
            <h2>기억력 게임</h2>
            <p>처음에 보이는 고양이 순서를 기억하고, 섞인 카드에서 같은 순서로 눌러요.</p>
          </div>
          <div className="memory-game__record" aria-label="기억력 게임 기록">
            <span>현재 라운드</span>
            <strong>{round}</strong>
            <span>최고 기록</span>
            <strong>{bestRound || "-"}</strong>
          </div>
        </div>

        <div className="memory-game__rules" aria-label="현재 라운드 규칙">
          <span>{roundData.cardCount}장</span>
          <span>{roundData.previewSeconds}초 기억</span>
          <span>{roundData.allowDuplicates ? "중복 카드 있음" : "중복 카드 없음"}</span>
        </div>

        {phase === "preview" ? (
          <section className="memory-game__preview" aria-live="polite">
            <p>이 순서를 기억해 주세요.</p>
            <div className="memory-sequence" aria-label="기억해야 할 고양이 순서">
              {roundData.sequence.map((image, index) => (
                <div className="memory-sequence__item" key={`${image.id}-${index}`}>
                  <span>{index + 1}</span>
                  <img src={image.src} alt={`${image.name}, 순서 ${index + 1}`} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="memory-game__board" aria-label="섞인 고양이 카드">
            <div className="memory-card-grid">
              {roundData.cards.map((card) => {
                const isSelected = selectedCardSet.has(card.cardId);

                return (
                  <button
                    type="button"
                    className={`memory-card${isSelected ? " is-selected" : ""}`}
                    key={card.cardId}
                    onClick={() => handleCardClick(card)}
                    disabled={phase !== "playing" || isSelected}
                  >
                    <img src={card.src} alt={card.name} />
                    <span>{isSelected ? "선택됨" : "선택"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <div className="memory-game__status" aria-live="polite">
          <span>{message}</span>
          {phase === "playing" ? (
            <strong>
              {step + 1} / {roundData.sequence.length}
            </strong>
          ) : null}
        </div>

        <div className="memory-game__actions">
          {phase === "cleared" ? (
            <button type="button" className="memory-game__primary" onClick={() => startRound(round + 1)}>
              다음 라운드
            </button>
          ) : null}
          {phase === "failed" ? (
            <button type="button" className="memory-game__primary" onClick={restartCurrentRound}>
              다시 도전
            </button>
          ) : null}
          {phase === "playing" || phase === "preview" ? (
            <button type="button" className="memory-game__secondary" onClick={restartCurrentRound}>
              라운드 새로 시작
            </button>
          ) : null}
          <button type="button" className="memory-game__secondary" onClick={resetGame}>
            1라운드부터
          </button>
          <button type="button" className="memory-game__ghost" onClick={resetRecord}>
            기록 초기화
          </button>
        </div>
      </EditorialCard>
    </div>
  );
}
