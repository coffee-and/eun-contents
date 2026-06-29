import { FeatureHeader } from "../../../../shared/components/FeatureHeader.jsx";

export function Hero({ title, subtitle, onNavigateHome, onChooseAgain }) {
  return (
    <FeatureHeader
      className="hero"
      copyClassName="hero__copy"
      title={title}
      titleClassName="hero__title"
      subtitle={subtitle}
      subtitleClassName="hero__subtitle"
      onNavigateHome={onNavigateHome}
      onRestart={onChooseAgain}
    />
  );
}
