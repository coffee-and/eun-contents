import { useState } from "react";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { FeatureHeader } from "../../shared/components/FeatureHeader.jsx";
import { SajuContentSelector } from "./components/SajuContentSelector.jsx";
import "./styles/saju.css";
import "./styles/saju.compact.css";

export default function SajuApp({ onNavigateHome }) {
  const [selectedContentId, setSelectedContentId] = useState("");

  return (
    <AppShell>
      <FeatureHeader
        eyebrow="SAJU & INSIGHT"
        title="사주·타로"
        onNavigateHome={onNavigateHome}
      />

      <SajuContentSelector
        selectedId={selectedContentId}
        onSelect={setSelectedContentId}
      />
    </AppShell>
  );
}
