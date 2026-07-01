// 공통 버튼 UI를 관리합니다.
function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  children,
  className = "",
  fullWidth = false,
  size,
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      type={type}
      className={joinClassNames([
        "button",
        "editorial-button",
        `button--${variant}`,
        size ? `button--${size}` : "",
        fullWidth ? "button--full" : "",
        className,
      ])}
      {...props}
    >
      {children}
    </button>
  );
}
