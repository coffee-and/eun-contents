// Together Questions 시작 화면을 표시합니다.
import { ANSWER_LIMITS } from "../constants/sessionFlow.js";
import { QUESTION_PACKS, RELATIONSHIP_TYPES } from "../data/index.js";

export function StartPanel({ startForm, canStart, isBusy, onSubmit, onChangeForm, onResetQuestion }) {
  return (
    <form className="tq-panel tq-start" onSubmit={onSubmit}>
      <div className="tq-section__head">
        <span>START</span>
        <h2>나의 문답집을 시작해볼까요?</h2>
        <p>관계를 고르고 한 페이지 문답지에 차근차근 답해요.</p>
      </div>

      <div className="tq-choice-group">
        <span>문답 관계</span>
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
        <strong>무료 기본 문답 30문항</strong>
        <p>
          {QUESTION_PACKS[1].title} {QUESTION_PACKS[1].questionCount}문항은 프리미엄으로 준비 중이에요.
          작성 중인 내용은 이 기기에 임시 저장됩니다.
        </p>
      </div>

      <button type="submit" className="tq-button tq-button--primary" disabled={!canStart || isBusy}>
        문답 시작하기
      </button>
    </form>
  );
}
