// Together Questions 문답지형 작성 화면을 표시합니다.
import { ANSWER_LIMITS } from "../constants/sessionFlow.js";

export function AnswerPanel({ answers, isSaving, questions, relationship, onAnswerChange, onComplete, onReset }) {
  return (
    <section className="tq-panel tq-answer-panel">
      <div className="tq-sheet-head">
        <div>
          <span>QUESTION BOOK</span>
          <h2>{relationship?.title ?? "나의"} 문답지</h2>
          <p>한 번에 모두 채우지 않아도 괜찮아요. 쓰는 동안 이 기기에 임시 저장됩니다.</p>
        </div>
        <button type="button" className="tq-button tq-button--ghost" onClick={onReset}>
          다시 선택하기
        </button>
      </div>

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
        <button type="button" className="tq-button tq-button--primary" disabled={isSaving} onClick={onComplete}>
          문답 완성하기
        </button>
      </div>
    </section>
  );
}
