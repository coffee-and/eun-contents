// 텍스트형 액션 버튼 UI를 관리합니다.
function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function TextAction({ children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      className={joinClassNames(["text-action", className])}
      {...props}
    >
      {children}
    </button>
  );
}
