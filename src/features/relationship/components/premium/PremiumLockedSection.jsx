import { Button } from "../../../../shared/components/Button.jsx";
import { PREMIUM_PRICE } from "../../data/premiumContent.js";

const premiumSamples = [
  {
    number: "01",
    title: "관계를 지탱하는 보호 요인",
    description:
      "갈등 뒤에도 다시 연결하려는 시도처럼, 현재 관계 안에서 회복을 돕는 강점을 답변 근거와 함께 보여줍니다.",
  },
  {
    number: "02",
    title: "반복되는 취약 지점",
    description:
      "서운함이 커지는 순간과 방어가 먼저 시작되는 흐름을 구분해, 무엇을 먼저 조율해야 하는지 정리합니다.",
  },
  {
    number: "03",
    title: "상황별 대화 가이드",
    description:
      "설득보다 감정을 먼저 전달할 수 있도록 실제로 꺼내 쓸 수 있는 대화 문장과 14일 관찰 포인트를 제안합니다.",
  },
];

export function PremiumLockedSection({ onClickPayment }) {
  return (
    <section className="card premium-lock">
      <div className="premium-lock__label">PREMIUM REPORT PREVIEW</div>

      <h3 className="premium-lock__title">
        프리미엄 리포트에서는 이런 방식으로 관계를 더 깊이 읽어요
      </h3>

      <p className="premium-lock__desc">
        실제 리포트에서 만나게 될 분석 형태를 먼저 보여드려요. 아래 내용은
        구성 예시이며, 실제 결과는 선택한 관계 모드와 답변에 맞춰 달라집니다.
      </p>

      <div className="premium-lock__preview-grid">
        {premiumSamples.map((sample) => (
          <article className="premium-lock__preview-card" key={sample.number}>
            <span className="premium-lock__preview-number">{sample.number}</span>
            <h4>{sample.title}</h4>
            <p>{sample.description}</p>
          </article>
        ))}
      </div>

      <Button
        variant="primary"
        className="premium-lock__button"
        onClick={onClickPayment}
      >
        테스트 결제로 심층 리포트 열기 · {PREMIUM_PRICE.toLocaleString()}원
      </Button>

      <p className="premium-lock__desc">
        현재는 실제 결제 연동 전 테스트 모드이며, 결제 금액이 청구되지
        않습니다.
      </p>
    </section>
  );
}
