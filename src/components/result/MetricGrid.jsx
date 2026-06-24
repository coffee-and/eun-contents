// 숫자 지표는 같은 카드 레이아웃을 재사용
export function MetricGrid({ items }) {
  return (
    <div className="metric-grid">
      {items.map((item) => (
        <div key={item.label} className="metric-card">
          <div className="metric-card__label">{item.label}</div>
          <div className="metric-card__value">{item.value}</div>
        </div>
      ))}
    </div>
  );
}