import { CONTENT_CATALOG, CONTENT_STATUS } from "../data/contentCatalog.js";

export function HomePage({ onNavigate }) {
  const [featuredContent, ...secondaryContents] = CONTENT_CATALOG;

  function renderContentCard(content) {
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
  }

  return (
    <div className="hub-page">
      <header className="hub-hero">
        <p className="hub-hero__tagline">[: 오늘의 나와 우리]</p>
        <h1 className="hub-hero__title">moment ON</h1>
        <p className="hub-hero__lede">
          A quiet editorial collection for relationships, reflection, and small moments worth keeping.
        </p>
      </header>

      <section className="content-grid" aria-label="콘텐츠 목록">
        <div className="content-section content-section--feature">
          <div className="content-section__head">
            <span>Featured Collection</span>
            <p>오늘의 관계와 마음을 천천히 읽는 첫 번째 큐레이션</p>
          </div>
          {featuredContent ? renderContentCard(featuredContent) : null}
        </div>

        <div className="content-section content-section--secondary">
          <div className="content-section__head">
            <span>Editor's Selection</span>
            <p>대화, 자기 이해, 짧은 휴식으로 이어지는 조용한 선택지</p>
          </div>
          <div className="content-section__grid">
            {secondaryContents.map(renderContentCard)}
          </div>
        </div>
      </section>
    </div>
  );
}
