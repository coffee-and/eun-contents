import { useEffect, useRef, useState } from "react";
import { Button } from "../Button.jsx";
import { EditorialLabel } from "../editorial/EditorialLabel.jsx";

function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function GameStage({
  actions,
  ariaLabel,
  children,
  className = "",
  description,
  eyebrow,
  fullscreenEnabled = false,
  title,
}) {
  const rootRef = useRef(null);
  const expandButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const previousBodyOverflowRef = useRef("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const isExpanded = isFullscreen || isFocusMode;

  useEffect(() => {
    function handleFullscreenChange() {
      const isCurrentFullscreen = document.fullscreenElement === rootRef.current;
      setIsFullscreen(isCurrentFullscreen);

      if (!document.fullscreenElement && !isCurrentFullscreen) {
        expandButtonRef.current?.focus();
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement === rootRef.current) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!isFocusMode) return undefined;

    previousBodyOverflowRef.current = document.body.style.overflow;
    document.body.classList.add("game-stage-scroll-locked");
    document.body.style.overflow = "hidden";

    return () => {
      document.body.classList.remove("game-stage-scroll-locked");
      document.body.style.overflow = previousBodyOverflowRef.current;
    };
  }, [isFocusMode]);

  useEffect(() => {
    if (!isExpanded) return;
    expandButtonRef.current?.focus();
  }, [isExpanded]);

  async function enterExpandedMode() {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    previousFocusRef.current = document.activeElement;

    if (!fullscreenEnabled || !rootElement.requestFullscreen) {
      setIsFocusMode(true);
      return;
    }

    try {
      await rootElement.requestFullscreen();
      setIsFullscreen(document.fullscreenElement === rootElement);
    } catch {
      setIsFocusMode(true);
    }
  }

  async function exitExpandedMode() {
    if (document.fullscreenElement === rootRef.current) {
      try {
        await document.exitFullscreen();
      } catch {
        setIsFullscreen(false);
      }
    }

    setIsFocusMode(false);
    window.setTimeout(() => {
      previousFocusRef.current?.focus?.();
      expandButtonRef.current?.focus();
    }, 0);
  }

  function handleToggleExpanded() {
    if (isExpanded) {
      exitExpandedMode();
      return;
    }

    enterExpandedMode();
  }

  return (
    <section
      ref={rootRef}
      className={joinClassNames([
        "game-stage",
        isExpanded ? "is-expanded" : "",
        isFocusMode ? "is-focus-mode" : "",
        className,
      ])}
      aria-label={ariaLabel ?? title}
    >
      <div className="game-stage__inner">
        <header className="game-stage__header">
          <div className="game-stage__copy">
            {eyebrow ? <EditorialLabel variant="section">{eyebrow}</EditorialLabel> : null}
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>

          <div className="game-stage__actions">
            {actions}
            {fullscreenEnabled ? (
              <Button
                ref={expandButtonRef}
                className="game-stage__expand"
                variant="secondary"
                type="button"
                onClick={handleToggleExpanded}
                aria-label={isExpanded ? "전체화면 종료" : "게임 크게 보기"}
              >
                {isExpanded ? "전체화면 종료" : "크게 보기"}
              </Button>
            ) : null}
          </div>
        </header>

        <div className="game-stage__content">{children}</div>
      </div>
    </section>
  );
}
