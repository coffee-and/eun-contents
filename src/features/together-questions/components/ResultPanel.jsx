// Together Questions 나의 문답집 결과 화면을 표시합니다.
import { Button } from "../../../shared/components/Button.jsx";
import { EMPTY_ANSWER_TEXT } from "../constants/sessionFlow.js";

function formatCompletedDate(value) {
  if (!value) return "날짜 미정";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 미정";

  return date.toLocaleDateString("ko-KR");
}

export function ResultPanel({
  answers,
  completedAt,
  displayName,
  isSaving,
  questions,
  relationship,
  reportRef,
  onPrintPdf,
  onReset,
  onSaveImage,
  onShare,
}) {
  const formattedDate = formatCompletedDate(completedAt);

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
        <Button variant="secondary" onClick={onPrintPdf} disabled={isSaving}>
          PDF 저장
        </Button>
        <Button variant="secondary" onClick={onSaveImage} disabled={isSaving}>
          {isSaving ? "이미지 저장 중…" : "이미지 저장"}
        </Button>
        <Button variant="secondary" onClick={onShare} disabled={isSaving}>
          공유하기
        </Button>
        <Button variant="primary" onClick={onReset} disabled={isSaving}>
          새 문답 시작
        </Button>
      </div>
    </section>
  );
}
