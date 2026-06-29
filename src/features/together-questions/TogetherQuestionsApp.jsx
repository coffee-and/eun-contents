import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { TextAction } from "../../shared/components/TextAction.jsx";
import { AnswerPanel } from "./components/AnswerPanel.jsx";
import { ResultPanel } from "./components/ResultPanel.jsx";
import { StartPanel } from "./components/StartPanel.jsx";
import { StatusMessage } from "./components/StatusMessage.jsx";
import { SESSION_STEPS } from "./constants/sessionFlow.js";
import { QUESTION_PACK_IDS, getQuestions, getRelationshipType } from "./data/index.js";
import {
  clearDraft,
  clearSavedResult,
  loadDraft,
  loadSavedResult,
  saveDraft,
  saveResult,
} from "./services/draftStorage.js";
import "./styles/together-questions.css";
import "../../shared/styles/editorial/feature-cleanup.css";

const INITIAL_FORM = {
  displayName: "",
  relationshipType: "",
  questionPackId: QUESTION_PACK_IDS.BASIC,
};

const DISPLAY_NAME_REQUIRED_MESSAGE = "문답에 표시할 이름을 입력해 주세요.";

function getErrorMessage(error) {
  return error?.message || "잠시 문제가 생겼어요. 다시 시도해 주세요.";
}

