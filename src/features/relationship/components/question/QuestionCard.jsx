import { Button } from "../../../../shared/components/Button.jsx";
import { CATEGORY_META } from "../../data/config.js";

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  canGoPrevious,
  onSelectOption,
  onNext,
  onPrevious,
  modeLabel,
}) {
  const categoryLabel = CATEGORY_META[question.category]?.label ?? question.category;

  return (
    <section className="card question-card">
      <div className="question-card__top">
        <div className="question-card__badge-wrap">
          <div className="question-card__badge-group">
            <span className="badge badge--soft">{categoryLabel}</span>
            {modeLabel ? (
              <span className="question-card__mode-label">{modeLabel}</span>
            ) : null}
            <span className="question-card__index">
              Q {String(questionNumber).padStart(2, "0")} / {totalQuestions}
            </span>
          </div>
        </div>

        <div className="question-card__line" />
      </div>

      <h2 className="question-card__title">
        <span className="question-card__title-number">{questionNumber}.</span>{" "}
        {question.prompt}
      </h2>

      <p className="question-card__hint">
        현재 상태에 가장 가까운 답변을 선택해주세요.
      </p>

      <div className="option-list">
        {question.options.map((option) => {
          const isSelected = option.id === selectedOptionId;

          return (
            <button
              key={option.id}
              type="button"
              className={`option-card ${isSelected ? "option-card--selected" : ""}`}
              onClick={() => onSelectOption(option.id)}
            >
              <span className="option-card__text">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="question-card__actions">
        <Button
          variant="secondary"
          className="question-card__previous"
          disabled={!canGoPrevious}
          onClick={onPrevious}
        >
          이전 질문으로
        </Button>

        <Button
          variant="primary"
          className="question-card__next"
          disabled={!selectedOptionId}
          onClick={onNext}
        >
          다음 질문으로
        </Button>
      </div>
    </section>
  );
}
