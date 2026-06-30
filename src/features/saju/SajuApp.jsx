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
        title="나를 읽는 시간"
        titleClassName="saju-hero__title"
        subtitle="사주와 타로를 통해 나의 기질과 지금의 흐름을 차분히 살펴봐요."
        subtitleClassName="saju-hero__subtitle"
        onNavigateHome={onNavigateHome}
      />

      <SajuContentSelector
        selectedId={selectedContentId}
        onSelect={setSelectedContentId}
      />
    </AppShell>
  );
}
