import { buildCounselingReport } from "../../domain/buildCounselingReport.js";

function PremiumSection({ title, description, points }) {
  return (
    <article className="premium-report__section">
      <h4>{title}</h4>
      <p>{description}</p>

      {points?.length ? (
        <ul className="premium-report__points">
          {points.map((point, index) => (
            <li key={`${title}-${index}`}>{point}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function PremiumReport({ analysis, answers = [] }) {
  const report = buildCounselingReport(analysis, answers);

  return (
    <section className="card premium-report">
      <div className="premium-report__label">{report.eyebrow}</div>

      <h3 className="premium-report__title">{report.title}</h3>

      <p className="premium-report__desc">{report.intro}</p>

      <div className="premium-report__summary">
        <div>
          <span>현재 관계 단계</span>
          <strong>{analysis.relationshipLevel.title}</strong>
        </div>
        <div>
          <span>주요 갈등 반응</span>
          <strong>{analysis.topTypeLabel}</strong>
        </div>
        <div>
          <span>종합 관계 지수</span>
          <strong>{analysis.finalValue} / 100</strong>
        </div>
        <div>
          <span>갈등 부담 지수</span>
          <strong>{analysis.conflictRisk} / 100</strong>
        </div>
      </div>

      <div className="premium-report__sections">
        {report.sections.map((section, index) => (
          <PremiumSection
            key={section.title}
            title={`${index + 1}. ${section.title}`}
            description={section.description}
            points={section.points}
          />
        ))}
      </div>
    </section>
  );
}
