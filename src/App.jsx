import { useEffect, useMemo, useRef, useState } from "react";
import {
  APP_COPY,
  PLAN,
  RELATIONSHIP_MODE_META,
  SHARE,
} from "./data/config.js";
import { getQuestionsByMode } from "./data/questions.js";
import { analyzeRelationship } from "./domain/analyzeRelationship.js";
import { useQuizEngine } from "./hooks/useQuizEngine.js";
import { clearResultUrl, getStoredResult } from "./utils/resultStorage.js";
import { AppShell } from "./components/layout/AppShell.jsx";
import { Hero } from "./components/hero/Hero.jsx";
import { ProgressBar } from "./components/progress/ProgressBar.jsx";
import { QuestionCard } from "./components/question/QuestionCard.jsx";
import { ResultView } from "./components/result/ResultView.jsx";
import { RelationshipModeSelect } from "./components/mode/RelationshipModeSelect.jsx";

export default function App() {
  const resultTopRef = useRef(null);
  const [savedResult, setSavedResult] = useState(null);
  const [relationshipMode, setRelationshipMode] = useState(null);
  const activeQuestions = useMemo(
    () => getQuestionsByMode(relationshipMode),
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
    const params = new URLSearchParams(window.location.search);
    const resultId = params.get("resultId");

    if (!resultId) return;

    const storedResult = getStoredResult(resultId);

    if (storedResult) {
      setSavedResult(storedResult);
      setRelationshipMode(storedResult.relationshipMode ?? null);
    }
  }, []);

  const analysis = useMemo(() => {
    if (!isComplete) return null;
    return analyzeRelationship(resultPayload, relationshipMode);
  }, [isComplete, resultPayload, relationshipMode]);

  const activeAnalysis = savedResult?.analysis ?? analysis;
  const activeAnswers = savedResult?.answers ?? answers;
  const activeMode = savedResult?.relationshipMode ?? relationshipMode;
  const activeModeLabel = activeMode
    ? RELATIONSHIP_MODE_META[activeMode]?.shortLabel
    : null;
  const activeModeName = activeMode ? RELATIONSHIP_MODE_META[activeMode]?.label : null;
  const heroSubtitle = activeModeName
    ? `${activeModeName}: 현재 관계의 감정 상태와 안정성, 갈등 패턴, 미래 방향성을 살펴봅니다.`
    : APP_COPY.subtitle;
  const shouldShowModeSelect = !savedResult && !relationshipMode;
  const shouldShowQuestion = !savedResult && !isComplete && currentQuestion;
  const shouldShowResult = Boolean(activeAnalysis);
  const shouldShowQuizUtility = !savedResult && relationshipMode && !isComplete;

  useEffect(() => {
    if (!isComplete || savedResult || !shouldShowResult) return;

    const scrollToResultTop = () => {
      const node = resultTopRef.current;

      if (!node) return;

      const top = node.getBoundingClientRect().top + window.scrollY - 8;

      window.scrollTo({
        top: Math.max(top, 0),
        behavior: "smooth",
      });
    };

    requestAnimationFrame(() => {
      scrollToResultTop();
    });

    const timeoutId = window.setTimeout(scrollToResultTop, 160);

    return () => window.clearTimeout(timeoutId);
  }, [isComplete, savedResult, shouldShowResult]);

  function handleSelectMode(mode) {
    clearResultUrl();
    setSavedResult(null);
    handleRestart();
    setRelationshipMode(mode);
  }

  function handleRetakeSameMode() {
    setSavedResult(null);
    clearResultUrl();
    handleRestart();
  }

  function handleChooseAgain() {
    setSavedResult(null);
    clearResultUrl();
    handleRestart();
    setRelationshipMode(null);
  }

  return (
    <AppShell>
      <Hero
        eyebrow={APP_COPY.eyebrow}
        title={APP_COPY.title}
        subtitle={heroSubtitle}
      />

      {shouldShowModeSelect ? (
        <RelationshipModeSelect onSelectMode={handleSelectMode} />
      ) : null}

      {!savedResult && relationshipMode ? <ProgressBar value={progress} /> : null}

      {shouldShowQuizUtility ? (
        <div className="quiz-utility">
          <span>{activeModeLabel}</span>
          <button type="button" onClick={handleChooseAgain}>
            다시 선택하기
          </button>
        </div>
      ) : null}

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
        />
      ) : null}

      {shouldShowResult ? (
        <div ref={resultTopRef}>
          <ResultView
            analysis={activeAnalysis}
            answers={activeAnswers}
            relationshipMode={activeMode}
            onRestart={handleRetakeSameMode}
            onChooseAgain={handleChooseAgain}
            shareConfig={SHARE}
            isSavedResult={Boolean(savedResult)}
            savedAt={savedResult?.savedAt}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
