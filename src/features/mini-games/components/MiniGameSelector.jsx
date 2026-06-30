import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";
import { MINI_GAMES } from "../data/games.js";

export function MiniGameSelector({ selectedId, onSelect }) {
  const selectedGame = MINI_GAMES.find((game) => game.id === selectedId) ?? null;

  return (
    <EditorialCard className="mini-game-selector">
      <div className="mini-game-selector__head">
        <EditorialLabel variant="section">SELECT / 01</EditorialLabel>
        <h2 id="mini-game-heading">어떤 게임으로 잠깐 쉬어갈까요?</h2>
        <p>지금 가볍게 즐기고 싶은 게임을 골라주세요.</p>
      </div>

      <div
        className="mini-game-grid"
        role="group"
        aria-labelledby="mini-game-heading"
      >
        {MINI_GAMES.map((game) => {
          const isSelected = selectedId === game.id;

          return (
            <button
              type="button"
              key={game.id}
              className={`mini-game-card${isSelected ? " is-selected" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(game.id)}
            >
              <span className="mini-game-card__eyebrow">{game.eyebrow}</span>
              <span className="mini-game-card__title">{game.title}</span>
              <span className="mini-game-card__description">{game.description}</span>
              <span className="mini-game-card__status" aria-hidden={!isSelected}>
                {isSelected ? "선택됨" : "선택하기"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mini-game-selection-note" role="status" aria-live="polite">
        {selectedGame
          ? `${selectedGame.title}의 다음 단계를 준비하고 있어요.`
          : "게임을 선택하면 준비 중인 다음 단계를 확인할 수 있어요."}
      </p>
    </EditorialCard>
  );
}
