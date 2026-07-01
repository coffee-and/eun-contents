import { TextAction } from "./TextAction.jsx";
import { EditorialLabel } from "./editorial/EditorialLabel.jsx";

export function FeatureHeader({
  className = "",
  copyClassName = "",
  eyebrow,
  eyebrowClassName = "",
  title,
  titleClassName = "",
  onNavigateHome,
  onRestart,
  restartLabel = "← 다시 선택하기",
  homeLabel = "← 다른 콘텐츠 보기",
}) {
  return (
    <header className={`feature-header ${className}`.trim()}>
      <div className={`feature-header__copy ${copyClassName}`.trim()}>
        {eyebrow ? (
          <EditorialLabel
            className={`feature-header__eyebrow ${eyebrowClassName}`.trim()}
            variant="eyebrow"
          >
            {eyebrow}
          </EditorialLabel>
        ) : null}
        <h1 className={`feature-header__title editorial-page-title ${titleClassName}`.trim()}>
          {title}
        </h1>
      </div>

      <div className="feature-header-actions editorial-top-actions">
        {onNavigateHome ? (
          <TextAction className="editorial-top-action" onClick={onNavigateHome}>
            {homeLabel}
          </TextAction>
        ) : null}
        {onRestart ? (
          <TextAction className="editorial-top-action" onClick={onRestart}>
            {restartLabel}
          </TextAction>
        ) : null}
      </div>
    </header>
  );
}
