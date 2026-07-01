import { useEffect, useRef, useState } from "react";
import { Button } from "../../../../shared/components/Button.jsx";
import { TextAction } from "../../../../shared/components/TextAction.jsx";
import { EditorialCard } from "../../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialResultActions } from "../../../../shared/components/editorial/EditorialResultLayout.jsx";
import {
  CATEGORY_META,
  RELATIONSHIP_MODE_META,
} from "../../data/config.js";
import { MetricGrid } from "./MetricGrid.jsx";
import { ResultSummaryCard } from "./ResultSummaryCard.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { PremiumLockedSection } from "../premium/PremiumLockedSection.jsx";
import { PremiumReport } from "../premium/PremiumReport.jsx";
import { useResultCapture } from "./useResultCapture.js";
import { useResultSharing } from "./useResultSharing.js";

export function ResultView({
  analysis,
  answers,
  relationshipMode,
  onRestart,
  onChooseAgain,
  shareConfig,
  isSavedResult = false,
  savedResultId,
  savedAt,
}) {
  const captureRef = useRef(null);
  const premiumReportRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const modeLabel = relationshipMode
    ? RELATIONSHIP_MODE_META[relationshipMode]?.shortLabel
    : analysis.relationshipLabel;

  const {
    savedResultUrl,
    serverSaveStatus,
    isShareModalOpen,
    setIsShareModalOpen,
    canNativeShare,
    handleOpenShareModal,
    handleNativeShare,
    handleCopyShareLink,
    handleShareModalBackdrop,
  } = useResultSharing({
    analysis,
    answers,
    relationshipMode,
    shareConfig,
    modeLabel,
    isSavedResult,
    savedResultId,
  });

  const { handleCapture } = useResultCapture({
    captureRef,
    isPremium,
    fileName: shareConfig.fileName,
  });

  const detailedSections = [
    {
      title: "감정적 안전감 분석",
      desc: analysis.emotionReport.desc,
      points: analysis.emotionReport.points,
    },
    {
      title: "현실적 안정성 분석",
      desc: analysis.stabilityReport.desc,
      points: analysis.stabilityReport.points,
    },
    {
      title: analysis.conflictReport.title,
      desc: analysis.conflictReport.desc,
      points: analysis.conflictReport.points,
    },
    {
      title: "미래 방향성 분석",
      desc: analysis.futureReport.desc,
      points: analysis.futureReport.points,
    },
  ];

  useEffect(() => {
    if (!isPremium || !premiumReportRef.current) return;

    requestAnimationFrame(() => {
      premiumReportRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    });
  }, [isPremium]);

  function handlePaymentClick() {
    const isConfirmed = window.confirm(
      "테스트 모드로 프리미엄 리포트를 열까요? 실제 결제 금액은 청구되지 않습니다."
    );

    if (!isConfirmed) return;

    setShowComingSoon(false);
    setIsPremium(true);
  }

  return (
    <>
      {isSavedResult ? (
        <EditorialCard className="card saved-result-notice" variant="notice">
          <span className="saved-result-notice__label">SAVED RESULT</span>
          <h3 className="result-card__title">저장된 결과를 다시 보고 있어요</h3>
          <p className="result-card__desc">
            {savedAt
              ? `${new Date(savedAt).toLocaleString("ko-KR")}에 저장된 결과입니다.`
              : "이전에 저장한 결과입니다."}
          </p>
        </EditorialCard>
      ) : null}

      <div ref={captureRef} className="capture-export">
        <ResultSummaryCard analysis={analysis} modeLabel={modeLabel} />

        <SectionCard
          variant="core-analysis"
          title="핵심 분석"
          desc="선택한 답변을 바탕으로 현재 관계의 강점과 조율이 필요한 영역을 요약했습니다. 아래 지표는 각 영역의 서로 다른 배점 범위를 0~100으로 환산한 앱 내부 참고값이며, 임상 진단이나 표준화 검사 점수가 아닙니다."
          points={analysis.summaryLines}
        />

        <EditorialCard className="card result-card" variant="result">
          <h3 className="result-card__title">영역별 참고 지수</h3>
          <p className="result-card__desc">
            낮은 점수는 사람이나 관계의 가치를 뜻하지 않고, 어느 영역을 먼저 대화해야 하는지 보여주는 신호입니다.
          </p>

          <MetricGrid
            items={[
              {
                label: "감정적 안전감",
                value: `${analysis.categoryScores.emotion}/100`,
              },
              {
                label: "현실적 안정성",
                value: `${analysis.categoryScores.stability}/100`,
              },
              { label: "갈등 부담 지수", value: `${analysis.conflictRisk}/100` },
              {
                label: CATEGORY_META.future.label,
                value: `${analysis.categoryScores.future}/100`,
              },
            ]}
          />
        </EditorialCard>

        {detailedSections.map((section) => (
          <SectionCard
            key={section.title}
            title={section.title}
            desc={section.desc}
            points={section.points}
          />
        ))}

        {isPremium ? (
          <div ref={premiumReportRef}>
            <PremiumReport analysis={analysis} answers={answers} />
          </div>
        ) : null}
      </div>

      {!isPremium ? (
        <PremiumLockedSection
          onClickPayment={handlePaymentClick}
          showComingSoon={showComingSoon}
        />
      ) : null}

      <EditorialCard className="card result-card answer-toggle-card" variant="action">
        <button
          type="button"
          className="answer-toggle-card__button"
          onClick={() => setIsAnswerOpen((prev) => !prev)}
        >
          <span>
            <strong>내가 선택한 답변 보기</strong>
            <small>
              선택 흐름을 다시 보면 결과를 더 쉽게 이해할 수 있어요.
            </small>
          </span>

          <em>{isAnswerOpen ? "닫기" : "열기"}</em>
        </button>

        {isAnswerOpen ? (
          <ul className="answer-list">
            {answers.map((answer) => (
              <li key={answer.questionId}>
                <strong>
                  [{CATEGORY_META[answer.category]?.label ?? answer.category}]
                </strong>{" "}
                {answer.question}
                <br />→ {answer.selectedLabel}
              </li>
            ))}
          </ul>
        ) : null}
      </EditorialCard>

      <EditorialCard className="card result-card result-card--actions" variant="action">
        <h3 className="result-card__title">결과 저장 / 공유</h3>
        <p className="result-card__desc">
          결과 카드 이미지를 저장하거나, 결과 링크를 바로 공유할 수 있어요.
        </p>

        {savedResultUrl ? (
          <div className="saved-result-link-box">
            <span>저장된 결과 링크</span>
            <p>{savedResultUrl}</p>
          </div>
        ) : null}

        <EditorialResultActions className="button-row">
          <Button variant="ghost" onClick={handleCapture}>
            결과 카드 이미지 저장
          </Button>

          <Button
            variant="primary"
            onClick={handleOpenShareModal}
            disabled={serverSaveStatus === "saving"}
          >
            {serverSaveStatus === "saving" ? "공유 링크 준비 중..." : "공유하기"}
          </Button>

          <TextAction onClick={onRestart}>
            처음으로
          </TextAction>

          <TextAction onClick={onChooseAgain}>
            ← 다시 선택하기
          </TextAction>
        </EditorialResultActions>
      </EditorialCard>

      {isShareModalOpen ? (
        <div
          className="share-modal"
          role="presentation"
          onMouseDown={handleShareModalBackdrop}
        >
          <section
            className="share-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="share-modal__header">
              <div>
                <h3 id="share-modal-title">결과 공유하기</h3>
                <p>공유할 방법을 선택해 주세요.</p>
              </div>

              <TextAction
                className="share-modal__close"
                onClick={() => setIsShareModalOpen(false)}
                aria-label="공유 창 닫기"
              >
                닫기
              </TextAction>
            </div>

            <div className="share-modal__actions">
              {canNativeShare ? (
                <Button variant="primary" onClick={handleNativeShare}>
                  다른 앱으로 공유
                </Button>
              ) : null}

              <Button variant="primary" onClick={handleCopyShareLink}>
                링크 복사
              </Button>

              <TextAction onClick={() => setIsShareModalOpen(false)}>
                닫기
              </TextAction>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
