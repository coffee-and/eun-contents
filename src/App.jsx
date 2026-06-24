import { useEffect, useMemo, useRef, useState } from "react";
import { APP_COPY, PLAN, SHARE } from "./data/config.js";
import { analyzeRelationship } from "./domain/analyzeRelationship.js";
import { useQuizEngine } from "./hooks/useQuizEngine.js";
import { clearResultUrl, getStoredResult } from "./utils/resultStorage.js";
import { AppShell } from "./components/layout/AppShell.jsx";
import { Hero } from "./components/hero/Hero.jsx";
import { ProgressBar } from "./components/progress/ProgressBar.jsx";
import { QuestionCard } from "./components/question/QuestionCard.jsx";
import { ResultView } from "./components/result/ResultView.jsx";

// 전체 앱 흐름을 묶는 최상위 컴포넌트
export default function App() {
  const resultTopRef = useRef(null);
  const [savedResult, setSavedResult] = useState(null);
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
  } = useQuizEngine({ planType: PLAN.FREE });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultId = params.get("resultId");

    if (!resultId) return;

    const storedResult = getStoredResult(resultId);

    if (storedResult) {
      setSavedResult(storedResult);
    }
  }, []);

  const analysis = useMemo(() => {
    if (!isComplete) return null;
    return analyzeRelationship(resultPayload);
  }, [isComplete, resultPayload]);

  const activeAnalysis = savedResult?.analysis ?? analysis;
  const activeAnswers = savedResult?.answers ?? answers;
  const shouldShowQuestion = !savedResult && !isComplete && currentQuestion;
  const shouldShowResult = Boolean(activeAnalysis);

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

  function handleStartOver() {
    setSavedResult(null);
    clearResultUrl();
    handleRestart();
  }

  return (
    <AppShell>
      <Hero
        eyebrow={APP_COPY.eyebrow}
        title={APP_COPY.title}
        subtitle={APP_COPY.subtitle}
        progressText={
          savedResult
            ? "저장된 결과"
            : `${Math.min(currentIndex + 1, totalQuestions)} / ${totalQuestions}`
        }
      />

      {!savedResult ? <ProgressBar value={progress} /> : null}

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
            onRestart={handleStartOver}
            shareConfig={SHARE}
            isSavedResult={Boolean(savedResult)}
            savedAt={savedResult?.savedAt}
          />
        </div>
      ) : null}
    </AppShell>
  );
}
