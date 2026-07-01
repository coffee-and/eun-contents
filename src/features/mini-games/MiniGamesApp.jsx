import { useState } from "react";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { FeatureHeader } from "../../shared/components/FeatureHeader.jsx";
import { EditorialCard } from "../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../shared/components/editorial/EditorialLabel.jsx";
import { MINI_GAMES } from "./data/games.js";
import { MemoryOrderGame } from "./memory/MemoryOrderGame.jsx";
import "./styles/mini-games.css";

export default function MiniGamesApp({ onNavigateHome }) {
  const [selectedGameId, setSelectedGameId] = useState("");

  if (selectedGameId === "memory") {
    return (
      <AppShell>
        <FeatureHeader
          className="mini-games-hero"
          copyClassName="mini-games-hero__copy"
          eyebrow="PLAY & MOMENT"
          eyebrowClassName="mini-games-hero__eyebrow"
          title="미니 게임"
          titleClassName="mini-games-hero__title"
          onNavigateHome={onNavigateHome}
        />
        <MemoryOrderGame onBack={() => setSelectedGameId("")} />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <FeatureHeader
        className="mini-games-hero"
        copyClassName="mini-games-hero__copy"
        eyebrow="PLAY & MOMENT"
        eyebrowClassName="mini-games-hero__eyebrow"
        title="미니 게임"
        titleClassName="mini-games-hero__title"
        onNavigateHome={onNavigateHome}
      />

      <EditorialCard className="mini-game-selector">
        <div className="mini-game-selector__head">
          <EditorialLabel variant="section">SELECT / 01</EditorialLabel>
          <h2 id="mini-game-heading">어떤 게임으로 잠깐 쉬어갈까요?</h2>
        </div>

        <div className="mini-game-grid" role="group" aria-labelledby="mini-game-heading">
          {MINI_GAMES.map((game) => {
            const isSelected = selectedGameId === game.id;

            return (
              <button
                type="button"
                key={game.id}
                className={`mini-game-card editorial-option-card${
                  isSelected ? " is-selected" : ""
                }`}
                aria-pressed={isSelected}
                onClick={() => setSelectedGameId(game.id)}
              >
                <span className="mini-game-card__eyebrow">{game.eyebrow}</span>
                <span className="mini-game-card__title">{game.title}</span>
                {isSelected ? (
                  <span className="mini-game-card__status">선택됨</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </EditorialCard>
    </AppShell>
  );
}
