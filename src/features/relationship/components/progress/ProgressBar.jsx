export function ProgressBar({ value }) {
  const tone = value <= 33 ? "early" : value <= 66 ? "middle" : "late";

  return (
    <div className="progress" aria-label={`진행률 ${Math.round(value)}%`}>
      <div
        className={`progress__fill progress__fill--${tone}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
