const selectionThemeClasses = [
  "tq-select-card--sage",
  "tq-select-card--peach",
  "tq-select-card--cream",
];

const questionThemeClasses = [
  "tq-question-item--warm",
  "tq-question-item--sage",
  "tq-question-item--peach",
  "tq-question-item--almond",
];

const answerThemeClasses = [
  "tq-answer-section--warm",
  "tq-answer-section--sage",
  "tq-answer-section--peach",
  "tq-answer-section--almond",
];

function getThemeClass(themeClasses, index) {
  return themeClasses[index % themeClasses.length];
}

export function getSelectionThemeClass(index) {
  return getThemeClass(selectionThemeClasses, index);
}

export function getQuestionThemeClass(index) {
  return getThemeClass(questionThemeClasses, index);
}

export function getAnswerThemeClass(index) {
  return getThemeClass(answerThemeClasses, index);
}
