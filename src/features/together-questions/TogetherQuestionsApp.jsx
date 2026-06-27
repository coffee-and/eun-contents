import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { AnswerPanel } from "./components/AnswerPanel.jsx";
import { InvitePanel } from "./components/InvitePanel.jsx";
import { ResultPanel } from "./components/ResultPanel.jsx";
import { StartPanel } from "./components/StartPanel.jsx";
import { StatusMessage } from "./components/StatusMessage.jsx";
import { WaitingPanel } from "./components/WaitingPanel.jsx";
import { getQuestionPack, getQuestions, getRelationshipType } from "./data/questionPacks.js";
import { PARTICIPANT_ROLES, SESSION_STEPS } from "./constants/sessionFlow.js";
import {
  clearDraft,
  clearParticipantToken,
  loadDraft,
  loadParticipantToken,
  saveDraft,
  saveParticipantToken,
} from "./services/draftStorage.js";
import {
  createQuestionSession,
  deleteQuestionSession,
  joinQuestionSession,
  loadQuestionSession,
  saveQuestionAnswers,
} from "./services/questionSessionApi.js";
import { buildQuestionComparisons, summarizeComparison } from "./domain/comparison.js";
import { buildInviteUrl, getInviteCodeFromUrl } from "./utils/sessionUrl.js";
import "./styles/together-questions.css";
import "./styles/together-questions-journal.css";

function answersFromSession(session, role) {
  const entries = (session?.answers ?? [])
    .filter((answer) => answer.role === role)
    .map((answer) => [answer.questionId, answer.answer]);
  return Object.fromEntries(entries);
}

function getErrorMessage(error) {
  return error?.message || "잠시 문제가 생겼어요. 다시 시도해 주세요.";
}

const INITIAL_FORM = {
  displayName: "",
  relationshipType: "",
  questionPackId: "light",
};

