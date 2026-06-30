import { useEffect, useMemo, useState } from "react";
import { APP_COPY, PLAN, SHARE } from "./data/config.js";
import { getModeContextQuestions } from "./data/modeQuestions.js";
import { getQuestionsByMode } from "./data/questions.js";
import { analyzeRelationship } from "./domain/analyzeRelationship.js";
import { useQuizEngine } from "./hooks/useQuizEngine.js";
import { clearResultUrl, getStoredResult } from "./utils/resultStorage.js";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { Button } from "../../shared/components/Button.jsx";
import { Hero } from "./components/hero/Hero.jsx";
import { ProgressBar } from "./components/progress/ProgressBar.jsx";
import { QuestionCard } from "./components/question/QuestionCard.jsx";
import { ResultView } from "./components/result/ResultView.jsx";
import { RelationshipModeSelect } from "./components/mode/RelationshipModeSelect.jsx";
import { getResultId } from "../../app/routes.js";
import "./styles/relationship.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export default function RelationshipApp({ onNavigateHome }) {
  const [sharedResultId, setSharedResultId] = useState(getResultId);
  const [savedResult, setSavedResult] = useState(null);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const [resultLoadError, setResultLoadError] = useState("");
  const [relationshipMode, setRelationshipMode] = useState(null);
  const activeQuestions = useMemo(
    () => [
      ...getQuestionsByMode(relationshipMode),
      ...getModeContextQuestions(relationshipMode),
    ],
    [relationshipMode]
  );

  const {
    currentQuestion,
    currentIndex,
    selectedOptionId,
    progress,
    totalQuestions,
    answers,
    resultPayload,
    isComplete,
    canGoPrevious,
    handleSelectOption,
    handleNext,
    handlePrevious,
    handleRestart,
  } = useQuizEngine({ planType: PLAN.FREE, questions: activeQuestions });

  useEffect(() => {
    if (!sharedResultId) return;

    const controller = new AbortController();
    let isMounted = true;

    async function loadSavedResult() {
      setIsResultLoading(true);
      setResultLoadError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/results/${encodeURIComponent(sharedResultId)}`,
          { signal: controller.signal }
        );
        const payload = await response.json();

        if (!response.ok || !payload.ok || !payload.result?.analysis) {
          throw new Error("Failed to load server result.");
        }

        if (!isMounted) return;

        setSavedResult({
          id: payload.result.id,
          analysis: payload.result.analysis,
          answers: payload.result.answers,
          relationshipMode: payload.result.relationshipMode,
          savedAt: payload.result.savedAt,
        });
        setRelationshipMode(payload.result.relationshipMode ?? null);
      } catch (error) {
        if (error.name === "AbortError" || !isMounted) return;

        const localResult = getStoredResult(sharedResultId);

        if (localResult) {
          setSavedResult(localResult);
          setRelationshipMode(localResult.relationshipMode ?? null);
          return;
        }

        setResultLoadError("failed");
      } finally {
        if (isMounted) {
          setIsResultLoading(false);
        }
      }
    }

    loadSavedResult();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [sharedResultId]);

  const analysis = useMemo(() => {
    if (!isComplete) return null;
    return analyzeRelationship(resultPayload, relationshipMode);
  }, [isComplete, resultPayload, relationshipMode]);

  const activeAnalysis = savedResult?.analysis ?? analysis;
  const activeAnswers = savedResult?.answers ?? answers;
  const activeMode = savedResult?.relationshipMode ?? relationshipMode;
  const activeModeVersionLabel = activeMode ? `ver. ${activeMode}` : null;
  const shouldShowModeSelect =
    !sharedResultId &&
    !isResultLoading &&
    !resultLoadError &&
    !savedResult &&
    !relationshipMode;
  const shouldShowQuestion = !savedResult && !isComplete && currentQuestion;
  const shouldShowResult = Boolean(activeAnalysis);
  const shouldShowQuizUtility = !savedResult && relationshipMode && !isComplete;

  useEffect(() => {
    if (!shouldShowResult) return;

    const scrollToPageTop = () => {
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    requestAnimationFrame(scrollToPageTop);
    const timeoutId = window.setTimeout(scrollToPageTop, 120);

    return () => window.clearTimeout(timeoutId);
  }, [shouldShowResult, savedResult]);

  function handleSelectMode(mode) {
    clearResultUrl();
    setSharedResultId(null);
    setSavedResult(null);
    setResultLoadError("");
    handleRestart();
    setRelationshipMode(mode);
  }

  function handleRetakeSameMode() {
    setSavedResult(null);
    setResultLoadError("");
    clearResultUrl();
    setSharedResultId(null);
    handleRestart();
  }

  function handleChooseAgain() {
    setSavedResult(null);
    setResultLoadError("");
    clearResultUrl();
    setSharedResultId(null);
    handleRestart();
    setRelationshipMode(null);
  }

  return (
    <AppShell>
      <Hero
        title={APP_COPY.title}
        subtitle={APP_COPY.subtitle}
        onNavigateHome={onNavigateHome}
        onChooseAgain={shouldShowQuizUtility ? handleChooseAgain : null}
      />

      {shouldShowModeSelect ? (
        <RelationshipModeSelect onSelectMode={handleSelectMode} />
      ) : null}

      {isResultLoading ? (
        <section className="card result-card">
          <h3 className="result-card__title">저장된 결과를 불러오고 있어요</h3>
        </section>
      ) : null}

      {resultLoadError ? (
        <section className="card result-card">
          <h3 className="result-card__title">결과를 불러오지 못했어요</h3>
          <p className="result-card__desc">
            링크가 올바른지 확인하거나 새 테스트를 시작해 주세요.
          </p>
          <Button variant="primary" onClick={handleChooseAgain}>
            새 테스트 시작하기
          </Button>
        </section>
      ) : null}

      {!savedResult && relationshipMode ? <ProgressBar value={progress} /> : null}

      {shouldShowQuestion ? (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={totalQuestions}
          selectedOptionId={selectedOptionId}
          canGoPrevious={canGoPrevious}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
          onPrevious={handlePrevious}
          modeLabel={activeModeVersionLabel}
        />
      ) : null}

      {shouldShowResult ? (
        <ResultView
          analysis={activeAnalysis}
          answers={activeAnswers}
          relationshipMode={activeMode}
          onRestart={handleRetakeSameMode}
          onChooseAgain={handleChooseAgain}
          shareConfig={SHARE}
          isSavedResult={Boolean(savedResult)}
          savedResultId={savedResult?.id}
          savedAt={savedResult?.savedAt}
        />
      ) : null}
    </AppShell>
  );
}
