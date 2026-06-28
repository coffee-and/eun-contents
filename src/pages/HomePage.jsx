import { CONTENT_CATALOG, CONTENT_STATUS } from "../data/contentCatalog.js";

export function HomePage({ onNavigate }) {
  return (
    <div className="hub-page">
      <header className="hub-hero">
        <p className="hub-hero__tagline">[: 오늘의 나와 우리]</p>
        <h1 className="hub-hero__title">moment ON</h1>
      </header>

      <section className="content-grid" aria-label="콘텐츠 목록">
        {CONTENT_CATALOG.map((content) => {
          const isActive = content.status === CONTENT_STATUS.ACTIVE;

          return (
            <article
              key={content.id}
              className={`content-card content-card--${content.layout}${
                isActive ? " content-card--active" : ""
              }`}
            >
              <div className="content-card__media">
                <img
                  className="content-card__image"
                  src={content.imageSrc}
                  alt={content.imageAlt}
                  loading="lazy"
                />
              </div>

              <div className="content-card__body">
                <p className="content-card__category">{content.category}</p>
                <h2 className="content-card__title">{content.title}</h2>
                <p className="content-card__description">{content.description}</p>

                <button
                  type="button"
                  className="content-card__link"
                  onClick={() => onNavigate(content.route)}
                  disabled={!isActive}
                >
                  {content.actionLabel}
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
