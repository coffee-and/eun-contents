import { EditorialLabel } from "./EditorialLabel.jsx";

const STATE_VARIANTS = new Set(["loading", "empty", "error", "not-found", "coming-soon"]);

function joinClassNames(values) {
  return values.filter(Boolean).join(" ");
}

export function EditorialState({
  action,
  className = "",
  description,
  eyebrow,
  media,
  title,
  variant = "empty",
  ...props
}) {
  const safeVariant = STATE_VARIANTS.has(variant) ? variant : "empty";

  return (
    <section
      className={joinClassNames([
        "editorial-state",
        `editorial-state--${safeVariant}`,
        className,
      ])}
      aria-live={safeVariant === "loading" ? "polite" : undefined}
      {...props}
    >
      {media ? <div className="editorial-state__media">{media}</div> : null}
      {eyebrow ? <EditorialLabel variant="metadata">{eyebrow}</EditorialLabel> : null}
      <h1 className="editorial-state__title">{title}</h1>
      {description ? (
        <p className="editorial-state__description">{description}</p>
      ) : null}
      {action ? <div className="editorial-actions">{action}</div> : null}
    </section>
  );
}
