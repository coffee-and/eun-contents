// Together Questions 화면 상단의 성공/오류 안내를 표시합니다.
export function StatusMessage({ notice, errorMessage }) {
  return (
    <>
      {notice ? <p className="tq-alert tq-alert--success">{notice}</p> : null}
      {errorMessage ? <p className="tq-alert tq-alert--error">{errorMessage}</p> : null}
    </>
  );
}
