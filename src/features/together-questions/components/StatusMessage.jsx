// Together Questions 화면 상단의 현재 안내를 표시합니다.
export function StatusMessage({ notice, errorMessage }) {
  if (notice) {
    return <p className="tq-alert tq-alert--success">{notice}</p>;
  }

  if (errorMessage) {
    return <p className="tq-alert tq-alert--error">{errorMessage}</p>;
  }

  return null;
}
