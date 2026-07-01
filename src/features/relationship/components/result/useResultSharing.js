import { useEffect, useRef, useState } from "react";
import { buildResultUrl, saveResult } from "../../utils/resultStorage.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function useResultSharing({
  analysis,
  answers,
  relationshipMode,
  shareConfig,
  modeLabel,
  isSavedResult,
  savedResultId,
}) {
  const saveRequestRef = useRef(null);
  const [savedResultUrl, setSavedResultUrl] = useState(() =>
    isSavedResult && savedResultId ? buildResultUrl(savedResultId) : ""
  );
  const [serverResultId, setServerResultId] = useState(() =>
    isSavedResult && savedResultId ? savedResultId : ""
  );
  const [serverSaveStatus, setServerSaveStatus] = useState("idle");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && Boolean(navigator.share);

  useEffect(() => {
    if (!isShareModalOpen) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsShareModalOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [isShareModalOpen]);

  async function prepareSavedResultUrl() {
    if (savedResultUrl) return savedResultUrl;
    if (saveRequestRef.current) return saveRequestRef.current;

    saveRequestRef.current = saveAndBuildResultUrl();

    try {
      return await saveRequestRef.current;
    } finally {
      saveRequestRef.current = null;
    }
  }

  async function saveAndBuildResultUrl() {
    let remoteResultId = serverResultId;

    if (!remoteResultId) {
      setServerSaveStatus("saving");

      try {
        const response = await fetch(`${API_BASE_URL}/api/results`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            mode: relationshipMode ?? "relationship",
            answers: {
              items: answers,
            },
            scores: {
              finalValue: analysis.finalValue,
              conflictRisk: analysis.conflictRisk,
              categoryScores: analysis.categoryScores,
            },
            analysis,
            resultType: analysis.relationshipLevel.title,
          }),
        });
        const payload = await response.json();

        if (!response.ok || !payload.ok || !payload.result?.id) {
          throw new Error("Result server save failed.");
        }

        remoteResultId = payload.result.id;
        setServerResultId(remoteResultId);
        setServerSaveStatus("saved");
      } catch (error) {
        setServerSaveStatus("error");
        console.error("Failed to save result on server.", error);
        window.alert("서버 저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
        return;
      }
    }

    saveResult({ analysis, answers, relationshipMode });
    const nextUrl = buildResultUrl(remoteResultId);

    setSavedResultUrl(nextUrl);
    return nextUrl;
  }

  async function handleOpenShareModal() {
    if (serverSaveStatus === "saving") return;

    const nextUrl = savedResultUrl || (await prepareSavedResultUrl());

    if (!nextUrl) return;

    setIsShareModalOpen(true);
  }

  async function handleNativeShare() {
    if (!canNativeShare) return;

    try {
      await navigator.share({
        title: shareConfig.title,
        text: `내 ${modeLabel ?? "관계"} 테스트 결과: ${analysis.relationshipLevel.title}`,
        url: savedResultUrl,
      });
    } catch (error) {
      if (error.name === "AbortError") return;

      console.error("Failed to share result.", error);
    }
  }

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(savedResultUrl);
      window.alert("결과 링크를 클립보드에 복사했어요.");
      setIsShareModalOpen(false);
    } catch (error) {
      window.alert("링크 복사에 실패했어요. 다시 시도해 주세요.");
    }
  }

  function handleShareModalBackdrop() {
    setIsShareModalOpen(false);
  }

  return {
    savedResultUrl,
    serverSaveStatus,
    isShareModalOpen,
    setIsShareModalOpen,
    canNativeShare,
    handleOpenShareModal,
    handleNativeShare,
    handleCopyShareLink,
    handleShareModalBackdrop,
  };
}
