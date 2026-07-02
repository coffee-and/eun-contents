import { RELATIONSHIP_MODE_META } from "../../data/config.js";

export function RelationshipModeSelect({ onSelectMode }) {
  return (
    <section
      className="mode-select editorial-surface-card"
      aria-labelledby="mode-select-title"
    >
      <div className="mode-select__head">
        <span className="mode-select__eyebrow">START</span>
        <h2 id="mode-select-title" className="mode-select__title">
          어떤 관계를 살펴볼까요?
        </h2>
      </div>

      <div className="mode-select__grid">
        {Object.entries(RELATIONSHIP_MODE_META).map(([mode, meta]) => (
          <button
            key={mode}
            type="button"
            className={`mode-card editorial-card editorial-surface-card mode-card--${mode}`}
            onClick={() => onSelectMode(mode)}
          >
            <span className="mode-card__label">{meta.shortLabel}</span>
            <strong>{meta.title}</strong>
            <small>{meta.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
