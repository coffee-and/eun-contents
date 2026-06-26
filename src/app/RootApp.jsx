import { useEffect, useState } from "react";
import RelationshipAnalyzer from "../features/relationship/RelationshipApp.jsx";
import { AppShell } from "../shared/components/AppShell.jsx";
import { getContentByRoute } from "./contentCatalog.js";
import { HomePage } from "../pages/HomePage.jsx";
import { getCurrentRoute, ROUTES } from "./routes.js";

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

  if (route === ROUTES.RELATIONSHIP) {
    return (
      <div className="content-route theme-relationship">
        <RelationshipAnalyzer onNavigateHome={() => navigate("home")} />
      </div>
    );
  }

  if (route !== ROUTES.HOME) {
    const content = getContentByRoute(route);

    return (
      <div className="theme-hub">
        <AppShell>
          <div className="coming-soon">
            <button
              type="button"
              className="hub-back-button"
              onClick={() => navigate("home")}
            >
              ← 콘텐츠 홈
            </button>
            <section className="coming-soon__card">
              <span className="coming-soon__icon">{content?.icon ?? "✦"}</span>
              <span className="coming-soon__category">
                {content?.category ?? "새 콘텐츠"}
              </span>
              <h1>{content?.title ?? "준비 중인 콘텐츠"}</h1>
              <p>
                {content?.description ?? "새로운 콘텐츠를 준비하고 있어요."}
              </p>
              <strong>COMING SOON</strong>
            </section>
          </div>
        </AppShell>
      </div>
    );
  }

  return (
    <div className="theme-hub">
      <AppShell>
        <HomePage onNavigate={navigate} />
      </AppShell>
    </div>
  );
}
