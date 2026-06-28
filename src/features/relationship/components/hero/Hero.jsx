export function Hero({ eyebrow, title, subtitle, onNavigateHome }) {
  return (
    <header className="hero">
      <div className="hero__copy">
        <span className="hero__eyebrow">{eyebrow}</span>

        <div className="hero__title-wrap">
          <p className="hero__kicker">EMOTION / STABILITY / FUTURE</p>
          <h1 className="hero__title">{title}</h1>
        </div>

        <p className="hero__subtitle">{subtitle}</p>
      </div>

      {onNavigateHome ? (
        <button
          type="button"
          className="text-action hero__home-button"
          onClick={onNavigateHome}
        >
          ← 다른 콘텐츠 보기
        </button>
      ) : null}
    </header>
  );
}
