import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AppShell } from "../../shared/components/AppShell.jsx";
import {
  RELATIONSHIP_TYPES,
  getQuestionPack,
  getQuestions,
  getRelationshipType,
} from "./data/questionPacks.js";
import { ANSWER_LIMITS, PARTICIPANT_ROLES, SESSION_STEPS } from "./constants/sessionFlow.js";
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
import "./styles/together-questions.css";
import "./styles/together-questions-journal.css";

function getInviteCodeFromUrl() {
  const hashQuery = window.location.hash.split("?")[1] ?? "";
  const search = new URLSearchParams(window.location.search);
  const hashSearch = new URLSearchParams(hashQuery);
  return search.get("invite") ?? hashSearch.get("invite") ?? "";
}

function buildInviteUrl(inviteCode) {
  const url = new URL(window.location.href);
  url.searchParams.delete("resultId");
  url.searchParams.delete("invite");
  url.hash = `/together-questions?invite=${encodeURIComponent(inviteCode)}`;
  return url.toString();
}

function answersFromSession(session, role) {
  const entries = (session?.answers ?? [])
    .filter((answer) => answer.role === role)
    .map((answer) => [answer.questionId, answer.answer]);
  return Object.fromEntries(entries);
}

function getErrorMessage(error) {
  return error?.message || "잠시 문제가 생겼어요. 다시 시도해 주세요.";
}

