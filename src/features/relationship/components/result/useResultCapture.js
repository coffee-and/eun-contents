import html2canvas from "html2canvas";

export function useResultCapture({ captureRef, isPremium, fileName }) {
  async function handleCapture() {
    const node = captureRef.current;

    if (!node) return;

    const shouldIncludePremium =
      isPremium &&
      window.confirm("프리미엄 리포트 내용도 결과 이미지에 포함할까요?");

    node.classList.add("capture-export--saving");

    if (isPremium && !shouldIncludePremium) {
      node.classList.add("capture-export--hide-premium");
    }

    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    try {
      const canvas = await html2canvas(node, {
        backgroundColor: "#f7eef3",
        scale: 2,
        useCORS: true,
        scrollY: -window.scrollY,
      });

      const link = document.createElement("a");
      link.download = fileName;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      node.classList.remove("capture-export--saving");
      node.classList.remove("capture-export--hide-premium");
    }
  }

  return { handleCapture };
}
