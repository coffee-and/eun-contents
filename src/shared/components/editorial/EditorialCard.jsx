const CARD_VARIANTS = new Set([
  "default",
  "question",
  "selection",
  "result",
  "notice",
  "premium",
  "action",
]);

function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function EditorialCard({
  as: Component = "section",
  children,
  className = "",
  variant = "default",
  ...props
}) {
  const safeVariant = CARD_VARIANTS.has(variant) ? variant : "default";

  return (
    <Component
      className={joinClassNames([
        "editorial-card",
        `editorial-card--${safeVariant}`,
        className,
      ])}
      {...props}
    >
      {children}
    </Component>
  );
}
