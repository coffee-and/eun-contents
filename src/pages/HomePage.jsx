import { CONTENT_CATALOG, CONTENT_STATUS } from "../data/contentCatalog.js";

const FEATURED_CONTENT_ID = "relationship";

function ContentAction({
  content,
  isActive,
  className = "content-card__link",
  onNavigate,
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => onNavigate(content.route)}
      disabled={!isActive}
    >
      {content.actionLabel}
    </button>
  );
}

function CategoryCard({ content, index, onNavigate }) {
  const isActive = content.status === CONTENT_STATUS.ACTIVE;
  const contentNumber = String(index + 2).padStart(2, "0");

  return (
    <article
      className={`category-card category-card--${content.id}${
        isActive ? " category-card--active" : " category-card--disabled"
      }`}
    >
      <div className="category-card__meta">
        <span className="content-card__number">{contentNumber}</span>
        <p className="category-card__category">{content.category}</p>
      </div>
      <h3 className="category-card__title">{content.title}</h3>
      <ContentAction content={content} isActive={isActive} onNavigate={onNavigate} />
    </article>
  );
}

export function HomePage({ onNavigate }) {
  const featuredContent =
    CONTENT_CATALOG.find((content) => content.id === FEATURED_CONTENT_ID) ??
    CONTENT_CATALOG.find((content) => content.status === CONTENT_STATUS.ACTIVE);
  const categoryContents = CONTENT_CATALOG.filter(
    (content) => content.id !== featuredContent?.id
  );
  const isFeaturedActive = featuredContent?.status === CONTENT_STATUS.ACTIVE;

  return (
    <div className="hub-page">
      <header className="hub-hero">
        <div className="hub-hero__copy">
          <p className="hub-hero__tagline">오늘도, 당신의 순간을 켜세요.</p>
          <h1 className="hub-hero__title">moment ON</h1>
        </div>
      </header>

      <section className="featured-content" aria-label="추천 콘텐츠">
        {featuredContent ? (
          <article className="featured-card">
            <div className="home-mark" />
            <div className="featured-card__body">
              <div className="featured-card__meta">
                <span className="content-card__number">01</span>
                <p className="content-card__category">{featuredContent.category}</p>
              </div>
              <h2 className="featured-card__title">{featuredContent.title}</h2>
              <ContentAction
                content={featuredContent}
                isActive={isFeaturedActive}
                className="featured-card__button"
                onNavigate={onNavigate}
              />
            </div>
          </article>
        ) : null}
      </section>

      <section className="content-section" aria-label="콘텐츠 카테고리">
        <div className="content-section__head">
          <span>CONTENTS INDEX</span>
        </div>

        <div className="category-grid">
          {categoryContents.map((content, index) => (
            <CategoryCard
              key={content.id}
              content={content}
              index={index}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
