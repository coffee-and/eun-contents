// Together Questions 초대 코드와 공유 링크를 URL에서 읽고 만듭니다.
export function getInviteCodeFromUrl() {
  const hashQuery = window.location.hash.split("?")[1] ?? "";
  const search = new URLSearchParams(window.location.search);
  const hashSearch = new URLSearchParams(hashQuery);
  return search.get("invite") ?? hashSearch.get("invite") ?? "";
}

export function buildInviteUrl(inviteCode) {
  const url = new URL(window.location.href);
  url.searchParams.delete("resultId");
  url.searchParams.delete("invite");
  url.hash = `/together-questions?invite=${encodeURIComponent(inviteCode)}`;
  return url.toString();
}
