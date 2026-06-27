// Together Questions 시작 화면을 표시합니다.
import { ANSWER_LIMITS } from "../constants/sessionFlow.js";
import { RELATIONSHIP_TYPES } from "../data/questionPacks.js";

export function StartPanel({ startForm, canStart, isBusy, onSubmit, onChangeForm, onResetQuestion }) {
  return (
    <form className="tq-panel tq-start" onSubmit={onSubmit}>
      <div className="tq-section__head">
        <span>START</span>
        <h2>먼저 누구와 문답할지 골라주세요</h2>
        <p>질문 주제 선택 없이, 기본 15문항으로 자연스럽게 시작해요.</p>
      </div>

      <div className="tq-choice-group">
        <span>상대와의 관계</span>
        <div className="tq-card-grid">
          {RELATIONSHIP_TYPES.map((type) => (
            <button
              type="button"
              key={type.id}
              className={`tq-select-card ${startForm.relationshipType === type.id ? "is-selected" : ""}`}
              onClick={() => {
                onChangeForm({ relationshipType: type.id });
                onResetQuestion();
              }}
            >
              <strong>{type.title}</strong>
              <small>{type.description}</small>
            </button>
          ))}
        </div>
      </div>

      <label className="tq-field">
        <span>내 이름 또는 닉네임</span>
        <input
          required
          maxLength={ANSWER_LIMITS.displayName}
          value={startForm.displayName}
          onChange={(event) => onChangeForm({ displayName: event.target.value })}
          placeholder="예: 은"
        />
      </label>

      <div className="tq-flow-note">
        <strong>무료 기본 문답 15문항</strong>
        <p>답변은 마지막 질문에서 한 번에 제출돼요. 작성 중인 내용은 이 기기에 임시 저장됩니다.</p>
      </div>

      <button type="submit" className="tq-button tq-button--primary" disabled={!canStart || isBusy}>
        문답 시작하기
      </button>
    </form>
  );
}
