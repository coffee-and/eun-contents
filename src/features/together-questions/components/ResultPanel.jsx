// 두 사람이 모두 제출한 뒤 결과 리포트를 표시합니다.
export function ResultPanel({
  comparisonSummary,
  comparisons,
  reportRef,
  selectedPack,
  selectedType,
  session,
  onDelete,
  onPrintPdf,
  onReset,
  onSaveImage,
}) {
  return (
    <section className="tq-complete-wrap">
      <article className="tq-complete-card tq-journal-report" ref={reportRef}>
        <span>함께 결과 보기</span>
        <h2>
          {session.participants.creator?.displayName}님과 {session.participants.invitee?.displayName}님의 문답
        </h2>
        <p>
          {selectedType?.title} · {selectedPack?.title} ·{" "}
          {new Date(session.completedAt ?? Date.now()).toLocaleDateString("ko-KR")}
        </p>

        <div className="tq-summary-grid">
          <section>
            <h3>같은 생각이었던 부분</h3>
            <ul>{comparisonSummary.shared.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h3>서로 다르게 생각한 부분</h3>
            <ul>{comparisonSummary.different.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section>
            <h3>더 이야기해볼 질문</h3>
            <ul>{comparisonSummary.followUps.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>

        <div className="tq-answer-report">
          {comparisons.map((item) => (
            <section key={item.question.id}>
              <small>{item.question.category}</small>
              <h3>{item.question.prompt}</h3>
              <div>
                <strong>{session.participants.creator?.displayName}</strong>
                <p>{item.creatorAnswer}</p>
              </div>
              <div>
                <strong>{session.participants.invitee?.displayName}</strong>
                <p>{item.inviteeAnswer}</p>
              </div>
            </section>
          ))}
        </div>
      </article>

      <div className="tq-export-actions">
        <button type="button" className="tq-button tq-button--secondary" onClick={onSaveImage}>
          이미지 저장
        </button>
        <button type="button" className="tq-button tq-button--secondary" onClick={onPrintPdf}>
          PDF 저장
        </button>
        <button type="button" className="tq-button tq-button--danger" onClick={onDelete}>
          문답 삭제
        </button>
        <button type="button" className="tq-button tq-button--primary" onClick={onReset}>
          새 문답 시작
        </button>
      </div>
    </section>
  );
}
