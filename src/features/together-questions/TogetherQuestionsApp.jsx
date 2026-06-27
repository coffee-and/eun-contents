import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AppShell } from "../../shared/components/AppShell.jsx";
import { QUESTION_MOODS, RELATIONSHIP_TYPES, getQuestions } from "./data/questionPacks.js";
import { clearJournal, createJournal, loadJournal, saveJournal } from "./utils/journalStorage.js";
import "./styles/together-questions.css";
import "./styles/together-questions-journal.css";

const STEP = { TYPE: "type", PROFILE: "profile", MOOD: "mood", QUESTION: "question", COMPLETE: "complete" };

export default function TogetherQuestionsApp({ onNavigateHome }) {
  const [step, setStep] = useState(STEP.TYPE);
  const [journal, setJournal] = useState(loadJournal);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [draft, setDraft] = useState({ firstAnswer: "", secondAnswer: "" });
  const reportRef = useRef(null);
  const selectedType = RELATIONSHIP_TYPES.find((item) => item.id === journal.relationshipType);
  const selectedMood = QUESTION_MOODS.find((item) => item.id === journal.mood);
  const questions = useMemo(() => getQuestions(journal.relationshipType, journal.mood), [journal.relationshipType, journal.mood]);
  const currentQuestion = questions[questionIndex];

  useEffect(() => { saveJournal(journal); }, [journal]);
  useEffect(() => {
    const saved = currentQuestion ? journal.answers[currentQuestion.id] : null;
    setDraft({ firstAnswer: saved?.firstAnswer ?? "", secondAnswer: saved?.secondAnswer ?? "" });
  }, [currentQuestion, journal.answers]);

  const top = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const updateParticipant = (key, value) => setJournal((item) => ({ ...item, participants: { ...item.participants, [key]: value } }));

  function selectType(type) {
    setJournal((item) => ({ ...item, relationshipType: type, mood: null }));
    setStep(STEP.PROFILE);
    top();
  }

  function selectMood(mood) {
    setJournal((item) => ({ ...item, mood }));
    setQuestionIndex(0);
    setStep(STEP.QUESTION);
    top();
  }

  function saveAnswer() {
    if (!currentQuestion) return;
    setJournal((item) => ({
      ...item,
      answers: {
        ...item.answers,
        [currentQuestion.id]: {
          questionId: currentQuestion.id,
          prompt: currentQuestion.prompt,
          category: currentQuestion.category,
          firstAnswer: draft.firstAnswer.trim(),
          secondAnswer: draft.secondAnswer.trim(),
          completedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function nextQuestion() {
    saveAnswer();
    if (questionIndex === questions.length - 1) {
      setStep(STEP.COMPLETE);
      top();
    } else setQuestionIndex((index) => index + 1);
  }

  function restart() {
    clearJournal();
    setJournal(createJournal());
    setQuestionIndex(0);
    setStep(STEP.TYPE);
    top();
  }

  async function saveImage() {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { backgroundColor: "#ffffff", scale: 2 });
    const link = document.createElement("a");
    link.download = `함께하는-문답-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const answered = questions.filter((question) => journal.answers[question.id]);

  return (
    <div className="theme-together-questions"><AppShell>
      <header className="tq-hero"><div><span className="tq-hero__eyebrow">QUESTIONS TOGETHER</span><h1>함께하는 문답</h1><p>서로의 마음과 추억을 한 질문씩 천천히 기록해보세요.</p></div><button type="button" className="tq-home-button" onClick={onNavigateHome}>콘텐츠 홈</button></header>
      {step !== STEP.TYPE ? <nav className="tq-breadcrumb"><button type="button" onClick={restart}>관계 선택</button>{selectedType ? <span>› {selectedType.title}</span> : null}{selectedMood ? <span>› {selectedMood.title}</span> : null}</nav> : null}

      {step === STEP.TYPE ? <section className="tq-section"><div className="tq-section__head"><span>STEP 01</span><h2>누구와 함께 기록하나요?</h2><p>관계를 선택하면 어울리는 질문을 준비해드려요.</p></div><div className="tq-type-grid">{RELATIONSHIP_TYPES.map((type) => <button type="button" key={type.id} className={`tq-type-card tq-type-card--${type.accent}`} onClick={() => selectType(type.id)}><span className="tq-type-card__icon">{type.icon}</span><strong>{type.title}</strong><small>{type.description}</small><em>선택하기 →</em></button>)}</div></section> : null}

      {step === STEP.PROFILE ? <section className="tq-section tq-profile"><div className="tq-section__head"><span>STEP 02</span><h2>우리의 정보를 남겨볼까요?</h2><p>모든 항목은 선택 사항이며 기록 표지에 표시돼요.</p></div><div className="tq-profile-grid"><label>첫 번째 이름<input value={journal.participants.firstName} onChange={(e) => updateParticipant("firstName", e.target.value)} /></label><label>두 번째 이름<input value={journal.participants.secondName} onChange={(e) => updateParticipant("secondName", e.target.value)} /></label><label>첫 번째 생일<input type="date" value={journal.participants.firstBirthday} onChange={(e) => updateParticipant("firstBirthday", e.target.value)} /></label><label>두 번째 생일<input type="date" value={journal.participants.secondBirthday} onChange={(e) => updateParticipant("secondBirthday", e.target.value)} /></label><label>서로의 애칭<input value={journal.participants.nickname} onChange={(e) => updateParticipant("nickname", e.target.value)} /></label><label>기념일<input type="date" value={journal.participants.anniversary} onChange={(e) => updateParticipant("anniversary", e.target.value)} /></label><label className="tq-profile-grid__wide">우리의 좌우명<textarea rows="2" value={journal.participants.motto} onChange={(e) => updateParticipant("motto", e.target.value)} /></label><label className="tq-profile-grid__wide">삶에서 가장 중요하게 생각하는 것<textarea rows="2" value={journal.participants.importantValue} onChange={(e) => updateParticipant("importantValue", e.target.value)} /></label></div><button type="button" className="tq-button tq-button--primary tq-profile-next" onClick={() => setStep(STEP.MOOD)}>저장하고 다음</button></section> : null}

      {step === STEP.MOOD ? <section className="tq-section"><div className="tq-section__head"><span>STEP 03</span><h2>오늘은 어떤 이야기를 기록할까요?</h2><p>{selectedType?.title} 사이에 어울리는 주제를 골라보세요.</p></div><div className="tq-mood-grid">{QUESTION_MOODS.map((item) => <button type="button" key={item.id} className="tq-mood-card" onClick={() => selectMood(item.id)}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.description}</small></div><em>→</em></button>)}</div></section> : null}

      {step === STEP.QUESTION && currentQuestion ? <section className="tq-question-wrap"><div className="tq-question-meta"><span>{currentQuestion.category} · {selectedMood?.title}</span><strong>{questionIndex + 1} / {questions.length}</strong></div><article className="tq-question-card"><span className="tq-question-card__label">TODAY'S QUESTION</span><h2>{currentQuestion.prompt}</h2><p>{currentQuestion.helperText}</p></article><div className="tq-answer-grid"><label><span>{journal.participants.firstName || "첫 번째 사람"}의 답변</span><textarea rows="5" value={draft.firstAnswer} onChange={(e) => setDraft((item) => ({ ...item, firstAnswer: e.target.value }))} /></label><label><span>{journal.participants.secondName || "두 번째 사람"}의 답변</span><textarea rows="5" value={draft.secondAnswer} onChange={(e) => setDraft((item) => ({ ...item, secondAnswer: e.target.value }))} /></label></div><div className="tq-question-actions"><button type="button" className="tq-button tq-button--soft" disabled={questionIndex === 0} onClick={() => { saveAnswer(); setQuestionIndex((index) => Math.max(0, index - 1)); }}>이전 질문</button><button type="button" className="tq-button tq-button--primary" onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "기록 완성하기" : "저장하고 다음"}</button></div></section> : null}

      {step === STEP.COMPLETE ? <section className="tq-complete-wrap"><article className="tq-complete-card tq-journal-report" ref={reportRef}><span>OUR QUESTION JOURNAL</span><h2>{journal.participants.firstName || "우리"}와 {journal.participants.secondName || "소중한 사람"}의 문답</h2><p>{selectedType?.title} · {selectedMood?.title} · {new Date().toLocaleDateString("ko-KR")}</p><div className="tq-answer-report">{answered.map((question) => { const answer = journal.answers[question.id]; return <section key={question.id}><small>{question.category}</small><h3>{question.prompt}</h3><div><strong>{journal.participants.firstName || "첫 번째 사람"}</strong><p>{answer.firstAnswer || "아직 작성하지 않았어요."}</p></div><div><strong>{journal.participants.secondName || "두 번째 사람"}</strong><p>{answer.secondAnswer || "아직 작성하지 않았어요."}</p></div></section>; })}</div></article><div className="tq-export-actions"><button type="button" className="tq-button tq-button--soft" onClick={saveImage}>이미지 저장</button><button type="button" className="tq-button tq-button--soft" onClick={() => window.print()}>PDF로 저장</button><button type="button" className="tq-button tq-button--primary" onClick={() => setStep(STEP.MOOD)}>다른 주제 이어가기</button></div></section> : null}
    </AppShell></div>
  );
}
