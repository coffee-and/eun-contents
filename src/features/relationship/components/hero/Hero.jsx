import { FeatureHeader } from "../../../../shared/components/FeatureHeader.jsx";

export function Hero({ title, onNavigateHome, onChooseAgain }) {
  return (
    <FeatureHeader
      className="hero"
      copyClassName="hero__copy"
      eyebrow="RELATIONSHIP REPORT"
      eyebrowClassName="hero__eyebrow"
      title={title}
      titleClassName="hero__title"
      onNavigateHome={onNavigateHome}
      onRestart={onChooseAgain}
    />
  );
}
