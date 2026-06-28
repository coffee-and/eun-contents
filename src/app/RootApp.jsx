import { useEffect, useState } from "react";
import RelationshipAnalyzer from "../features/relationship/RelationshipApp.jsx";
import TogetherQuestionsApp from "../features/together-questions/TogetherQuestionsApp.jsx";
import {
  clearDraft as clearTogetherQuestionsDraft,
  clearSavedResult as clearTogetherQuestionsResult,
} from "../features/together-questions/services/draftStorage.js";
import { AppShell } from "../shared/components/AppShell.jsx";
import { TextAction } from "../shared/components/TextAction.jsx";
import { getContentByRoute } from "../data/contentCatalog.js";
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
    if (nextRoute === ROUTES.TOGETHER_QUESTIONS) {
      clearTogetherQuestionsDraft();
      clearTogetherQuestionsResult();
    }

    window.location.hash = nextRoute === ROUTES.HOME ? "/" : `/${nextRoute}`;
  }

  if (route === ROUTES.RELATIONSHIP) {
    return (
      <div className="content-route theme-relationship">
        <RelationshipAnalyzer onNavigateHome={() => navigate(ROUTES.HOME)} />
      </div>
    );
  }

  if (route === ROUTES.TOGETHER_QUESTIONS) {
    return <TogetherQuestionsApp onNavigateHome={() => navigate(ROUTES.HOME)} />;
  }

  if (route !== ROUTES.HOME) {
    const content = getContentByRoute(route);

    return (
      <div className="theme-hub">
        <AppShell>
          <div className="coming-soon">
            <TextAction
              className="hub-back-button"
              onClick={() => navigate(ROUTES.HOME)}
            >
              ← 다른 콘텐츠 보기
            </TextAction>
            <section className="coming-soon__card">
              <img
                className="coming-soon__icon"
                src={content?.iconSrc ?? "/eun-icon-v3.svg"}
                alt={content?.iconAlt ?? "콘텐츠 아이콘"}
              />
              <span className="coming-soon__category">
                {content?.category ?? "새 콘텐츠"}
              </span>
              <h1>{content?.title ?? "준비 중인 콘텐츠"}</h1>
              <p>{content?.description ?? "새로운 콘텐츠를 준비하고 있어요."}</p>
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
