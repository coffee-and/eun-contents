export const ROUTES = {
  HOME: "home",
  RELATIONSHIP: "relationship",
  TOGETHER_QUESTIONS: "together-questions",
};

export function getResultId() {
  const searchResultId = new URLSearchParams(window.location.search).get(
    "resultId"
  );

  if (searchResultId) return searchResultId;

  const hashQuery = window.location.hash.split("?")[1];

  if (!hashQuery) return null;

  return new URLSearchParams(hashQuery).get("resultId");
}

export function getCurrentRoute() {
  const hashRoute = window.location.hash.replace(/^#\/?/, "").split("?")[0];

  if (hashRoute) return hashRoute;

  return getResultId() ? ROUTES.RELATIONSHIP : ROUTES.HOME;
}

export function buildResultUrl(resultId) {
  const url = new URL(window.location.href);
  url.searchParams.set("resultId", resultId);
  url.hash = `/${ROUTES.RELATIONSHIP}`;
  return url.toString();
}
