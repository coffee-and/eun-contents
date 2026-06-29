import { Suspense, useEffect, useState } from "react";
import { AppShell } from "../shared/components/AppShell.jsx";
import { TextAction } from "../shared/components/TextAction.jsx";
import { HomePage } from "../pages/HomePage.jsx";
import {
  CONTENT_STATUS,
  getContentByRoute,
} from "./contentRegistry.jsx";
import { getCurrentRoute, ROUTES } from "./routes.js";

function RouteLoading() {
  return (
    <div className="theme-hub">
      <AppShell>
        <section className="route-state" aria-live="polite">
          <span>LOADING</span>
          <h1>콘텐츠를 불러오고 있어요</h1>
        </section>
      </AppShell>
    </div>
  );
}

function ComingSoon({ content, onNavigateHome }) {
  return (
    <div className="theme-hub">
      <AppShell>
        <div className="coming-soon">
          <TextAction className="hub-back-button" onClick={onNavigateHome}>
            ← 다른 콘텐츠 보기
          </TextAction>
          <section className="coming-soon__card">
            <img
              className="coming-soon__image"
              src={content.imageSrc}
              alt={content.imageAlt}
            />
            <div className="coming-soon__content">
              <span className="coming-soon__issue">COMING ISSUE</span>
              <span className="coming-soon__category">{content.category}</span>
              <h1>{content.title}</h1>
              <p>{content.description}</p>
              <strong>COMING SOON</strong>
            </div>
          </section>
        </div>
      </AppShell>
    </div>
  );
}

function NotFound({ onNavigateHome }) {
  return (
    <div className="theme-hub">
      <AppShell>
        <section className="route-state">
          <span>NOT FOUND</span>
          <h1>찾으시는 콘텐츠가 없어요</h1>
          <p>주소를 다시 확인하거나 다른 콘텐츠를 둘러봐 주세요.</p>
          <TextAction onClick={onNavigateHome}>← 다른 콘텐츠 보기</TextAction>
        </section>
      </AppShell>
    </div>
  );
}

export default function RootApp() {
  const [route, setRoute] = useState(getCurrentRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getCurrentRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(nextRoute) {
    window.location.hash = nextRoute === ROUTES.HOME ? "/" : `/${nextRoute}`;
  }

  if (route === ROUTES.HOME) {
    return (
      <div className="theme-hub">
        <AppShell>
          <HomePage onNavigate={navigate} />
        </AppShell>
      </div>
    );
  }

  const content = getContentByRoute(route);

  if (!content) {
    return <NotFound onNavigateHome={() => navigate(ROUTES.HOME)} />;
  }

  if (content.status === CONTENT_STATUS.COMING_SOON) {
    return (
      <ComingSoon
        content={content}
        onNavigateHome={() => navigate(ROUTES.HOME)}
      />
    );
  }

  const ContentComponent = content.component;

  if (!ContentComponent) {
    return <NotFound onNavigateHome={() => navigate(ROUTES.HOME)} />;
  }

  return (
    <div className={`content-route ${content.themeClass ?? ""}`.trim()}>
      <Suspense fallback={<RouteLoading />}>
        <ContentComponent onNavigateHome={() => navigate(ROUTES.HOME)} />
      </Suspense>
    </div>
  );
}
