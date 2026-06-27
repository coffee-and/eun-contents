const STORAGE_KEY = "eun-contents:together-question-records:v1";

export function loadQuestionRecords() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

export function saveQuestionRecord(record) {
  const records = loadQuestionRecords();
  const nextRecords = [record, ...records.filter((item) => item.id !== record.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

export function deleteQuestionRecord(recordId) {
  const nextRecords = loadQuestionRecords().filter((item) => item.id !== recordId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

export function createQuestionRecord() {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: `tq-${Date.now()}`,
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
