import { useState } from "react";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { FeatureHeader } from "../../shared/components/FeatureHeader.jsx";
import { MiniGameSelector } from "./components/MiniGameSelector.jsx";
import "./styles/mini-games.css";

export default function MiniGamesApp({ onNavigateHome }) {
  const [selectedGameId, setSelectedGameId] = useState("");

  return (
    <AppShell>
      <FeatureHeader
        className="mini-games-hero"
        copyClassName="mini-games-hero__copy"
        eyebrow="PLAY & MOMENT"
        eyebrowClassName="mini-games-hero__eyebrow"
        title="가볍게 즐기는 게임"
        titleClassName="mini-games-hero__title"
        subtitle="잠깐의 여유가 필요할 때, 작은 게임으로 마음을 환기해요."
        subtitleClassName="mini-games-hero__subtitle"
        onNavigateHome={onNavigateHome}
      />

      <MiniGameSelector selectedId={selectedGameId} onSelect={setSelectedGameId} />
    </AppShell>
  );
}
