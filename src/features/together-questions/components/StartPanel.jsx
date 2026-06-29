// Together Questions 시작 화면을 표시합니다.
import { Button } from "../../../shared/components/Button.jsx";
import { getSelectionThemeClass } from "../constants/themeClasses.js";
import { QUESTION_PACKS, RELATIONSHIP_TYPES } from "../data/index.js";

export function StartPanel({ startForm, canStart, isBusy, onSubmit, onChangeForm, onResetQuestion }) {
  return (
    <form className="tq-panel tq-start" onSubmit={onSubmit}>
      <div className="tq-section__head">
        <span>START / 01</span>
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

      <div className="tq-flow-note">
        <strong>무료 기본 문답 30문항</strong>
        <p>
          {QUESTION_PACKS[1].title} {QUESTION_PACKS[1].questionCount}문항은 프리미엄으로 준비 중이에요.
          작성 중인 내용은 이 기기에 임시 저장됩니다.
        </p>
      </div>

      <div className="tq-start__actions">
        <Button type="submit" variant="primary" disabled={!canStart || isBusy}>
          문답 시작하기
        </Button>
      </div>
    </form>
  );
}
