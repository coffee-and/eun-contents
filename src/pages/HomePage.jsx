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
  const issueNumber = String(index + 2).padStart(2, "0");

  return (
    <article
      className={`category-card category-card--${content.id}${
        isActive ? " category-card--active" : " category-card--disabled"
      }`}
    >
      <div className="category-card__meta">
        <span className="category-card__number">{issueNumber}</span>
        <p className="category-card__category">{content.category}</p>
      </div>
      <h3 className="category-card__title">{content.title}</h3>
      <p className="category-card__description">{content.description}</p>
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
        <p className="hub-hero__issue">DIGITAL EDITORIAL / MOMENT 01</p>
        <h1 className="hub-hero__title">moment ON</h1>
        <div className="hub-hero__footer">
          <p className="hub-hero__tagline">오늘도, 당신의 순간을 켜세요.</p>
          <p className="hub-hero__lede">
            관계, 문답, 감정 기록을 가볍게 시작하고 나답게 남기는 콘텐츠 플랫폼
          </p>
        </div>
      </header>

      <section className="featured-content" aria-label="추천 콘텐츠">
        {featuredContent ? (
          <article className="featured-card">
            <div className="featured-card__body">
              <p className="featured-card__issue">FEATURE / 01</p>
              <p className="content-card__category">{featuredContent.category}</p>
              <h2 className="featured-card__title">{featuredContent.title}</h2>
              <p className="featured-card__description">
                {featuredContent.description}
              </p>
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
          <p>지금 열려 있는 콘텐츠와 준비 중인 콘텐츠를 한눈에 볼 수 있어요.</p>
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
