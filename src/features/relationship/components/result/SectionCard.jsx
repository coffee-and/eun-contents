import { EditorialCard } from "../../../../shared/components/editorial/EditorialCard.jsx";

const CORE_ANALYSIS_TITLE = "한눈에 보는 관계 보고서";

export function SectionCard({ title, desc, points }) {
  const isCoreAnalysis = title === CORE_ANALYSIS_TITLE;
  const displayTitle = isCoreAnalysis ? "핵심 분석" : title;

  return (
    <EditorialCard
      className={`card result-card${isCoreAnalysis ? " result-card--core-analysis" : ""}`}
      variant="result"
    >
      <div className="result-card__head">
        <h3 className="result-card__title">{displayTitle}</h3>
      </div>

      {!isCoreAnalysis && desc ? <p className="result-card__desc">{desc}</p> : null}

      {points?.length ? (
        <ul className="bullet-list">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
    </EditorialCard>
  );
}
