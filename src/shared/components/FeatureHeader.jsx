import { TextAction } from "./TextAction.jsx";

export function FeatureHeader({
  className = "",
  copyClassName = "",
  eyebrow,
  eyebrowClassName = "",
  title,
  titleClassName = "",
  subtitle,
  subtitleClassName = "",
  onNavigateHome,
  onRestart,
  restartLabel = "← 다시 선택하기",
  homeLabel = "← 다른 콘텐츠 보기",
}) {
  return (
    <header className={`feature-header ${className}`.trim()}>
      <div className={`feature-header__copy ${copyClassName}`.trim()}>
        {eyebrow ? (
          <span className={`feature-header__eyebrow ${eyebrowClassName}`.trim()}>
            {eyebrow}
          </span>
        ) : null}
        <h1 className={`feature-header__title ${titleClassName}`.trim()}>{title}</h1>
        {subtitle ? (
          <p className={`feature-header__subtitle ${subtitleClassName}`.trim()}>
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="feature-header-actions">
        {onNavigateHome ? (
          <TextAction onClick={onNavigateHome}>{homeLabel}</TextAction>
        ) : null}
        {onRestart ? (
          <TextAction onClick={onRestart}>{restartLabel}</TextAction>
        ) : null}
      </div>
    </header>
  );
}