export default function TogetherQuestionsApp({ onNavigateHome }) {
  const [step, setStep] = useState(SESSION_STEPS.START);
  const [startForm, setStartForm] = useState(INITIAL_FORM);
  const [answers, setAnswers] = useState({});
  const [completedAt, setCompletedAt] = useState("");
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const reportRef = useRef(null);
  const displayNameInputRef = useRef(null);

  const selectedRelationship = getRelationshipType(startForm.relationshipType);
  const questions = useMemo(
    () => getQuestions(startForm.relationshipType, startForm.questionPackId),
    [startForm.relationshipType, startForm.questionPackId]
  );
  const canStart = Boolean(startForm.relationshipType);

  useEffect(() => {
    const savedResult = loadSavedResult();
    if (savedResult?.form?.relationshipType && savedResult?.completedAt) {
      setStartForm({ ...INITIAL_FORM, ...savedResult.form });
      setAnswers(savedResult.answers ?? {});
      setCompletedAt(savedResult.completedAt);
      setStep(SESSION_STEPS.RESULT);
      return;
    }

    const draft = loadDraft();
    if (draft?.form?.relationshipType) {
      setStartForm({ ...INITIAL_FORM, ...draft.form });
      setAnswers(draft.answers ?? {});
      setStep(SESSION_STEPS.ANSWER);
      setNotice("작성 중이던 문답을 불러왔어요.");
    }
  }, []);

  useEffect(() => {
    if (step !== SESSION_STEPS.ANSWER) return;

    const timeoutId = window.setTimeout(() => {
      saveDraft({ form: startForm, answers });
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [answers, startForm, step]);

  function updateStartForm(nextValues) {
    setStartForm((current) => ({ ...current, ...nextValues }));
  }

  function updateDisplayName(value) {
    const isValid = Boolean(value.trim());
    setDisplayNameError("");
    if (isValid && errorMessage === DISPLAY_NAME_REQUIRED_MESSAGE) {
      setErrorMessage("");
    }
    updateStartForm({ displayName: value });
  }

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function handleCreateSession(event) {
    event.preventDefault();

    if (!canStart) {
      setErrorMessage("문답 관계를 골라 주세요.");
      return;
    }

    clearSavedResult();
    setNotice("");
    setErrorMessage("");
    setAnswers({});
    setStep(SESSION_STEPS.ANSWER);
    saveDraft({ form: startForm, answers: {} });
  }

  function completeQuestionBook() {
    const trimmedDisplayName = startForm.displayName.trim();

    if (!trimmedDisplayName) {
      setDisplayNameError(DISPLAY_NAME_REQUIRED_MESSAGE);
      setErrorMessage(DISPLAY_NAME_REQUIRED_MESSAGE);
      displayNameInputRef.current?.focus();
      return;
    }

    setDisplayNameError("");
    setErrorMessage("");

    const nextCompletedAt = new Date().toISOString();
    const resultForm = {
      ...startForm,
      displayName: trimmedDisplayName,
    };
    const result = {
      form: resultForm,
      answers,
      completedAt: nextCompletedAt,
    };

    setStartForm(resultForm);
    setCompletedAt(nextCompletedAt);
    saveResult(result);
    clearDraft();
    setStep(SESSION_STEPS.RESULT);
    setNotice("나의 문답집이 완성됐어요.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function shareQuestionBook() {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/together-questions`;
    const shareText = "나도 문답집을 작성해봤어. 너도 한번 해봐.";

    if (navigator.share) {
      try {
        await navigator.share({ title: "함께하는 문답", text: shareText, url: shareUrl });
        setNotice("공유 화면을 열었어요.");
        return;
      } catch {
        setNotice("공유가 취소됐거나 실패했어요. 링크 복사를 사용할게요.");
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setNotice("공유 링크를 복사했어요.");
    } catch {
      setErrorMessage("링크 복사에 실패했어요. 주소창의 링크를 직접 복사해 주세요.");
    }
  }

  async function saveImage() {
    if (!reportRef.current || isSaving) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `나의-문답집-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setNotice("문답집 이미지를 저장했어요.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  function printPdf() {
    try {
      window.print();
    } catch {
      setErrorMessage("PDF 저장 창을 열지 못했어요. 브라우저 인쇄 메뉴를 이용해 주세요.");
    }
  }

  function resetTogetherQuestions() {
    clearDraft();
    clearSavedResult();
    setStartForm(INITIAL_FORM);
    setAnswers({});
    setCompletedAt("");
    setNotice("");
    setErrorMessage("");
    setDisplayNameError("");
    setStep(SESSION_STEPS.START);
  }

  function resetFlow() {
    resetTogetherQuestions();
    window.location.hash = "/together-questions";
  }

  function handleNavigateHome() {
    resetTogetherQuestions();
    onNavigateHome();
  }

  return (
    <div className="theme-together-questions">
      <AppShell>
        <header className="tq-hero">
          <div>
            <span className="tq-hero__eyebrow">QUESTIONS TOGETHER</span>
            <h1>함께하는 문답</h1>
            <p>내 마음을 차례대로 적고, 완성된 나의 문답집을 저장하거나 공유해요.</p>
          </div>
          <div className="feature-header-actions">
            <TextAction className="tq-home-button" onClick={handleNavigateHome}>
              ← 다른 콘텐츠 보기
            </TextAction>
            {step !== SESSION_STEPS.START ? (
              <TextAction className="tq-back-link" onClick={resetFlow}>
                ← 다시 선택하기
              </TextAction>
            ) : null}
          </div>
        </header>

        <StatusMessage notice={notice} errorMessage={errorMessage} />

        {step === SESSION_STEPS.START ? (
          <StartPanel
            startForm={startForm}
            canStart={canStart}
            onSubmit={handleCreateSession}
            onChangeForm={updateStartForm}
            onResetQuestion={() => setAnswers({})}
          />
        ) : null}

        {step === SESSION_STEPS.ANSWER ? (
          <AnswerPanel
            answers={answers}
            displayName={startForm.displayName}
            displayNameError={displayNameError}
            displayNameInputRef={displayNameInputRef}
            isSaving={isSaving}
            questions={questions}
            relationship={selectedRelationship}
            onAnswerChange={updateAnswer}
            onComplete={completeQuestionBook}
            onDisplayNameChange={updateDisplayName}
          />
        ) : null}

        {step === SESSION_STEPS.RESULT ? (
          <ResultPanel
            answers={answers}
            completedAt={completedAt}
            displayName={startForm.displayName}
            isSaving={isSaving}
            questions={questions}
            relationship={selectedRelationship}
            reportRef={reportRef}
            onPrintPdf={printPdf}
            onReset={resetFlow}
            onSaveImage={saveImage}
            onShare={shareQuestionBook}
          />
        ) : null}
      </AppShell>
    </div>
  );
}
