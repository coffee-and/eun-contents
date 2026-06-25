import { RELATIONSHIP_MODE_META } from "../../data/config.js";

export function RelationshipModeSelect({ onSelectMode }) {
  return (
    <section className="mode-select" aria-labelledby="mode-select-title">
      <div className="mode-select__head">
        <span className="mode-select__eyebrow">START</span>
        <h2 id="mode-select-title" className="mode-select__title">
          지금 관계에 가까운 쪽을 골라주세요
        </h2>
        <p className="mode-select__desc">
          선택한 유형에 따라 질문의 무게가 달라집니다.
        </p>
      </div>

      <div className="mode-select__grid">
        {Object.entries(RELATIONSHIP_MODE_META).map(([mode, meta]) => (
          <button
            key={mode}
            type="button"
            className="mode-card"
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
