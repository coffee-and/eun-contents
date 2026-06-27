const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error ?? "요청을 처리하지 못했어요.");
  }

  return payload;
}

export function createQuestionSession({ displayName, relationshipType, questionPackId }) {
  return request("/api/question-sessions", {
    method: "POST",
    body: JSON.stringify({ displayName, relationshipType, questionPackId }),
  });
}

export function loadQuestionSession(inviteCode, participantToken = "") {
  const query = participantToken
    ? `?token=${encodeURIComponent(participantToken)}`
    : "";

  return request(`/api/question-sessions/${encodeURIComponent(inviteCode)}${query}`);
}

export function joinQuestionSession(inviteCode, displayName) {
  return request(`/api/question-sessions/${encodeURIComponent(inviteCode)}/join`, {
    method: "POST",
    body: JSON.stringify({ displayName }),
  });
}

export function saveQuestionAnswers(inviteCode, { participantToken, answers, submit = false }) {
  return request(`/api/question-sessions/${encodeURIComponent(inviteCode)}/answers`, {
    method: "PATCH",
    body: JSON.stringify({ participantToken, answers, submit }),
  });
}

export function deleteQuestionSession(inviteCode, participantToken) {
  return request(`/api/question-sessions/${encodeURIComponent(inviteCode)}`, {
    method: "DELETE",
    body: JSON.stringify({ participantToken }),
  });
}
