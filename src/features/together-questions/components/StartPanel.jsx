// Together Questions 시작 화면을 표시합니다.
import { Button } from "../../../shared/components/Button.jsx";
import { EditorialCard } from "../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../shared/components/editorial/EditorialLabel.jsx";
import { getSelectionThemeClass } from "../constants/themeClasses.js";
import { RELATIONSHIP_TYPES } from "../data/index.js";

export function StartPanel({ startForm, canStart, isBusy, onSubmit, onChangeForm, onResetQuestion }) {
  return (
    <EditorialCard as="form" className="tq-panel tq-start" onSubmit={onSubmit}>
      <div className="tq-section__head">
        <EditorialLabel variant="section">START / 01</EditorialLabel>
        <h2>누구와의 문답을 시작할까요?</h2>
      </div>

      <div className="tq-choice-group">
        <span>문답 관계</span>
        <div className="tq-card-grid">
          {RELATIONSHIP_TYPES.map((type, index) => {
            const isSelected = startForm.relationshipType === type.id;

            return (
              <button
                type="button"
                key={type.id}
                className={`tq-select-card ${getSelectionThemeClass(index)}${
                  isSelected ? " is-selected" : ""
                }`}
                onClick={() => {
                  onChangeForm({ relationshipType: type.id });
                  onResetQuestion();
                }}
              >
                <strong>{type.title}</strong>
                <small>{type.description}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tq-start__actions">
        <Button type="submit" variant="primary" disabled={!canStart || isBusy}>
          문답 시작하기
        </Button>
      </div>
    </EditorialCard>
  );
}
