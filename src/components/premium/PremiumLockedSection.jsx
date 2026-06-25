import { PREMIUM_PRICE, premiumBenefits } from "../../data/premiumContent.js";

export function PremiumLockedSection({ onClickPayment }) {
  return (
    <section className="card premium-lock">
      <div className="premium-lock__label">PREMIUM REPORT</div>

      <h3 className="premium-lock__title">
        내 답변을 근거로 관계의 강점과 반복 패턴을 구체적으로 분석해요
      </h3>

      <p className="premium-lock__desc">
        무료 결과가 현재 관계의 전체적인 흐름을 보여준다면, 프리미엄
        리포트는 왜 이런 결과가 나왔는지, 무엇을 먼저 다뤄야 하는지,
        실제로 어떤 행동 변화를 확인해야 하는지를 단계별로 정리합니다.
      </p>

      <ul className="premium-lock__list">
        {premiumBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>

      <div className="premium-lock__sample">
        <div className="premium-lock__sample-label">PREMIUM PREVIEW</div>
        <p>
          근거 응답 → 해석 → 반복될 때의 영향 → 확인할 행동 기준 순서로
          핵심 답변을 분석합니다.
        </p>
        <p>
          가장 약한 영역과 갈등 반응을 연결해, 현재 관계의 악순환이 어디서
          시작되는지 보여줍니다.
        </p>
        <p>
          결과에 맞춘 대화 문장과 7일 실행 플랜으로 실제 변화 여부까지
          점검할 수 있습니다.
        </p>
      </div>

      <button
        type="button"
        className="button button--primary premium-lock__button"
        onClick={onClickPayment}
      >
        테스트 결제로 심층 리포트 열기 · {PREMIUM_PRICE.toLocaleString()}원
      </button>

      <p className="premium-lock__desc">
        현재는 실제 결제 연동 전 테스트 모드이며, 결제 금액이 청구되지
        않습니다.
      </p>
    </section>
  );
}
