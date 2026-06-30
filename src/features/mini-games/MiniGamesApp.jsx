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
        title="미니 게임"
        titleClassName="mini-games-hero__title"
        onNavigateHome={onNavigateHome}
      />

      <MiniGameSelector selectedId={selectedGameId} onSelect={setSelectedGameId} />
    </AppShell>
  );
}
