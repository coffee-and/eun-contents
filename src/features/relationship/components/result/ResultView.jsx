import { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  APP_COPY,
  CATEGORY_META,
  RELATIONSHIP_MODE_META,
} from "../../data/config.js";
import { buildResultUrl, saveResult } from "../../utils/resultStorage.js";
import { MetricGrid } from "./MetricGrid.jsx";
import { SectionCard } from "./SectionCard.jsx";
import { PremiumLockedSection } from "../premium/PremiumLockedSection.jsx";
import { PremiumReport } from "../premium/PremiumReport.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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
  const saveRequestRef = useRef(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [savedResultUrl, setSavedResultUrl] = useState(() =>
    isSavedResult && savedResultId ? buildResultUrl(savedResultId) : ""
  );
  const [serverResultId, setServerResultId] = useState(() =>
    isSavedResult && savedResultId ? savedResultId : ""
  );
  const [serverSaveStatus, setServerSaveStatus] = useState("idle");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && Boolean(navigator.share);
  const modeLabel = relationshipMode
    ? RELATIONSHIP_MODE_META[relationshipMode]?.shortLabel
    : analysis.relationshipLabel;

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

  useEffect(() => {
    if (!isShareModalOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsShareModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isShareModalOpen]);

  function handlePaymentClick() {
    const isConfirmed = window.confirm(
      "테스트 모드로 프리미엄 리포트를 열까요? 실제 결제 금액은 청구되지 않습니다."
    );

    if (!isConfirmed) return;

    setShowComingSoon(false);
    setIsPremium(true);
  }

  async function prepareSavedResultUrl() {
    if (savedResultUrl) return savedResultUrl;
    if (saveRequestRef.current) return saveRequestRef.current;

    saveRequestRef.current = saveAndBuildResultUrl();

    try {
      return await saveRequestRef.current;
    } finally {
      saveRequestRef.current = null;
    }
  }

  async function saveAndBuildResultUrl() {
    let remoteResultId = serverResultId;

    if (!remoteResultId) {
      setServerSaveStatus("saving");

      try {
        const response = await fetch(`${API_BASE_URL}/api/results`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: relationshipMode ?? "relationship",
            answers: {
              items: answers,
            },
            scores: {
              finalValue: analysis.finalValue,
              conflictRisk: analysis.conflictRisk,
              categoryScores: analysis.categoryScores,
            },
            analysis,
            resultType: analysis.relationshipLevel.title,
          }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.ok || !payload.result?.id) {
          throw new Error("Result server save failed.");
        }

        remoteResultId = payload.result.id;
        setServerResultId(remoteResultId);
        setServerSaveStatus("saved");
      } catch (error) {
        setServerSaveStatus("error");
        console.error("Failed to save result on server.", error);
        window.alert("서버 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
    }

    saveResult({ analysis, answers, relationshipMode });
    const nextUrl = buildResultUrl(remoteResultId);

    setSavedResultUrl(nextUrl);
    return nextUrl;
  }

  async function handleOpenShareModal() {
    if (serverSaveStatus === "saving") return;

    const nextUrl = savedResultUrl || (await prepareSavedResultUrl());

    if (!nextUrl) return;

    setIsShareModalOpen(true);
  }

  async function handleNativeShare() {
    if (!canNativeShare) return;

    try {
      await navigator.share({
        title: shareConfig.title,
        text: `내 ${modeLabel ?? "관계"} 테스트 결과: ${analysis.relationshipLevel.title}`,
        url: savedResultUrl,
      });
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Failed to share result.", error);
    }
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(savedResultUrl);
      window.alert("결과 링크를 클립보드에 복사했어요.");
      setIsShareModalOpen(false);
    } catch (error) {
      window.alert("링크 복사에 실패했어요. 다시 시도해 주세요.");
    }
  }

  function handleShareModalBackdrop() {
    setIsShareModalOpen(false);
  }

  async function handleCapture() {
    const node = captureRef.current;

    if (!node) return;

    const shouldIncludePremium =
      isPremium &&
      window.confirm("프리미엄 리포트 내용도 결과 이미지에 포함할까요?");

    node.classList.add("capture-export--saving");

    if (isPremium && !shouldIncludePremium) {
      node.classList.add("capture-export--hide-premium");
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    try {
      const canvas = await html2canvas(node, {
        backgroundColor: "#f7eef3",
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const link = document.createElement("a");
      link.download = shareConfig.fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      node.classList.remove("capture-export--saving");
      node.classList.remove("capture-export--hide-premium");
    }
  }

  return (
    <>
      {isSavedResult ? (
        <section className="card saved-result-notice">
          <span className="saved-result-notice__label">SAVED RESULT</span>
          <h3 className="result-card__title">저장된 결과를 다시 보고 있어요</h3>
          <p className="result-card__desc">
            {savedAt
              ? `${new Date(savedAt).toLocaleString("ko-KR")}에 저장된 결과입니다.`
              : "이전에 저장한 결과입니다."}
          </p>
        </section>
      ) : null}

      <div ref={captureRef} className="capture-export">
        <section className="capture-panel capture-panel--cozy">
          <div className="capture-panel__hero">
            <div className="capture-panel__hero-main">
              <span className="capture-panel__summary-label">
                {modeLabel ?? "관계 리포트"}
              </span>
              <h2 className="capture-panel__title">
                {analysis.relationshipLevel.title}
              </h2>
              <p className="capture-panel__desc">
                {analysis.relationshipLevel.desc}
              </p>
            </div>

            <div className="capture-panel__type-box">
              <span className="capture-panel__type-label">주요 갈등 반응</span>
              <strong className="capture-panel__type-value">
                {analysis.topTypeLabel}
              </strong>
            </div>
          </div>

          <div className="capture-panel__summary-box">
            <span className="capture-panel__summary-label">핵심 분석</span>
            <p className="capture-panel__summary-text">
              {analysis.summaryLines[0]}
            </p>
            <p className="capture-panel__summary-sub">
              {analysis.summaryLines[1]}
            </p>
          </div>

          <div className="capture-panel__grid">
            <div className="capture-panel__block">
              <span className="capture-panel__block-label">핵심 지표</span>
              <MetricGrid
                items={[
                  { label: "종합 관계 지수", value: `${analysis.finalValue}/100` },
                  { label: "주요 갈등 반응", value: analysis.topTypeLabel },
                  {
                    label: "현실적 안정성",
                    value: `${analysis.categoryScores.stability}/100`,
                  },
                  { label: "갈등 부담 지수", value: `${analysis.conflictRisk}/100` },
                ]}
              />
            </div>
          </div>

          <div className="capture-panel__footer">
            <p>{APP_COPY.footer}</p>
            <span>EUN CONTENTS · 우리 관계 진단</span>
          </div>
        </section>

        <section className="card result-overview-card">
          <div className="result-overview-card__head">
            <div>
              <span className="result-overview-card__eyebrow">
                {modeLabel ?? "OVERVIEW"}
              </span>
              <h3 className="result-overview-card__title">
                {analysis.relationshipLevel.title}
              </h3>
            </div>

            <div className="result-overview-card__score">
              <span>RELATIONSHIP INDEX</span>
              <strong>{analysis.finalValue} / 100</strong>
            </div>
          </div>

          <p className="result-overview-card__desc">
            {analysis.relationshipLevel.desc}
          </p>
        </section>

        <SectionCard
          title="한눈에 보는 관계 보고서"
          desc="선택한 답변을 바탕으로 현재 관계의 강점과 조율이 필요한 영역을 요약했습니다. 아래 지표는 각 영역의 서로 다른 배점 범위를 0~100으로 환산한 앱 내부 참고값이며, 임상 진단이나 표준화 검사 점수가 아닙니다."
          points={analysis.summaryLines}
        />

        <section className="card result-card">
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
        </section>

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

      <section className="card result-card answer-toggle-card">
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
      </section>

      <section className="card result-card result-card--actions">
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

        <div className="button-row">
          <button
            type="button"
            className="button button--ghost"
            onClick={handleCapture}
          >
            결과 카드 이미지 저장
          </button>

          <button
            type="button"
            className="button button--primary"
            onClick={handleOpenShareModal}
            disabled={serverSaveStatus === "saving"}
          >
            {serverSaveStatus === "saving" ? "공유 링크 준비 중..." : "공유하기"}
          </button>

          <button
            type="button"
            className="text-action"
            onClick={onRestart}
          >
            처음으로
          </button>

          <button
            type="button"
            className="text-action"
            onClick={onChooseAgain}
          >
            ← 다시 선택하기
          </button>
        </div>
      </section>

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

              <button
                type="button"
                className="text-action share-modal__close"
                onClick={() => setIsShareModalOpen(false)}
                aria-label="공유 창 닫기"
              >
                닫기
              </button>
            </div>

            <div className="share-modal__actions">
              {canNativeShare ? (
                <button
                  type="button"
                  className="button button--primary"
                  onClick={handleNativeShare}
                >
                  다른 앱으로 공유
                </button>
              ) : null}

              <button
                type="button"
                className="button button--primary"
                onClick={handleCopyShareLink}
              >
                링크 복사
              </button>

              <button
                type="button"
                className="text-action"
                onClick={() => setIsShareModalOpen(false)}
              >
                닫기
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
