import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AppShell } from "../../shared/components/AppShell.jsx";
import {
  QUESTION_MOODS,
  RELATIONSHIP_TYPES,
  getQuestions,
} from "./data/questionPacks.js";
import {
  createQuestionRecord,
  deleteQuestionRecord,
  loadQuestionRecords,
  saveQuestionRecord,
} from "./utils/recordStorage.js";
import "./styles/together-questions.css";

const STEP = {
  TYPE: "type",
  INFO: "info",
  MOOD: "mood",
  QUESTION: "question",
  COMPLETE: "complete",
  RECORDS: "records",
};

const PARTICIPANT_FIELDS = [
  ["firstName", "첫 번째 이름"],
  ["secondName", "두 번째 이름"],
  ["firstBirthday", "첫 번째 생일", "date"],
  ["secondBirthday", "두 번째 생일", "date"],
  ["nickname", "서로를 부르는 애칭"],
  ["anniversary", "기념일 또는 처음 만난 날", "date"],
  ["motto", "우리 중 한 사람의 좌우명"],
  ["importantValue", "삶에서 가장 중요하게 생각하는 것"],
];

export default function TogetherQuestionsApp({ onNavigateHome }) {
  const [step, setStep] = useState(STEP.TYPE);
  const [record, setRecord] = useState(createQuestionRecord);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [records, setRecords] = useState(loadQuestionRecords);
  const exportRef = useRef(null);

  const selectedType = RELATIONSHIP_TYPES.find(
    (item) => item.id === record.relationshipType
  );
  const selectedMood = QUESTION_MOODS.find((item) => item.id === record.mood);
  const questions = useMemo(
    () => getQuestions(record.relationshipType, record.mood),
    [record.relationshipType, record.mood]
  );
  const currentQuestion = questions[questionIndex];
  const currentAnswer = currentQuestion
    ? record.answers[currentQuestion.id] ?? { first: "", second: "" }
    : { first: "", second: "" };

  useEffect(() => {
    if (!record.relationshipType) return;
    const saved = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    const nextRecords = saveQuestionRecord(saved);
    setRecords(nextRecords);
  }, [record]);

  function moveTo(nextStep) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectType(type) {
    setRecord((current) => ({ ...current, relationshipType: type }));
    moveTo(STEP.INFO);
  }

  function updateParticipant(key, value) {
    setRecord((current) => ({
      ...current,
      participants: { ...current.participants, [key]: value },
    }));
  }

  function selectMood(mood) {
    setRecord((current) => ({ ...current, mood }));
    setQuestionIndex(0);
    moveTo(STEP.QUESTION);
  }

  function updateAnswer(person, value) {
    if (!currentQuestion) return;
    setRecord((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [currentQuestion.id]: {
          ...(current.answers[currentQuestion.id] ?? { first: "", second: "" }),
          [person]: value,
        },
      },
    }));
  }

  function goNext() {
    if (questionIndex >= questions.length - 1) {
      moveTo(STEP.COMPLETE);
      return;
    }
    setQuestionIndex((index) => index + 1);
  }

  function goPrevious() {
    setQuestionIndex((index) => Math.max(0, index - 1));
  }

  function restart() {
    setRecord(createQuestionRecord());
    setQuestionIndex(0);
    moveTo(STEP.TYPE);
  }

  function openRecord(savedRecord) {
    setRecord(savedRecord);
    setQuestionIndex(0);
    moveTo(savedRecord.mood ? STEP.COMPLETE : STEP.INFO);
  }

  function removeRecord(recordId) {
    setRecords(deleteQuestionRecord(recordId));
  }

  async function saveAsImage() {
    if (!exportRef.current) return;
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
    });
    const link = document.createElement("a");
    link.download = `함께하는-문답-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function saveAsPdf() {
    window.print();
  }

  const answeredQuestions = Object.entries(record.answers).filter(
    ([, answer]) => answer.first?.trim() || answer.second?.trim()
  );

  return (
    <div className="theme-together-questions">
      <AppShell>
        <header className="tq-hero">
          <div>
            <span className="tq-hero__eyebrow">QUESTIONS TOGETHER</span>
            <h1>함께하는 문답</h1>
            <p>서로를 더 알아가고, 답변을 오래 간직할 수 있는 작은 문답책이에요.</p>
          </div>
          <div className="tq-hero__actions">
            <button type="button" className="tq-home-button" onClick={() => moveTo(STEP.RECORDS)}>
              저장 기록
            </button>
            <button type="button" className="tq-home-button" onClick={onNavigateHome}>
              콘텐츠 홈
            </button>
          </div>
        </header>

        {step === STEP.TYPE ? (
          <section className="tq-section">
            <div className="tq-section__head">
              <span>STEP 01</span>
              <h2>누구와 함께 기록하나요?</h2>
              <p>관계를 선택하면 어울리는 질문을 준비해드려요.</p>
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

        {step === STEP.INFO ? (
          <section className="tq-section tq-info-section">
            <div className="tq-section__head">
              <span>STEP 02</span>
              <h2>우리의 정보를 남겨보세요</h2>
              <p>모두 선택 입력이에요. 비워둔 항목은 기록 결과에서 제외돼요.</p>
            </div>
            <div className="tq-info-grid">
              {PARTICIPANT_FIELDS.map(([key, label, type = "text"]) => (
                <label key={key} className="tq-field">
                  <span>{label}</span>
                  <input
                    type={type}
                    value={record.participants[key]}
                    onChange={(event) => updateParticipant(key, event.target.value)}
                  />
                </label>
              ))}
            </div>
            <div className="tq-inline-actions">
              <button type="button" className="tq-button tq-button--soft" onClick={() => moveTo(STEP.TYPE)}>
                이전
              </button>
              <button type="button" className="tq-button tq-button--primary" onClick={() => moveTo(STEP.MOOD)}>
                질문 고르기
              </button>
            </div>
          </section>
        ) : null}

        {step === STEP.MOOD ? (
          <section className="tq-section">
            <div className="tq-section__head">
              <span>STEP 03</span>
              <h2>어떤 이야기를 기록할까요?</h2>
              <p>{selectedType?.title} 사이에 어울리는 질문 묶음을 골라보세요.</p>
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
          </section>
        ) : null}

        {step === STEP.QUESTION && currentQuestion ? (
          <section className="tq-question-wrap">
            <div className="tq-question-meta">
              <span>{selectedType?.title} · {selectedMood?.title}</span>
              <strong>{questionIndex + 1} / {questions.length}</strong>
            </div>
            <article className="tq-question-card">
              <span className="tq-question-card__label">QUESTION</span>
              <h2>{currentQuestion.prompt}</h2>
              {currentQuestion.helperText ? <p>{currentQuestion.helperText}</p> : null}
              <div className="tq-answer-grid">
                <label className="tq-answer-field">
                  <span>{record.participants.firstName || "첫 번째 사람"}의 답변</span>
                  <textarea
                    rows="5"
                    value={currentAnswer.first}
                    onChange={(event) => updateAnswer("first", event.target.value)}
                    placeholder="천천히 생각하고 적어보세요."
                  />
                </label>
                <label className="tq-answer-field">
                  <span>{record.participants.secondName || "두 번째 사람"}의 답변</span>
                  <textarea
                    rows="5"
                    value={currentAnswer.second}
                    onChange={(event) => updateAnswer("second", event.target.value)}
                    placeholder="서로 다른 답도 소중한 기록이에요."
                  />
                </label>
              </div>
            </article>
            <div className="tq-question-actions">
              <button type="button" className="tq-button tq-button--soft" onClick={goPrevious} disabled={questionIndex === 0}>
                이전 질문
              </button>
              <button type="button" className="tq-button tq-button--primary" onClick={goNext}>
                {questionIndex === questions.length - 1 ? "기록 완성하기" : "다음 질문"}
              </button>
            </div>
          </section>
        ) : null}

        {step === STEP.COMPLETE ? (
          <section className="tq-complete-wrap">
            <div ref={exportRef} className="tq-record-book">
              <span className="tq-record-book__eyebrow">OUR QUESTION BOOK</span>
              <h2>{record.participants.firstName || "우리"}와 {record.participants.secondName || "우리"}의 문답</h2>
              <p>{selectedType?.title} · {selectedMood?.title} · {new Date(record.updatedAt).toLocaleDateString("ko-KR")}</p>

              <dl className="tq-profile-list">
                {PARTICIPANT_FIELDS.map(([key, label]) =>
                  record.participants[key] ? (
                    <div key={key}><dt>{label}</dt><dd>{record.participants[key]}</dd></div>
                  ) : null
                )}
              </dl>

              <div className="tq-record-answers">
                {answeredQuestions.map(([questionId, answer], index) => {
                  const question = questions.find((item) => item.id === questionId);
                  if (!question) return null;
                  return (
                    <article key={questionId}>
                      <span>QUESTION {String(index + 1).padStart(2, "0")}</span>
                      <h3>{question.prompt}</h3>
                      <div><strong>{record.participants.firstName || "첫 번째 사람"}</strong><p>{answer.first || "답변하지 않았어요."}</p></div>
                      <div><strong>{record.participants.secondName || "두 번째 사람"}</strong><p>{answer.second || "답변하지 않았어요."}</p></div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="tq-complete-actions">
              <button type="button" className="tq-button tq-button--soft" onClick={() => moveTo(STEP.MOOD)}>다른 주제 이어가기</button>
              <button type="button" className="tq-button tq-button--soft" onClick={saveAsImage}>이미지 저장</button>
              <button type="button" className="tq-button tq-button--primary" onClick={saveAsPdf}>PDF 저장</button>
            </div>
          </section>
        ) : null}

        {step === STEP.RECORDS ? (
          <section className="tq-section">
            <div className="tq-section__head">
              <span>SAVED RECORDS</span>
              <h2>저장된 문답 기록</h2>
              <p>작성 중인 기록도 자동으로 이 기기에 저장돼요.</p>
            </div>
            <div className="tq-record-list">
              {records.length ? records.map((item) => (
                <article key={item.id}>
                  <button type="button" onClick={() => openRecord(item)}>
                    <strong>{item.participants.firstName || "첫 번째 사람"} · {item.participants.secondName || "두 번째 사람"}</strong>
                    <span>{new Date(item.updatedAt).toLocaleDateString("ko-KR")} · 답변 {Object.keys(item.answers).length}개</span>
                  </button>
                  <button type="button" className="tq-delete-button" onClick={() => removeRecord(item.id)}>삭제</button>
                </article>
              )) : <p className="tq-empty">아직 저장된 기록이 없어요.</p>}
            </div>
            <button type="button" className="tq-button tq-button--primary" onClick={restart}>새 문답 시작하기</button>
          </section>
        ) : null}
      </AppShell>
    </div>
  );
}
