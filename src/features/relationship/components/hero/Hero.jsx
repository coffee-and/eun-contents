import { TextAction } from "../../../../shared/components/TextAction.jsx";

export function Hero({ title, subtitle, onNavigateHome, onChooseAgain }) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <div className="hero__title-wrap">
          <h1 className="hero__title">{title}</h1>
        </div>

        <p className="hero__subtitle">{subtitle}</p>
      </div>

      <div className="feature-header-actions">
        {onNavigateHome ? (
          <TextAction className="hero__home-button" onClick={onNavigateHome}>
            ← 다른 콘텐츠 보기
          </TextAction>
        ) : null}
        {onChooseAgain ? (
          <TextAction className="hero__choose-again" onClick={onChooseAgain}>
            ← 다시 선택하기
          </TextAction>
        ) : null}
      </div>
    </header>
  );
}
