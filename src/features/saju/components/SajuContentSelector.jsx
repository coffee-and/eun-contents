import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";
import { SAJU_CONTENT_TYPES } from "../data/contentTypes.js";

export function SajuContentSelector({ selectedId, onSelect }) {
  return (
    <EditorialCard className="saju-selector">
      <div className="saju-selector__head">
        <EditorialLabel variant="section">SELECT / 01</EditorialLabel>
        <h2 id="saju-content-heading">어떤 방식으로 나를 들여다볼까요?</h2>
      </div>

      <div
        className="saju-card-grid"
        role="group"
        aria-labelledby="saju-content-heading"
      >
        {SAJU_CONTENT_TYPES.map((content) => {
          const isSelected = selectedId === content.id;

          return (
            <button
              type="button"
              key={content.id}
              className={`saju-select-card${isSelected ? " is-selected" : ""}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(content.id)}
            >
              <span className="saju-select-card__eyebrow">{content.eyebrow}</span>
              <span className="saju-select-card__title">{content.title}</span>
              {isSelected ? (
                <span className="saju-select-card__status">선택됨</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </EditorialCard>
  );
}
