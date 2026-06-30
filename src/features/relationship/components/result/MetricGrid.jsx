const LABEL_MAP = {
  "감정적 안전감": "정서 교감",
  "현실적 안정성": "현실 조율",
  "갈등 부담 지수": "관계 안정",
  "미래 방향성": "미래 정렬",
};

function formatItem(item) {
  if (item.label !== "갈등 부담 지수") {
    return {
      ...item,
      label: LABEL_MAP[item.label] ?? item.label,
    };
  }

  const burden = Number.parseInt(String(item.value), 10) || 0;
  const stability = Math.max(0, Math.min(100, 100 - burden));

  return {
    ...item,
    label: "관계 안정",
    value: `${stability}/100`,
  };
}

function getNumericPercent(value) {
  const parsedValue = Number.parseInt(String(value), 10);

  if (Number.isNaN(parsedValue)) return null;

  return Math.max(0, Math.min(100, parsedValue));
}

export function MetricGrid({ items }) {
  const formattedItems = items.map(formatItem);

  return (
    <div className="metric-grid">
      {formattedItems.map((item) => {
        const percent = getNumericPercent(item.value);

        return (
          <div
            key={item.label}
            className={`metric-card${
              percent === null ? " metric-card--summary" : ""
            }`}
          >
            <div className="metric-card__head">
              <div className="metric-card__label">{item.label}</div>
              <div className="metric-card__value">{item.value}</div>
            </div>

            {percent === null ? null : (
              <div
                className="metric-card__bar"
                role="meter"
                aria-label={`${item.label} ${item.value}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <span style={{ width: `${percent}%` }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
