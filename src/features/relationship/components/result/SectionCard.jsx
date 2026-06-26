export function SectionCard({ title, desc, points }) {
  return (
    <section className="card result-card">
      <div className="result-card__head">
        <h3 className="result-card__title">{title}</h3>
      </div>

      {desc ? <p className="result-card__desc">{desc}</p> : null}

      {points?.length ? (
        <ul className="bullet-list">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}