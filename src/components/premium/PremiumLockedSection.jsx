import { PREMIUM_PRICE, premiumBenefits } from "../../data/premiumContent.js";

export function PremiumLockedSection({ onClickPayment }) {
  return (
    <section className="card premium-lock">
      <div className="premium-lock__label">PREMIUM REPORT</div>

      <h3 className="premium-lock__title">
        연인과 부부의 관계 과제를 구분해 상담 관점으로 깊이 분석해요
      </h3>

      <p className="premium-lock__desc">
        무료 결과가 현재 관계의 전체적인 흐름을 보여준다면, 프리미엄
        리포트는 선택한 모드와 답변을 근거로 관계의 보호 요인, 취약 지점,
        갈등 구조, 회복 조건과 실제 행동 계획까지 단계별로 정리합니다.
      </p>

      <ul className="premium-lock__list">
        {premiumBenefits.map((benefit) => (
          <li key={benefit}>{benefit}</li>
        ))}
      </ul>

      <div className="premium-lock__sample">
        <div className="premium-lock__sample-label">PREMIUM PREVIEW</div>
        <p>
          연인은 상호성·신뢰 경계·애착 안정감·결혼 전환 준비도를 중심으로
          분석합니다.
        </p>
        <p>
          부부는 보이지 않는 노동·배우자 친밀감·경제와 양가 경계·장기
          공동체를 중심으로 분석합니다.
        </p>
        <p>
          근거 응답 → 상담적 의미 → 관계 영향 → 대화 목표 → 14일 관찰
          계획 순서로 실제 변화 가능성을 점검합니다.
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
