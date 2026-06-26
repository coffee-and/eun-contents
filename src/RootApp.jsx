import { useEffect, useState } from "react";
import RelationshipAnalyzer from "./App.jsx";
import { AppShell } from "./components/layout/AppShell.jsx";
import { getContentByRoute } from "./data/contentCatalog.js";
import { HomePage } from "./pages/HomePage.jsx";

function getRoute() {
  return window.location.hash.replace(/^#\/?/, "") || "home";
}

export default function RootApp() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const handleHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(nextRoute) {
    window.location.hash = nextRoute === "home" ? "/" : `/${nextRoute}`;
  }

  if (route === "relationship") {
    return (
      <div className="content-route theme-relationship">
        <div className="content-route__navigation">
          <button
            type="button"
            className="hub-back-button"
            onClick={() => navigate("home")}
          >
            콘텐츠 홈으로
          </button>
        </div>
        <RelationshipAnalyzer />
      </div>
    );
  }

  if (route !== "home") {
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
