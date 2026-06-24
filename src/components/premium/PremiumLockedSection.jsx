import { PREMIUM_PRICE, premiumBenefits } from "../../data/premiumContent.js";

// 프리미엄 리포트 결제 전 잠금 카드
export function PremiumLockedSection({ onClickPayment }) {
  return (
    <section className="card premium-lock">
      <div className="premium-lock__label">PREMIUM REPORT</div>

      <h3 className="premium-lock__title">
        관계의 반복 패턴을 더 깊게 확인해보세요
      </h3>

      <p className="premium-lock__desc">
        무료 결과에서는 현재 관계의 핵심 흐름을 요약하고, 프리미엄 리포트에서는
        반복되는 갈등 구조와 실제 대화에 사용할 수 있는 문장 가이드까지
        제공합니다.
      </p>

      <ul className="premium-lock__list">
        {premiumBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>

      <div className="premium-lock__sample">
        <div className="premium-lock__sample-label">PREMIUM PREVIEW</div>
        <p>
          “갈등의 핵심은 사건 자체보다, 이후 회복 방식의 차이에 있을 수
          있습니다.”
        </p>
        <p>
          “한쪽은 빠른 확인을 원하고, 다른 한쪽은 시간을 두고 정리하려는 흐름이
          반복될 수 있습니다.”
        </p>
        <p>
          “이 차이가 누적되면 작은 문제도 관계 전체의 불안으로 확장될 수
          있습니다.”
        </p>
      </div>

      <button
        type="button"
        className="button button--primary premium-lock__button"
        onClick={onClickPayment}
      >
        테스트 결제하기 · ₩{PREMIUM_PRICE.toLocaleString()}
      </button>
    </section>
  );
}
