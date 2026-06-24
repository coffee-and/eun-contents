export function Hero({ eyebrow, title, subtitle, progressText }) {
  const [current, total] = progressText.split(" / ");

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

      <aside className="hero__meta">
        <div className="hero__progress-card">
          <span className="hero__progress-label">STEP</span>
          <div className="hero__progress-value">
            <strong>{current}</strong>
            <span>/ {total}</span>
          </div>
        </div>

        <div className="hero__mini-card">
          <span className="hero__mini-label">CURRENT MODE</span>
          <strong>Relationship Scan</strong>
        </div>
      </aside>
    </header>
  );
}