import { useMemo, useState } from "react";
import { AppShell } from "../../shared/components/AppShell.jsx";
import {
  QUESTION_MOODS,
  RELATIONSHIP_TYPES,
  getQuestions,
} from "./data/questionPacks.js";
import "./styles/together-questions.css";

const STEP = {
  TYPE: "type",
  MOOD: "mood",
  QUESTION: "question",
  COMPLETE: "complete",
};

export default function TogetherQuestionsApp({ onNavigateHome }) {
  const [step, setStep] = useState(STEP.TYPE);
  const [relationshipType, setRelationshipType] = useState(null);
  const [mood, setMood] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  const selectedType = RELATIONSHIP_TYPES.find(
    (item) => item.id === relationshipType
  );
  const selectedMood = QUESTION_MOODS.find((item) => item.id === mood);
  const questions = useMemo(
    () => getQuestions(relationshipType, mood),
    [relationshipType, mood]
  );
  const currentQuestion = questions[questionIndex];

  function selectType(type) {
    setRelationshipType(type);
    setMood(null);
    setQuestionIndex(0);
    setStep(STEP.MOOD);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectMood(nextMood) {
    setMood(nextMood);
    setQuestionIndex(0);
    setCompletedCount(0);
    setStep(STEP.QUESTION);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    setCompletedCount((count) => count + 1);
    if (questionIndex >= questions.length - 1) {
      setStep(STEP.COMPLETE);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setQuestionIndex((index) => index + 1);
  }

  function skipQuestion() {
    if (questionIndex >= questions.length - 1) {
      setQuestionIndex(0);
      return;
    }
    setQuestionIndex((index) => index + 1);
  }

  function toggleSaveQuestion() {
    setSavedQuestions((items) =>
      items.includes(currentQuestion)
        ? items.filter((item) => item !== currentQuestion)
        : [...items, currentQuestion]
    );
  }

  function restart() {
    setStep(STEP.TYPE);
    setRelationshipType(null);
    setMood(null);
    setQuestionIndex(0);
    setCompletedCount(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="theme-together-questions">
      <AppShell>
        <header className="tq-hero">
          <div>
            <span className="tq-hero__eyebrow">QUESTIONS TOGETHER</span>
            <h1>함께하는 문답</h1>
            <p>
              평소에는 꺼내기 어려웠던 이야기부터 서로를 조금 더 알아가는
              가벼운 질문까지, 한 질문씩 천천히 나눠보세요.
            </p>
          </div>
          <button type="button" className="tq-home-button" onClick={onNavigateHome}>
            콘텐츠 홈
          </button>
        </header>

        {step !== STEP.TYPE ? (
          <nav className="tq-breadcrumb" aria-label="문답 진행 단계">
            <button type="button" onClick={restart}>관계 선택</button>
            {selectedType ? <span>› {selectedType.title}</span> : null}
            {selectedMood ? <span>› {selectedMood.title}</span> : null}
          </nav>
        ) : null}

        {step === STEP.TYPE ? (
          <section className="tq-section">
            <div className="tq-section__head">
              <span>STEP 01</span>
              <h2>누구와 함께 이야기하나요?</h2>
              <p>관계를 선택하면 어울리는 질문 흐름을 준비해드려요.</p>
            </div>
            <div className="tq-type-grid">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.id}
                  className={`tq-type-card tq-type-card--${type.accent}`}
                  onClick={() => selectType(type.id)}
                >
                  <span className="tq-type-card__icon">{type.icon}</span>
                  <strong>{type.title}</strong>
                  <small>{type.description}</small>
                  <em>선택하기 →</em>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {step === STEP.MOOD ? (
          <section className="tq-section">
            <div className="tq-section__head">
              <span>STEP 02</span>
              <h2>오늘은 어떤 이야기를 나눠볼까요?</h2>
              <p>{selectedType?.title} 사이에 어울리는 분위기를 골라보세요.</p>
            </div>
            <div className="tq-mood-grid">
              {QUESTION_MOODS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="tq-mood-card"
                  onClick={() => selectMood(item.id)}
                >
                  <span>{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </div>
                  <em>→</em>
                </button>
              ))}
            </div>
            <button type="button" className="tq-text-button" onClick={restart}>
              ← 관계 다시 선택하기
            </button>
          </section>
        ) : null}

        {step === STEP.QUESTION && currentQuestion ? (
          <section className="tq-question-wrap">
            <div className="tq-question-meta">
              <span>{selectedType?.title} · {selectedMood?.title}</span>
              <strong>{String(questionIndex + 1).padStart(2, "0")} / {String(questions.length).padStart(2, "0")}</strong>
            </div>

            <article className="tq-question-card">
              <span className="tq-question-card__label">TODAY'S QUESTION</span>
              <h2>{currentQuestion}</h2>
              <p>상대의 답을 바로 판단하지 말고 끝까지 들어보세요.</p>
            </article>

            <div className="tq-question-actions">
              <button type="button" className="tq-button tq-button--soft" onClick={skipQuestion}>
                다른 질문 보기
              </button>
              <button type="button" className="tq-button tq-button--primary" onClick={goNext}>
                이야기했어요 · 다음 질문
              </button>
            </div>

            <button
              type="button"
              className={`tq-save-button ${savedQuestions.includes(currentQuestion) ? "is-saved" : ""}`}
              onClick={toggleSaveQuestion}
            >
              {savedQuestions.includes(currentQuestion) ? "저장됨 ✓" : "질문 저장하기"}
            </button>
          </section>
        ) : null}

        {step === STEP.COMPLETE ? (
          <section className="tq-complete-card">
            <span>CONVERSATION COMPLETE</span>
            <h2>오늘 {completedCount}개의 이야기를 나눴어요</h2>
            <p>
              서로를 더 잘 알게 된 순간이 있었나요? 좋았던 질문은 저장해두고
              다음에도 천천히 이어가보세요.
            </p>
            {savedQuestions.length ? (
              <div className="tq-saved-list">
                <strong>저장한 질문</strong>
                <ul>
                  {savedQuestions.map((question) => <li key={question}>{question}</li>)}
                </ul>
              </div>
            ) : null}
            <div className="tq-complete-actions">
              <button type="button" className="tq-button tq-button--soft" onClick={() => setStep(STEP.MOOD)}>
                다른 주제로 이어가기
              </button>
              <button type="button" className="tq-button tq-button--primary" onClick={restart}>
                처음으로 돌아가기
              </button>
            </div>
          </section>
        ) : null}
      </AppShell>
    </div>
  );
}