export default function TogetherQuestionsApp({ onNavigateHome }) {
  const [step, setStep] = useState(SESSION_STEPS.START);
  const [inviteCode, setInviteCode] = useState(getInviteCodeFromUrl);
  const [participantToken, setParticipantToken] = useState("");
  const [session, setSession] = useState(null);
  const [startForm, setStartForm] = useState(INITIAL_FORM);
  const [inviteeName, setInviteeName] = useState("");
  const [answers, setAnswers] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [notice, setNotice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const reportRef = useRef(null);

  const participantRole = session?.participant?.role ?? null;
  const selectedType = getRelationshipType(session?.relationshipType ?? startForm.relationshipType);
  const selectedPack = getQuestionPack(session?.questionPackId ?? startForm.questionPackId);
  const questions = useMemo(
    () => getQuestions(session?.relationshipType ?? startForm.relationshipType),
    [session?.relationshipType, startForm.relationshipType]
  );
  const currentQuestion = questions[questionIndex];
  const inviteUrl = inviteCode ? buildInviteUrl(inviteCode) : "";
  const comparisons = useMemo(
    () => buildQuestionComparisons(questions, session?.answers ?? []),
    [questions, session?.answers]
  );
  const comparisonSummary = useMemo(() => summarizeComparison(comparisons), [comparisons]);
  const isCreator = participantRole === PARTICIPANT_ROLES.CREATOR;
  const isInvitee = participantRole === PARTICIPANT_ROLES.INVITEE;
  const isSubmitted = Boolean(session?.participant?.submittedAt);
  const isComplete = session?.status === "completed";
  const canStart = Boolean(startForm.relationshipType && startForm.displayName.trim() && !isBusy);

  useEffect(() => {
    if (!inviteCode) return;

    const savedToken = loadParticipantToken(inviteCode);
    setParticipantToken(savedToken);

    async function restoreSession() {
      setIsBusy(true);
      setErrorMessage("");

      try {
        const payload = await loadQuestionSession(inviteCode, savedToken);
        setSession(payload.session);

        if (payload.session.isExpired) {
          setStep(SESSION_STEPS.ERROR);
          setErrorMessage("초대 링크가 만료됐어요. 새 문답을 시작해 주세요.");
          return;
        }

        if (payload.session.status === "completed") {
          setStep(SESSION_STEPS.RESULT);
          return;
        }

        if (payload.session.participant?.role) {
          const role = payload.session.participant.role;
          setAnswers({
            ...loadDraft(inviteCode, role),
            ...answersFromSession(payload.session, role),
          });
          setStep(payload.session.participant.submittedAt ? SESSION_STEPS.WAITING : `${role}-answer`);
          return;
        }

        setStep(SESSION_STEPS.INVITE);
      } catch (error) {
        setStep(SESSION_STEPS.ERROR);
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsBusy(false);
      }
    }

    restoreSession();
  }, [inviteCode]);

  useEffect(() => {
    if (!inviteCode || !participantRole || isSubmitted) return;

    const timeoutId = window.setTimeout(() => {
      saveDraft(inviteCode, participantRole, answers);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [answers, inviteCode, isSubmitted, participantRole]);

  function updateStartForm(nextValues) {
    setStartForm((current) => ({ ...current, ...nextValues }));
  }

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  async function handleCreateSession(event) {
    event.preventDefault();

    if (!canStart) {
      setErrorMessage("관계를 먼저 선택하고, 내 이름 또는 닉네임을 입력해 주세요.");
      return;
    }

    setIsBusy(true);
    setErrorMessage("");
    setNotice("");

    try {
      const payload = await createQuestionSession(startForm);
      setSession(payload.session);
      setInviteCode(payload.session.inviteCode);
      setParticipantToken(payload.participantToken);
      saveParticipantToken(payload.session.inviteCode, payload.participantToken);
      window.location.hash = `/together-questions?invite=${encodeURIComponent(payload.session.inviteCode)}`;
      setAnswers(loadDraft(payload.session.inviteCode, PARTICIPANT_ROLES.CREATOR));
      setQuestionIndex(0);
      setStep(SESSION_STEPS.CREATOR_ANSWER);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleJoinSession(event) {
    event.preventDefault();
    setIsBusy(true);
    setErrorMessage("");
    setNotice("");

    try {
      const payload = await joinQuestionSession(inviteCode, inviteeName);
      setSession(payload.session);
      setParticipantToken(payload.participantToken);
      saveParticipantToken(inviteCode, payload.participantToken);
      setAnswers(loadDraft(inviteCode, PARTICIPANT_ROLES.INVITEE));
      setQuestionIndex(0);
      setStep(SESSION_STEPS.INVITEE_ANSWER);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function persistAnswers({ submit = false } = {}) {
    if (!inviteCode || !participantToken || !participantRole) return false;

    setIsSaving(true);
    setErrorMessage("");
    setNotice("");

    try {
      const payload = await saveQuestionAnswers(inviteCode, {
        participantToken,
        answers,
        submit,
      });
      setSession(payload.session);

      if (submit) {
        clearDraft(inviteCode, participantRole);
        setStep(payload.session.status === "completed" ? SESSION_STEPS.RESULT : SESSION_STEPS.WAITING);
        setNotice("답변 제출이 완료됐어요.");
      }

      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleNextQuestion() {
    if (questionIndex >= questions.length - 1) {
      await persistAnswers({ submit: true });
      return;
    }

    setQuestionIndex((index) => index + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePreviousQuestion() {
    setQuestionIndex((index) => Math.max(0, index - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function refreshSession() {
    if (!inviteCode) return;

    setIsBusy(true);
    setErrorMessage("");

    try {
      const payload = await loadQuestionSession(inviteCode, participantToken);
      setSession(payload.session);
      if (payload.session.status === "completed") setStep(SESSION_STEPS.RESULT);
      else if (payload.session.participant?.submittedAt) setStep(SESSION_STEPS.WAITING);
      setNotice("상태를 새로 확인했어요.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setNotice("초대 링크를 복사했어요.");
    } catch {
      setErrorMessage("링크 복사에 실패했어요. 주소창의 링크를 직접 복사해 주세요.");
    }
  }

  async function shareInviteLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "함께하는 문답 초대",
          text: `${session?.participants?.creator?.displayName ?? "초대한 사람"}님이 함께하는 문답에 초대했어요.`,
          url: inviteUrl,
        });
        setNotice("공유 화면을 열었어요.");
        return;
      } catch {
        setNotice("공유가 취소됐거나 실패했어요. 링크 복사를 사용할게요.");
      }
    }

    await copyInviteLink();
  }

  async function handleDeleteSession() {
    if (!window.confirm("이 문답을 삭제할까요? 삭제 후에는 링크로 다시 볼 수 없어요.")) return;

    setIsBusy(true);
    setErrorMessage("");

    try {
      await deleteQuestionSession(inviteCode, participantToken);
      clearDraft(inviteCode, participantRole);
      clearParticipantToken(inviteCode);
      setSession(null);
      setInviteCode("");
      setParticipantToken("");
      setAnswers({});
      setQuestionIndex(0);
      setStep(SESSION_STEPS.START);
      window.location.hash = "/together-questions";
      setNotice("문답을 삭제했어요.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsBusy(false);
    }
  }

  async function saveImage() {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff", scale: 2 });
      const link = document.createElement("a");
      link.download = `함께하는-문답-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      setErrorMessage("이미지 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  function printPdf() {
    try {
      window.print();
    } catch {
      setErrorMessage("PDF 저장 창을 열지 못했어요. 브라우저 인쇄 메뉴를 이용해 주세요.");
    }
  }

  function resetFlow() {
    setSession(null);
    setInviteCode("");
    setParticipantToken("");
    setAnswers({});
    setQuestionIndex(0);
    setNotice("");
    setErrorMessage("");
    setStartForm(INITIAL_FORM);
    setStep(SESSION_STEPS.START);
    window.location.hash = "/together-questions";
  }

  return (
    <div className="theme-together-questions">
      <AppShell>
        <header className="tq-hero">
          <div>
            <span className="tq-hero__eyebrow">QUESTIONS TOGETHER</span>
            <h1>함께하는 문답</h1>
            <p>내 마음을 먼저 기록하고, 초대 링크로 상대방의 답변을 받아 함께 비교해요.</p>
          </div>
          <button type="button" className="tq-home-button" onClick={onNavigateHome}>
            콘텐츠 홈
          </button>
        </header>

        <StatusMessage notice={notice} errorMessage={errorMessage} />

        {isBusy && !session ? <p className="tq-alert">문답 정보를 확인하고 있어요.</p> : null}

        {step === SESSION_STEPS.START ? (
          <StartPanel
            startForm={startForm}
            canStart={canStart}
            isBusy={isBusy}
            onSubmit={handleCreateSession}
            onChangeForm={updateStartForm}
            onResetQuestion={() => setQuestionIndex(0)}
          />
        ) : null}

        {[SESSION_STEPS.CREATOR_ANSWER, SESSION_STEPS.INVITEE_ANSWER].includes(step) ? (
          <AnswerPanel
            answers={answers}
            currentQuestion={currentQuestion}
            isSaving={isSaving}
            participantRole={participantRole}
            questionIndex={questionIndex}
            questions={questions}
            onAnswerChange={updateAnswer}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            onReset={resetFlow}
          />
        ) : null}

        {step === SESSION_STEPS.INVITE ? (
          <InvitePanel
            inviteeName={inviteeName}
            isBusy={isBusy}
            session={session}
            onChangeName={setInviteeName}
            onSubmit={handleJoinSession}
          />
        ) : null}

        {step === SESSION_STEPS.WAITING ? (
          <WaitingPanel
            inviteUrl={inviteUrl}
            isCreator={isCreator}
            onCopyInvite={copyInviteLink}
            onDelete={handleDeleteSession}
            onRefresh={refreshSession}
            onReset={resetFlow}
            onShareInvite={shareInviteLink}
          />
        ) : null}

        {step === SESSION_STEPS.RESULT && isComplete ? (
          <ResultPanel
            comparisonSummary={comparisonSummary}
            comparisons={comparisons}
            reportRef={reportRef}
            selectedPack={selectedPack}
            selectedType={selectedType}
            session={session}
            onDelete={handleDeleteSession}
            onPrintPdf={printPdf}
            onReset={resetFlow}
            onSaveImage={saveImage}
          />
        ) : null}

        {step === SESSION_STEPS.ERROR ? (
          <section className="tq-panel tq-error">
            <h2>문답을 열 수 없어요</h2>
            <p>{errorMessage || "링크가 올바른지 다시 확인해 주세요."}</p>
            <button type="button" className="tq-button tq-button--primary" onClick={resetFlow}>
              새 문답 시작
            </button>
          </section>
        ) : null}
      </AppShell>
    </div>
  );
}
