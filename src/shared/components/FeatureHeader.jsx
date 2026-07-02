import { TextAction } from "./TextAction.jsx";
import { EditorialLabel } from "./editorial/EditorialLabel.jsx";

export function FeatureHeader({
  className = "",
  copyClassName = "",
  eyebrow,
  eyebrowClassName = "",
  title,
  titleClassName = "",
  subtitle,
  subtitleClassName = "",
  actions,
  onNavigateHome,
  onRestart,
  restartLabel = "← 다시 선택하기",
  homeLabel = "← 다른 콘텐츠 보기",
}) {
  const headerActions =
    actions ??
    [
      onNavigateHome ? { label: homeLabel, onClick: onNavigateHome } : null,
      onRestart ? { label: restartLabel, onClick: onRestart } : null,
    ].filter(Boolean);

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
        {subtitle ? (
          <p className={`feature-header__subtitle editorial-page-subtitle ${subtitleClassName}`.trim()}>
            {subtitle}
          </p>
        ) : null}
      </div>

      {headerActions.length > 0 ? (
        <div className="feature-header-actions editorial-top-actions">
          {headerActions.map((action) => (
            <TextAction className="editorial-top-action" key={action.label} onClick={action.onClick}>
              {action.label}
            </TextAction>
          ))}
        </div>
      ) : null}
    </header>
  );
}
