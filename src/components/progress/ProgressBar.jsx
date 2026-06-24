export function ProgressBar({ value }) {
  return (
    <div className="progress">
      <div className="progress__fill" style={{ width: `${value}%` }} />
    </div>
  );
}