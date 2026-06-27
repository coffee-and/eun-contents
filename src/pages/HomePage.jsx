import { CONTENT_CATALOG, CONTENT_STATUS } from "../app/contentCatalog.js";

export function HomePage({ onNavigate }) {
  return (
    <div className="hub-page">
      <header className="hub-hero">
        <span className="hub-hero__eyebrow">EUN CONTENTS</span>
        <h1 className="hub-hero__title">나와 우리를 조금 더 알아가는 다양한 콘텐츠</h1>
        <p className="hub-hero__description">
          관계 진단부터 함께하는 문답, 사주와 미니게임까지 하나씩 채워갈게요.
        </p>
      </header>

      <section className="content-grid">
        {CONTENT_CATALOG.map((content) => {
          const isActive = content.status === CONTENT_STATUS.ACTIVE;

          return (
            <article
              key={content.id}
              className={`content-card content-card--${content.theme}${
                isActive ? " content-card--active" : ""
              }`}
            >
              <div className="content-card__top">
                <span className="content-card__icon" aria-hidden="true">
                  {content.icon}
                </span>
                <span className="content-card__category">{content.category}</span>
              </div>

              <div className="content-card__body">
                <h2 className="content-card__title">{content.title}</h2>
                <span className="content-card__accent" aria-hidden="true" />
                <p className="content-card__description">{content.description}</p>
              </div>

              <button
                type="button"
                className={`content-card__button${
                  isActive ? " content-card__button--active" : ""
                }`}
                onClick={() => onNavigate(content.route)}
                disabled={!isActive}
              >
                <span>{content.actionLabel}</span>
                {isActive ? (
                  <span className="content-card__button-icon" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
