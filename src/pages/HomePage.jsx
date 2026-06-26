import { CONTENT_CATALOG, CONTENT_STATUS } from "../data/contentCatalog.js";

export function HomePage({ onNavigate }) {
  return (
    <div className="hub-page">
      <header className="hub-hero">
        <span className="hub-hero__eyebrow">OUR STORY LAB</span>
        <h1 className="hub-hero__title">우리 사이를 더 다정하게 알아가는 시간</h1>
        <p className="hub-hero__description">
          관계 진단부터 커플·가족 문답, 사주와 미니게임까지 하나씩 채워갈게요.
        </p>
      </header>

      <section className="content-grid">
        {CONTENT_CATALOG.map((content) => {
          const isActive = content.status === CONTENT_STATUS.ACTIVE;

          return (
            <article key={content.id} className={`content-card${isActive ? " content-card--active" : ""}`}>
              <div className="content-card__top">
                <span className="content-card__icon">{content.icon}</span>
                <span className="content-card__category">{content.category}</span>
              </div>
              <div>
                <h2 className="content-card__title">{content.title}</h2>
                <p className="content-card__description">{content.description}</p>
              </div>
              <button
                type="button"
                className={`content-card__button${isActive ? " content-card__button--active" : ""}`}
                onClick={() => onNavigate(content.route)}
              >
                {content.actionLabel}
              </button>
            </article>
          );
        })}
      </section>
    </div>
  );
}
