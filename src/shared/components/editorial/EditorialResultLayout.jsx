function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function EditorialResultLayout({ children, className = "", ...props }) {
  return (
    <div
      className={joinClassNames(["editorial-result-layout", className])}
      {...props}
    >
      {children}
    </div>
  );
}

export function EditorialResultSection({
  as: Component = "section",
  children,
  className = "",
  ...props
}) {
  return (
    <Component
      className={joinClassNames(["editorial-result-section", className])}
      {...props}
    >
      {children}
    </Component>
  );
}

export function EditorialResultActions({ children, className = "", ...props }) {
  return (
    <div
      className={joinClassNames(["editorial-result-actions", className])}
      {...props}
    >
      {children}
    </div>
  );
}
