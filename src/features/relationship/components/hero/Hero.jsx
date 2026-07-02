import { FeatureHeader } from "../../../../shared/components/FeatureHeader.jsx";

export function Hero({ title, onNavigateHome, onChooseAgain }) {
  return (
    <FeatureHeader
      eyebrow="RELATIONSHIP REPORT"
      title={title}
      onNavigateHome={onNavigateHome}
      onRestart={onChooseAgain}
    />
  );
}
