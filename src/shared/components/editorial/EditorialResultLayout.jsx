function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function EditorialResultLayout({ children, className = "" }) {
  return (
    <div className={joinClassNames(["editorial-result-layout", className])}>
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

export function EditorialResultActions({ children, className = "" }) {
  return (
    <div className={joinClassNames(["editorial-result-actions", className])}>
      {children}
    </div>
  );
}
