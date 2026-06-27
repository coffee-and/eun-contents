const STORAGE_KEY = "eun-contents:together-questions:v1";

export function createJournal() {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: String(Date.now()),
    relationshipType: null,
    mood: null,
    participants: {
      firstName: "",
      secondName: "",
      firstBirthday: "",
      secondBirthday: "",
      nickname: "",
      anniversary: "",
      motto: "",
      importantValue: "",
    },
    answers: {},
    createdAt: now,
    updatedAt: now,
  };
}

export function loadJournal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createJournal();
    const parsed = JSON.parse(raw);
    return parsed && parsed.version === 1 ? parsed : createJournal();
  } catch {
    return createJournal();
  }
}

export function saveJournal(journal) {
  const next = { ...journal, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearJournal() {
  localStorage.removeItem(STORAGE_KEY);
}
