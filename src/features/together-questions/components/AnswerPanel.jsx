// Together Questions 문답지형 작성 화면을 표시합니다.
import { Button } from "../../../shared/components/Button.jsx";
import { ANSWER_LIMITS } from "../constants/sessionFlow.js";

export function AnswerPanel({
  answers,
  displayName,
  displayNameError,
  displayNameInputRef,
  isSaving,
  questions,
  relationship,
  onAnswerChange,
  onComplete,
  onDisplayNameChange,
}) {
  return (
    <section className="tq-panel tq-answer-panel">
      <div className="tq-sheet-head">
        <div>
          <span>QUESTION BOOK</span>
          <h2>{relationship?.title ?? "나의"} 문답지</h2>
          <p>한 번에 모두 채우지 않아도 괜찮아요. 쓰는 동안 이 기기에 임시 저장됩니다.</p>
        </div>
      </div>

      <label className="tq-field tq-name-field" htmlFor="tq-display-name">
        <span>문답에 표시할 이름</span>
        <input
          ref={displayNameInputRef}
          id="tq-display-name"
          maxLength={ANSWER_LIMITS.displayName}
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          aria-invalid={displayNameError ? "true" : "false"}
          aria-describedby={displayNameError ? "tq-display-name-error" : undefined}
        />
        {displayNameError ? (
          <small className="tq-field-error" id="tq-display-name-error">
            {displayNameError}
          </small>
        ) : null}
      </label>

      <div className="tq-question-list">
        {questions.map((question) => (
          <article className="tq-question-item" key={question.id}>
            <div className="tq-question-item__head">
              <span>
                {question.order}. {question.category}
              </span>
              <h3>{question.prompt}</h3>
            </div>
            <label className="tq-answer-field">
              <span className="visually-hidden">{question.order}번 답변</span>
              <textarea
                rows="5"
                maxLength={ANSWER_LIMITS.answer}
                value={answers[question.id] ?? ""}
                onChange={(event) => onAnswerChange(question.id, event.target.value)}
                placeholder="지금 떠오르는 마음을 편하게 적어주세요."
              />
            </label>
          </article>
        ))}
      </div>

      <div className="tq-sheet-actions">
        <Button variant="primary" disabled={isSaving} onClick={onComplete}>
          문답 완성하기
        </Button>
      </div>
    </section>
  );
}
