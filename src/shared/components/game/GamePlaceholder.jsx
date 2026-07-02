import { Button } from "../Button.jsx";
import { EditorialCard } from "../editorial/EditorialCard.jsx";
import { EditorialLabel } from "../editorial/EditorialLabel.jsx";

export function GamePlaceholder({
  description,
  onStart,
  startLabel = "게임 시작",
  status = "준비 중",
  title,
}) {
  const canStart = typeof onStart === "function";

  return (
    <div className="game-placeholder">
      <EditorialCard className="game-placeholder__card">
        <div className="game-placeholder__copy">
          <EditorialLabel variant="section">{status}</EditorialLabel>
          <h3>{title}</h3>
          <p>{description}</p>
          <p className="game-placeholder__notice">새로운 퍼즐을 준비하고 있어요.</p>
        </div>

        <div className="game-placeholder__actions">
          <Button
            type="button"
            onClick={onStart}
            disabled={!canStart}
            aria-disabled={!canStart}
          >
            {startLabel}
          </Button>
          <span className="game-placeholder__status" aria-live="polite">
            {status}
          </span>
        </div>
      </EditorialCard>
    </div>
  );
}
