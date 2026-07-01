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
  const relationshipStability = Math.max(
    0,
    Math.min(100, 100 - Number(analysis.conflictRisk ?? 0))
  );

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
          <span>정서 교감</span>
          <strong>{analysis.categoryScores.emotion} / 100</strong>
        </div>
        <div>
          <span>현실 조율</span>
          <strong>{analysis.categoryScores.stability} / 100</strong>
        </div>
        <div>
          <span>관계 안정</span>
          <strong>{relationshipStability} / 100</strong>
        </div>
        <div>
          <span>미래 정렬</span>
          <strong>{analysis.categoryScores.future} / 100</strong>
        </div>
        <div>
          <span>종합 관계 지수</span>
          <strong>{analysis.finalValue} / 100</strong>
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
