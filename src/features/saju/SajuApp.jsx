import { useState } from "react";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { FeatureHeader } from "../../shared/components/FeatureHeader.jsx";
import { SajuContentSelector } from "./components/SajuContentSelector.jsx";
import "./styles/saju.css";

export default function SajuApp({ onNavigateHome }) {
  const [selectedContentId, setSelectedContentId] = useState("");

  return (
    <AppShell>
      <FeatureHeader
        className="saju-hero"
        copyClassName="saju-hero__copy"
        eyebrow="SAJU & INSIGHT"
        eyebrowClassName="saju-hero__eyebrow"
        title="사주·타로"
        titleClassName="saju-hero__title"
        onNavigateHome={onNavigateHome}
      />

      <SajuContentSelector
        selectedId={selectedContentId}
        onSelect={setSelectedContentId}
      />
    </AppShell>
  );
}
