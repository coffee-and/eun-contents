// Together Questions 시작 화면을 표시합니다.
import { Button } from "../../../shared/components/Button.jsx";
import { QUESTION_PACKS, RELATIONSHIP_TYPES } from "../data/index.js";

const PANEL_STYLE = {
  border: 0,
  borderTop: "10px solid #f5c328",
  borderRadius: 0,
  background: "#ffffff",
  boxShadow: "none",
};

const FLOW_NOTE_STYLE = {
  border: 0,
  borderRadius: 0,
  background: "#e9edf2",
};

export function StartPanel({ startForm, canStart, isBusy, onSubmit, onChangeForm, onResetQuestion }) {
  return (
    <form className="tq-panel tq-start" style={PANEL_STYLE} onSubmit={onSubmit}>
      <div className="tq-section__head">
        <span>START / 01</span>
        <h2>나의 문답집을 시작해볼까요?</h2>
        <p>관계를 고르고 한 페이지 문답지에 차근차근 답해요.</p>
      </div>

      <div className="tq-choice-group">
        <span>문답 관계</span>
        <div className="tq-card-grid">
          {RELATIONSHIP_TYPES.map((type) => {
            const isSelected = startForm.relationshipType === type.id;

            return (
              <button
                type="button"
                key={type.id}
                className={`tq-select-card ${isSelected ? "is-selected" : ""}`}
                style={{
                  border: 0,
                  borderTop: `7px solid ${isSelected ? "#f5c328" : "#5d7da5"}`,
                  borderRadius: 0,
                  background: isSelected ? "#203854" : "#e9edf2",
                  color: isSelected ? "#ffffff" : "#171b22",
                  boxShadow: "none",
                }}
                onClick={() => {
                  onChangeForm({ relationshipType: type.id });
                  onResetQuestion();
                }}
              >
                <strong>{type.title}</strong>
                <small style={{ color: "inherit" }}>{type.description}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tq-flow-note" style={FLOW_NOTE_STYLE}>
        <strong>무료 기본 문답 30문항</strong>
        <p>
          {QUESTION_PACKS[1].title} {QUESTION_PACKS[1].questionCount}문항은 프리미엄으로 준비 중이에요.
          작성 중인 내용은 이 기기에 임시 저장됩니다.
        </p>
      </div>

      <div style={{ marginTop: 24 }}>
        <Button type="submit" variant="primary" disabled={!canStart || isBusy}>
          문답 시작하기
        </Button>
      </div>
    </form>
  );
}
