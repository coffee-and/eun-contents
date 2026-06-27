// 한쪽 답변 제출 후 상대방 완료를 기다리는 화면입니다.
export function WaitingPanel({
  inviteUrl,
  isCreator,
  onCopyInvite,
  onDelete,
  onRefresh,
  onReset,
  onShareInvite,
}) {
  return (
    <section className="tq-panel tq-waiting">
      <div className="tq-status-grid">
        <strong>내 답변 완료</strong>
        <span>상대 답변 대기 중</span>
        <p>상대가 완료하면 함께 결과 보기가 열려요.</p>
      </div>

      {isCreator ? <div className="tq-link-box">{inviteUrl}</div> : null}

      <div className="tq-actions">
        {isCreator ? (
          <>
            <button type="button" className="tq-button tq-button--primary" onClick={onShareInvite}>
              상대에게 보내기
            </button>
            <button type="button" className="tq-button tq-button--secondary" onClick={onCopyInvite}>
              초대 링크 복사
            </button>
          </>
        ) : null}
        <button type="button" className="tq-button tq-button--secondary" onClick={onRefresh}>
          상태 새로고침
        </button>
        <button type="button" className="tq-button tq-button--danger" onClick={onDelete}>
          문답 삭제
        </button>
        {isCreator ? (
          <button type="button" className="tq-button tq-button--ghost" onClick={onReset}>
            새 문답 시작
          </button>
        ) : null}
      </div>
    </section>
  );
}
