import { premiumActionSections } from "../../data/premiumContent.js";

function PremiumSection({ title, description, points }) {
  return (
    <article className="premium-report__section">
      <h4>{title}</h4>
      <p>{description}</p>

      {points?.length ? (
        <ul className="premium-report__points">
          {points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

// 결제 후 보여줄 프리미엄 상세 리포트
export function PremiumReport({ analysis }) {
  const personalizedSections = [
    {
      title: "1. 핵심 진단",
      description:
        "무료 결과에서 확인한 관계의 큰 흐름을 바탕으로, 현재 가장 중요하게 점검해야 할 지점을 정리했습니다. 이 항목은 전체 리포트의 출발점으로, 감정 상태와 안정성, 갈등 위험, 미래 방향성이 서로 어떻게 영향을 주고받는지 한눈에 볼 수 있도록 요약합니다.",
      points: analysis.summaryLines,
    },
    {
      title: "2. 감정 상태 분석",
      description: `${analysis.emotionReport.desc} 감정 상태는 관계를 계속 이어가고 싶은 마음과 실제로 관계 안에서 회복되는 느낌 사이의 차이를 보여줍니다. 같은 갈등이라도 감정 소모가 누적되어 있으면 더 크게 받아들여질 수 있으므로, 현재의 불안과 피로가 일시적인지 반복적인지 구분하는 것이 중요합니다.`,
      points: analysis.emotionReport.points,
    },
    {
      title: "3. 관계 안정성 분석",
      description: `${analysis.stabilityReport.desc} 관계 안정성은 단순히 좋아하는 마음이 남아 있는지를 보는 항목이 아니라, 신뢰와 존중, 회복 방식, 현실적인 조건이 관계를 지탱하고 있는지를 함께 살펴보는 지표입니다. 이 점수가 흔들릴수록 작은 갈등도 관계 전체에 대한 의심으로 번질 가능성이 커집니다.`,
      points: analysis.stabilityReport.points,
    },
    {
      title: "4. 갈등 패턴 분석",
      description: `${analysis.conflictReport.desc} 갈등 패턴은 누가 더 잘못했는지를 판단하기보다, 문제가 생겼을 때 두 사람이 어떤 방식으로 가까워지거나 멀어지는지를 확인하는 영역입니다. 반복되는 반응을 알면 감정이 커지기 전에 멈출 지점과 다시 대화할 방식을 더 구체적으로 정할 수 있습니다.`,
      points: analysis.conflictReport.points,
    },
    {
      title: "5. 미래 방향성 분석",
      description: `${analysis.futureReport.desc} 미래 방향성은 장기적으로 같은 그림을 그리고 있는지, 혹은 중요한 선택 앞에서 계속 다른 방향을 바라보고 있는지를 보여줍니다. 현재의 애정이 충분하더라도 생활 방식, 결혼관, 거주, 커리어 우선순위가 맞지 않으면 시간이 갈수록 조율 비용이 커질 수 있습니다.`,
      points: analysis.futureReport.points,
    },
  ];

  return (
    <section className="card premium-report">
      <div className="premium-report__label">PREMIUM REPORT</div>

      <h3 className="premium-report__title">관계 상세 리포트</h3>

      <p className="premium-report__desc">
        프리미엄 리포트는 무료 결과에서 확인한 핵심 흐름을 바탕으로 감정 소모,
        관계 안정성, 반복 갈등, 미래 방향성을 더 구체적으로 해석합니다. 현재
        관계에서 무엇을 유지하고, 무엇을 조정해야 하는지 확인할 수 있습니다.
      </p>

      <div className="premium-report__summary">
        <div>
          <span>관계 결과</span>
          <strong>{analysis.relationshipLevel.title}</strong>
        </div>
        <div>
          <span>대표 갈등 경향</span>
          <strong>{analysis.topTypeLabel}</strong>
        </div>
        <div>
          <span>최종 판단값</span>
          <strong>{analysis.finalValue}</strong>
        </div>
        <div>
          <span>갈등 리스크</span>
          <strong>{analysis.conflictRisk}</strong>
        </div>
      </div>

      <div className="premium-report__sections">
        {personalizedSections.map((section) => (
          <PremiumSection
            key={section.title}
            title={section.title}
            description={section.description}
            points={section.points}
          />
        ))}

        {premiumActionSections.map((section) => (
          <PremiumSection
            key={section.title}
            title={section.title}
            description={section.description}
            points={section.points}
          />
        ))}
      </div>
    </section>
  );
}