export default function TogetherQuestionsApp({ onNavigateHome }) {
  const [step, setStep] = useState(SESSION_STEPS.START);
  const [inviteCode, setInviteCode] = useState(getInviteCodeFromUrl);
  const [participantToken, setParticipantToken] = useState("");
  const [session, setSession] = useState(null);
  const [startForm, setStartForm] = useState({
    displayName: "",
    relationshipType: "",
    questionPackId: "light",
  });
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

  function updateAnswer(questionId, value) {
    setAnswers((current) => ({
      ...current,
      [questionId]: value.slice(0, ANSWER_LIMITS.answer),
    }));
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
    setStartForm({ displayName: "", relationshipType: "", questionPackId: "light" });
    setStep(SESSION_STEPS.START);
    window.location.hash = "/together-questions";
  }

  const renderStatus = () => (
    <>
      {notice ? <p className="tq-alert tq-alert--success">{notice}</p> : null}
      {errorMessage ? <p className="tq-alert tq-alert--error">{errorMessage}</p> : null}
    </>
  );

  const renderAnswerScreen = () => (
    <section className="tq-panel tq-answer-panel">
      <div className="tq-progress">
        <span>{currentQuestion?.category}</span>
        <strong>
          {questionIndex + 1} / {questions.length}
        </strong>
        <div aria-hidden="true">
          <i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="tq-inline-actions">
        <button type="button" className="tq-button tq-button--ghost" onClick={resetFlow}>
          다시 선택하기
        </button>
      </div>

      <article className="tq-question-card">
        <span>오늘의 질문</span>
        <h2>{currentQuestion?.prompt}</h2>
        <p>{currentQuestion?.helperText}</p>
      </article>

      <label className="tq-answer-field">
        <span>나의 답변</span>
        <textarea
          rows="8"
          maxLength={ANSWER_LIMITS.answer}
          value={answers[currentQuestion?.id] ?? ""}
          onChange={(event) => updateAnswer(currentQuestion.id, event.target.value)}
          placeholder="정답은 없어요. 지금 떠오르는 내 마음을 편하게 적어주세요."
        />
        <small>
          답변은 이 기기 안에 임시 저장되고, 마지막 질문에서 한 번에 제출돼요.
        </small>
      </label>

      <div className="tq-actions tq-actions--split">
        <button
          type="button"
          className="tq-button tq-button--secondary"
          disabled={questionIndex === 0 || isSaving}
          onClick={handlePreviousQuestion}
        >
          이전 질문
        </button>
        <button
          type="button"
          className="tq-button tq-button--primary"
          disabled={isSaving}
          onClick={handleNextQuestion}
        >
          {questionIndex === questions.length - 1
            ? isCreator
              ? "내 답변 완료하기"
              : "답변 제출하기"
            : "다음 질문"}
        </button>
      </div>
    </section>
  );

  return (
    <div className="theme-together-questions">
      <AppShell>
        <header className="tq-hero">
          <div>
            <span className="tq-hero__eyebrow">QUESTIONS TOGETHER</span>
            <h1>함께하는 문답</h1>
            <p>내 마음을 먼저 기록하고, 초대 링크로 상대의 답변을 받아 함께 비교해요.</p>
          </div>
          <button type="button" className="tq-home-button" onClick={onNavigateHome}>
            콘텐츠 홈
          </button>
        </header>

        {renderStatus()}

        {isBusy && !session ? <p className="tq-alert">문답 정보를 확인하고 있어요.</p> : null}

        {step === SESSION_STEPS.START ? (
          <form className="tq-panel tq-start" onSubmit={handleCreateSession}>
            <div className="tq-section__head">
              <span>START</span>
              <h2>먼저 누구와의 문답인지 골라주세요</h2>
              <p>질문 주제 선택 없이, 기본 15문항으로 자연스럽게 시작해요.</p>
            </div>

            <div className="tq-choice-group">
              <span>상대와의 관계</span>
              <div className="tq-card-grid">
                {RELATIONSHIP_TYPES.map((type) => (
                  <button
                    type="button"
                    key={type.id}
                    className={`tq-select-card ${
                      startForm.relationshipType === type.id ? "is-selected" : ""
                    }`}
                    onClick={() => {
                      setStartForm((form) => ({ ...form, relationshipType: type.id }));
                      setQuestionIndex(0);
                    }}
                  >
                    <strong>{type.title}</strong>
                    <small>{type.description}</small>
                  </button>
                ))}
              </div>
            </div>

            <label className="tq-field">
              <span>내 이름 또는 닉네임</span>
              <input
                required
                maxLength={ANSWER_LIMITS.displayName}
                value={startForm.displayName}
                onChange={(event) =>
                  setStartForm((form) => ({ ...form, displayName: event.target.value }))
                }
                placeholder="예: 은"
              />
            </label>

            <div className="tq-flow-note">
              <strong>무료 기본 문답 15문항</strong>
              <p>답변은 마지막에 한 번만 제출돼요. 이후 심화 문답 20문항은 프리미엄으로 확장할 예정이에요.</p>
            </div>

            <button type="submit" className="tq-button tq-button--primary" disabled={!canStart}>
              문답 시작하기
            </button>
          </form>
        ) : null}

        {[SESSION_STEPS.CREATOR_ANSWER, SESSION_STEPS.INVITEE_ANSWER].includes(step)
          ? renderAnswerScreen()
          : null}

        {step === SESSION_STEPS.CREATOR_DONE || (step === SESSION_STEPS.WAITING && isCreator) ? (
          <section className="tq-panel tq-waiting">
            <div className="tq-status-grid">
              <strong>내 답변 완료</strong>
              <span>상대 답변 대기 중</span>
              <p>상대가 완료하면 함께 결과 보기가 열려요.</p>
            </div>
            <div className="tq-link-box">{inviteUrl}</div>
            <div className="tq-actions">
              <button type="button" className="tq-button tq-button--primary" onClick={shareInviteLink}>
                상대에게 보내기
              </button>
              <button type="button" className="tq-button tq-button--secondary" onClick={copyInviteLink}>
                초대 링크 복사
              </button>
              <button type="button" className="tq-button tq-button--secondary" onClick={refreshSession}>
                상태 새로고침
              </button>
              <button type="button" className="tq-button tq-button--danger" onClick={handleDeleteSession}>
                문답 삭제
              </button>
              <button type="button" className="tq-button tq-button--ghost" onClick={resetFlow}>
                새 문답 시작
              </button>
            </div>
          </section>
        ) : null}

        {step === SESSION_STEPS.INVITE ? (
          <form className="tq-panel tq-invite" onSubmit={handleJoinSession}>
            <div className="tq-section__head">
              <span>INVITE</span>
              <h2>{session?.participants?.creator?.displayName ?? "초대한 사람"}님이 함께하는 문답에 초대했어요.</h2>
              <p>같은 질문에 내 답변을 제출하기 전까지 초대한 사람의 답변은 보이지 않아요.</p>
            </div>
            <label className="tq-field">
              <span>내 이름 또는 닉네임</span>
              <input
                required
                maxLength={ANSWER_LIMITS.displayName}
                value={inviteeName}
                onChange={(event) => setInviteeName(event.target.value)}
                placeholder="예: 하린"
              />
            </label>
            <button type="submit" className="tq-button tq-button--primary" disabled={isBusy}>
              질문 답변 시작하기
            </button>
          </form>
        ) : null}

        {step === SESSION_STEPS.WAITING && isInvitee ? (
          <section className="tq-panel tq-waiting">
            <div className="tq-status-grid">
              <strong>내 답변 완료</strong>
              <span>상대 답변 대기 중</span>
              <p>상대가 완료하면 결과 확인 가능 상태로 바뀌어요.</p>
            </div>
            <div className="tq-actions">
              <button type="button" className="tq-button tq-button--primary" onClick={refreshSession}>
                상태 새로고침
              </button>
              <button type="button" className="tq-button tq-button--danger" onClick={handleDeleteSession}>
                문답 삭제
              </button>
            </div>
          </section>
        ) : null}

        {step === SESSION_STEPS.RESULT && isComplete ? (
          <section className="tq-complete-wrap">
            <article className="tq-complete-card tq-journal-report" ref={reportRef}>
              <span>함께 결과 보기</span>
              <h2>
                {session.participants.creator?.displayName}님과 {session.participants.invitee?.displayName}님의 문답
              </h2>
              <p>
                {selectedType?.title} · {selectedPack?.title} ·{" "}
                {new Date(session.completedAt ?? Date.now()).toLocaleDateString("ko-KR")}
              </p>

              <div className="tq-summary-grid">
                <section>
                  <h3>같은 생각이었던 부분</h3>
                  <ul>{comparisonSummary.shared.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <h3>서로 다르게 생각한 부분</h3>
                  <ul>{comparisonSummary.different.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
                <section>
                  <h3>더 이야기해볼 질문</h3>
                  <ul>{comparisonSummary.followUps.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              </div>

              <div className="tq-answer-report">
                {comparisons.map((item) => (
                  <section key={item.question.id}>
                    <small>{item.question.category}</small>
                    <h3>{item.question.prompt}</h3>
                    <div>
                      <strong>{session.participants.creator?.displayName}</strong>
                      <p>{item.creatorAnswer}</p>
                    </div>
                    <div>
                      <strong>{session.participants.invitee?.displayName}</strong>
                      <p>{item.inviteeAnswer}</p>
                    </div>
                  </section>
                ))}
              </div>
            </article>

            <div className="tq-export-actions">
              <button type="button" className="tq-button tq-button--secondary" onClick={saveImage}>
                이미지 저장
              </button>
              <button type="button" className="tq-button tq-button--secondary" onClick={printPdf}>
                PDF 저장
              </button>
              <button type="button" className="tq-button tq-button--danger" onClick={handleDeleteSession}>
                문답 삭제
              </button>
              <button type="button" className="tq-button tq-button--primary" onClick={resetFlow}>
                새 문답 시작
              </button>
            </div>
          </section>
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
