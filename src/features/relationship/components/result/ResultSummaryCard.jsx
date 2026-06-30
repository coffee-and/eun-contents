export function ResultSummaryCard({ analysis, modeLabel }) {
  return (
    <section className="capture-panel capture-panel--cozy">
      <div className="capture-panel__hero">
        <div className="capture-panel__hero-main">
          <span className="capture-panel__summary-label">
            {modeLabel ?? "관계 리포트"}
          </span>
          <h2 className="capture-panel__title">
            {analysis.relationshipLevel.title}
          </h2>
          <p className="capture-panel__desc">
            {analysis.relationshipLevel.desc}
          </p>
        </div>

        <div className="capture-panel__type-box">
          <span className="capture-panel__type-label">주요 갈등 반응</span>
          <strong className="capture-panel__type-value">
            {analysis.topTypeLabel}
          </strong>
        </div>
      </div>

      <div className="capture-panel__footer">
        <span>EUN CONTENTS · 우리 관계 진단</span>
      </div>
    </section>
  );
}
