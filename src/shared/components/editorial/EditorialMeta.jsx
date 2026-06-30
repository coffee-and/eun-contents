function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function EditorialMeta({
  align,
  as: Component = "div",
  children,
  className = "",
  ...props
}) {
  return (
    <Component
      className={joinClassNames([
        "editorial-meta",
        align ? `editorial-meta--${align}` : "",
        className,
      ])}
      {...props}
    >
      {children}
    </Component>
  );
}
