// Together Questions 나의 문답집 결과 화면을 표시합니다.
import { EMPTY_ANSWER_TEXT } from "../constants/sessionFlow.js";

export function ResultPanel({
  answers,
  completedAt,
  displayName,
  questions,
  relationship,
  reportRef,
  onPrintPdf,
  onReset,
  onSaveImage,
  onShare,
}) {
  const formattedDate = new Date(completedAt ?? Date.now()).toLocaleDateString("ko-KR");

  return (
    <section className="tq-complete-wrap">
      <article className="tq-complete-card tq-journal-report" ref={reportRef}>
        <span>MY QUESTION BOOK</span>
        <h2>{displayName ? `${displayName}님의 문답집` : "나의 문답집"}</h2>
        <p>
          {formattedDate} · {relationship?.title ?? "문답"} · 기본 문답 {questions.length}문항
        </p>

        <div className="tq-answer-report">
          {questions.map((question) => (
            <section key={question.id}>
              <small>
                {question.order}. {question.category}
              </small>
              <h3>{question.prompt}</h3>
              <p>{answers[question.id]?.trim() || EMPTY_ANSWER_TEXT}</p>
            </section>
          ))}
        </div>
      </article>

      <div className="tq-export-actions">
        <button type="button" className="tq-button tq-button--secondary" onClick={onPrintPdf}>
          PDF 저장
        </button>
        <button type="button" className="tq-button tq-button--secondary" onClick={onSaveImage}>
          이미지 저장
        </button>
        <button type="button" className="tq-button tq-button--secondary" onClick={onShare}>
          공유하기
        </button>
        <button type="button" className="tq-button tq-button--primary" onClick={onReset}>
          새 문답 시작
        </button>
      </div>
    </section>
  );
}
