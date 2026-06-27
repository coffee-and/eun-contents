// 초대받은 사람이 이름을 입력하고 문답에 참여하는 화면입니다.
import { ANSWER_LIMITS } from "../constants/sessionFlow.js";

export function InvitePanel({ inviteeName, isBusy, session, onChangeName, onSubmit }) {
  return (
    <form className="tq-panel tq-invite" onSubmit={onSubmit}>
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
          onChange={(event) => onChangeName(event.target.value)}
          placeholder="예: 하린"
        />
      </label>
      <button type="submit" className="tq-button tq-button--primary" disabled={isBusy}>
        질문 답변 시작하기
      </button>
    </form>
  );
}
