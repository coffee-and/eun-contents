import { PREMIUM_PRICE, premiumBenefits } from "../../data/premiumContent.js";

export function PremiumLockedSection({ onClickPayment }) {
  return (
    <section className="card premium-lock">
      <div className="premium-lock__label">PREMIUM REPORT</div>

      <h3 className="premium-lock__title">
        관계를 더 깊게 해석한 상세 보고서를 열어볼 수 있어요
      </h3>

      <p className="premium-lock__desc">
        무료 결과가 현재 관계의 큰 흐름을 보여준다면, 프리미엄 리포트는 왜 그런 결과가 나왔는지와 실제로 어떤 대화를 해야 하는지를 더 구체적으로 정리합니다.
      </p>

      <ul className="premium-lock__list">
        {premiumBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>

      <div className="premium-lock__sample">
        <div className="premium-lock__sample-label">PREMIUM PREVIEW</div>
        <p>성숙한 사랑의 요소 중 현재 관계에서 가장 강한 축과 약한 축을 분리해 보여줍니다.</p>
        <p>반복 갈등은 주제보다 패턴이 중요하므로, 어떤 대화 방식이 관계를 지치게 하는지 정리합니다.</p>
        <p>결과에 맞춘 대화 질문과 7일 실행 플랜을 제공해 바로 점검할 수 있게 합니다.</p>
      </div>

      <button
        type="button"
        className="button button--primary premium-lock__button"
        onClick={onClickPayment}
      >
        테스트 결제하기 · {PREMIUM_PRICE.toLocaleString()}원
      </button>
    </section>
  );
}
