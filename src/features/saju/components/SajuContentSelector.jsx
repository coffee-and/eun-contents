import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";
import { SAJU_CONTENT_TYPES } from "../data/contentTypes.js";

export function SajuContentSelector({ selectedId, onSelect }) {
  const selectedContent =
    SAJU_CONTENT_TYPES.find((content) => content.id === selectedId) ?? null;

  return (
    <EditorialCard className="saju-selector">
      <div className="saju-selector__head">
        <EditorialLabel variant="section">SELECT / 01</EditorialLabel>
        <h2 id="saju-content-heading">어떤 방식으로 나를 들여다볼까요?</h2>
        <p>지금 마음이 가는 콘텐츠를 먼저 골라주세요.</p>
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
              <span className="saju-select-card__description">{content.description}</span>
              <span className="saju-select-card__status" aria-hidden={!isSelected}>
                {isSelected ? "선택됨" : "선택하기"}
              </span>
            </button>
          );
        })}
      </div>

      <p className="saju-selection-note" role="status" aria-live="polite">
        {selectedContent
          ? `${selectedContent.title} 콘텐츠의 다음 단계를 준비하고 있어요.`
          : "사주 또는 타로를 선택하면 준비 중인 다음 단계를 확인할 수 있어요."}
      </p>
    </EditorialCard>
  );
}
