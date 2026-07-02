import { useMemo, useState } from "react";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { FeatureHeader } from "../../shared/components/FeatureHeader.jsx";
import { GamePlaceholder } from "../../shared/components/game/GamePlaceholder.jsx";
import { GameStage } from "../../shared/components/game/GameStage.jsx";
import { EditorialCard } from "../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../shared/components/editorial/EditorialLabel.jsx";
import { MINI_GAMES, MINI_GAME_STATUS } from "./data/games.js";
import { MemoryOrderGame } from "./memory/MemoryOrderGame.jsx";
import "./styles/mini-games.css";

export default function MiniGamesApp({ onNavigateHome }) {
  const [selectedGameId, setSelectedGameId] = useState("");
  const selectedGame = useMemo(
    () => MINI_GAMES.find((game) => game.id === selectedGameId) ?? null,
    [selectedGameId]
  );
  const isMemoryGame = selectedGame?.id === "memory";
  const heroActions = [
    onNavigateHome ? { label: "← 다른 콘텐츠 보기", onClick: onNavigateHome } : null,
    selectedGame ? { label: "← 다른 게임하기", onClick: () => setSelectedGameId("") } : null,
  ].filter(Boolean);

  return (
    <AppShell>
      <FeatureHeader
        eyebrow="PLAY & MOMENT"
        title="미니 게임"
        actions={heroActions}
      />

      {isMemoryGame ? (
        <MemoryOrderGame game={selectedGame} />
      ) : selectedGame ? (
        <GameStage
          eyebrow={selectedGame.eyebrow}
          title={selectedGame.title}
          description={selectedGame.description}
          fullscreenEnabled
          ariaLabel={selectedGame.title}
        >
          <GamePlaceholder
            title={selectedGame.title}
            description={selectedGame.description}
            status={selectedGame.statusLabel}
          />
        </GameStage>
      ) : (
        <EditorialCard className="mini-game-selector">
          <div className="mini-game-selector__head">
            <EditorialLabel variant="section">SELECT / 01</EditorialLabel>
            <h2 id="mini-game-heading">어떤 게임으로 쉬어갈까요?</h2>
          </div>

          <div className="mini-game-grid" role="group" aria-labelledby="mini-game-heading">
            {MINI_GAMES.map((game) => {
              const isReady = game.status === MINI_GAME_STATUS.READY;

              return (
                <button
                  type="button"
                  key={game.id}
                  className="mini-game-card editorial-option-card"
                  onClick={() => setSelectedGameId(game.id)}
                >
                  <span className="mini-game-card__eyebrow">{game.eyebrow}</span>
                  <span className="mini-game-card__title">{game.title}</span>
                  <span className="mini-game-card__description">{game.description}</span>
                  <span className="mini-game-card__status">
                    {isReady ? game.statusLabel : "준비 중"}
                  </span>
                </button>
              );
            })}
          </div>
        </EditorialCard>
      )}
    </AppShell>
  );
}
