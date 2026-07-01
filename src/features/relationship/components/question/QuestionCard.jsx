import { Button } from "../../../../shared/components/Button.jsx";
import { EditorialCard } from "../../../../shared/components/editorial/EditorialCard.jsx";
import { EditorialLabel } from "../../../../shared/components/editorial/EditorialLabel.jsx";
import { EditorialMeta } from "../../../../shared/components/editorial/EditorialMeta.jsx";
import { CATEGORY_META } from "../../data/config.js";

export function QuestionCard(props) {
  const {
    question,
    questionNumber,
    totalQuestions,
    selectedOptionId,
    canGoPrevious,
    onSelectOption,
    onNext,
    onPrevious,
    modeLabel,
  } = props;
  const categoryLabel = CATEGORY_META[question.category]?.label ?? question.category;

  return (
    <EditorialCard className="card question-card" variant="question">
      <div className="question-card__top">
        <div className="question-card__badge-wrap">
          <EditorialMeta className="question-card__badge-group">
            <span className="question-card__labels editorial-meta__group">
              <EditorialLabel className="badge badge--soft" variant="badge">
                {categoryLabel}
              </EditorialLabel>
              {modeLabel ? (
                <EditorialLabel className="question-card__mode-label" variant="muted">
                  {modeLabel}
                </EditorialLabel>
              ) : null}
            </span>
            <span className="question-card__index editorial-meta__text">
              Q {String(questionNumber).padStart(2, "0")} / {totalQuestions}
            </span>
          </EditorialMeta>
        </div>
        <div className="question-card__line" />
      </div>

      <h2 className="question-card__title">
        <span className="question-card__title-number">{questionNumber}.</span>{" "}
        {question.prompt}
      </h2>

      <div className="option-list">
        {question.options.map((option) => {
          const selected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              className={`option-card editorial-option-card ${
                selected ? "option-card--selected" : ""
              }`}
              onClick={() => onSelectOption(option.id)}
            >
              <span className="option-card__text">{option.label}</span>
            </button>
          );
        })}
      </div>

      <div className="question-card__actions">
        <Button variant="secondary" className="question-card__previous" disabled={!canGoPrevious} onClick={onPrevious}>
          이전 질문으로
        </Button>
        <Button variant="primary" className="question-card__next" disabled={!selectedOptionId} onClick={onNext}>
          다음 질문으로
        </Button>
      </div>
    </EditorialCard>
  );
}
