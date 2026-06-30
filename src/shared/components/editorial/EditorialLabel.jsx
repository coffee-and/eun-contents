const LABEL_VARIANTS = new Set([
  "eyebrow",
  "section",
  "metadata",
  "badge",
  "muted",
  "premium",
]);

function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function EditorialLabel({
  as: Component = "span",
  children,
  className = "",
  variant = "eyebrow",
  ...props
}) {
  const safeVariant = LABEL_VARIANTS.has(variant) ? variant : "eyebrow";

  return (
    <Component
      className={joinClassNames([
        "editorial-label",
        `editorial-label--${safeVariant}`,
        className,
      ])}
      {...props}
    >
      {children}
    </Component>
  );
}
