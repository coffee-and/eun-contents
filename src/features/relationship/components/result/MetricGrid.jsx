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

export function MetricGrid({ items }) {
  const formattedItems = items.map(formatItem);

  return (
    <div className="metric-grid">
      {formattedItems.map((item) => (
        <div key={item.label} className="metric-card">
          <div className="metric-card__label">{item.label}</div>
          <div className="metric-card__value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
