// Together Questions 질문 답변 화면을 표시합니다.
import { ANSWER_LIMITS, PARTICIPANT_ROLES } from "../constants/sessionFlow.js";

export function AnswerPanel({
  answers,
  currentQuestion,
  isSaving,
  participantRole,
  questionIndex,
  questions,
  onAnswerChange,
  onNext,
  onPrevious,
  onReset,
}) {
  const isCreator = participantRole === PARTICIPANT_ROLES.CREATOR;
  const isLastQuestion = questionIndex === questions.length - 1;

  return (
    <section className="tq-panel tq-answer-panel">
      <div className="tq-progress">
        <span>{currentQuestion?.category}</span>
        <strong>
          {questionIndex + 1} / {questions.length}
        </strong>
        <div aria-hidden="true">
          <i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="tq-inline-actions">
        <button type="button" className="tq-button tq-button--ghost" onClick={onReset}>
          다시 선택하기
        </button>
      </div>

      <article className="tq-question-card">
        <span>오늘의 질문</span>
        <h2>{currentQuestion?.prompt}</h2>
        <p>{currentQuestion?.helperText}</p>
      </article>

      <label className="tq-answer-field">
        <span>나의 답변</span>
        <textarea
          rows="8"
          maxLength={ANSWER_LIMITS.answer}
          value={answers[currentQuestion?.id] ?? ""}
          onChange={(event) => onAnswerChange(currentQuestion.id, event.target.value)}
          placeholder="정답은 없어요. 지금 떠오르는 내 마음을 편하게 적어주세요."
        />
        <small>답변은 이 기기에 임시 저장되고, 마지막 질문에서 한 번에 제출돼요.</small>
      </label>

      <div className="tq-actions tq-actions--split">
        <button
          type="button"
          className="tq-button tq-button--secondary"
          disabled={questionIndex === 0 || isSaving}
          onClick={onPrevious}
        >
          이전 질문
        </button>
        <button type="button" className="tq-button tq-button--primary" disabled={isSaving} onClick={onNext}>
          {isLastQuestion ? (isCreator ? "내 답변 완료하기" : "답변 제출하기") : "다음 질문"}
        </button>
      </div>
    </section>
  );
}
