import { EditorialCard } from "../../../../shared/components/editorial/EditorialCard.jsx";

export function SectionCard({ title, desc, points, variant }) {
  const isCoreAnalysis = variant === "core-analysis";

  return (
    <EditorialCard
      className={`card result-card${isCoreAnalysis ? " result-card--core-analysis" : ""}`}
      variant="result"
    >
      <div className="result-card__head">
        <h3 className="result-card__title">{title}</h3>
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
