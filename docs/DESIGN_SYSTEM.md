# Editorial Foundation v1

Editorial Foundation v1 is the shared presentation layer for EUN CONTENTS feature pages. It keeps typography, spacing, card structure, label rhythm, button rhythm, metadata, state presentation, result layout, and motion consistent while each content feature owns its color palette.

Feature logic stays inside feature folders. Shared editorial components are presentational only.

## File Structure

```txt
src/shared/styles/editorial/
  editorial.css
  editorial.tokens.css
  editorial.typography.css
  editorial.layout.css
  editorial.components.css
  editorial.states.css
  editorial.result.css
  editorial.motion.css

src/shared/components/editorial/
  EditorialCard.jsx
  EditorialLabel.jsx
  EditorialMeta.jsx
  EditorialResultLayout.jsx
  EditorialState.jsx
```

`editorial.css` is the ordered entrypoint. It is imported once from `src/shared/styles/global.css`.

## Foundation Principles

- Shared styles define structure, scale, and interaction rhythm.
- Feature themes define source palette values and map them to semantic roles.
- Shared components do not own feature data, routing, scoring, persistence, payment, save, share, export, or print behavior.
- Feature components pass already calculated labels, counts, titles, and descriptions.
- Square corners are preserved with `border-radius: 0`.
- Pretendard is preserved through `--editorial-font-family: var(--font-sans)`.

## Typography Scale

- `--editorial-display-size`: large result or display title.
- `--editorial-page-title-size`: main feature page title.
- `--editorial-page-subtitle-size`: feature subtitle and page intro copy.
- `--editorial-section-title-size`: section headings.
- `--editorial-card-title-size`: compact card headings.
- `--editorial-question-title-size`: question prompts.
- `--editorial-body-large-size`: emphasized body copy.
- `--editorial-body-size`: standard body copy.
- `--editorial-body-small-size`: compact supporting copy.
- `--editorial-caption-size`: captions.
- `--editorial-label-size`: labels, badges, metadata.
- `--editorial-button-size`: button text.

Line-height and weight tokens:

- `--editorial-display-line-height`
- `--editorial-title-line-height`
- `--editorial-body-line-height`
- `--editorial-compact-line-height`
- `--editorial-title-weight`
- `--editorial-body-weight`
- `--editorial-label-weight`
- `--editorial-button-weight`
- `--editorial-label-letter-spacing`

Feature themes should not redefine typography unless the component has a documented visual exception.

## Spacing Scale

Primitive spacing:

- `--editorial-space-1`
- `--editorial-space-2`
- `--editorial-space-3`
- `--editorial-space-4`
- `--editorial-space-5`
- `--editorial-space-6`
- `--editorial-space-7`
- `--editorial-space-8`

Semantic spacing:

- `--editorial-page-inline-padding`
- `--editorial-page-block-padding`
- `--editorial-content-max-width`
- `--editorial-reading-max-width`
- `--editorial-hero-gap`
- `--editorial-section-gap`
- `--editorial-card-gap`
- `--editorial-field-gap`
- `--editorial-action-gap`
- `--editorial-label-gap`
- `--editorial-card-padding`
- `--editorial-card-padding-large`
- `--editorial-control-padding-inline`
- `--editorial-control-padding-block`

Use the reading width for result/report copy. Do not force every feature panel into the same fixed width.

## Color Role System

Source palette tokens live in feature theme files. Shared components consume semantic roles.

Shared roles:

- `--feature-bg`
- `--feature-bg-soft`
- `--feature-surface`
- `--feature-surface-muted`
- `--feature-surface-strong`
- `--feature-text`
- `--feature-text-soft`
- `--feature-text-muted`
- `--feature-text-inverse`
- `--feature-border`
- `--feature-border-strong`
- `--feature-primary`
- `--feature-primary-hover`
- `--feature-primary-soft`
- `--feature-accent`
- `--feature-accent-soft`
- `--feature-label-bg`
- `--feature-label-text`
- `--feature-label-muted-bg`
- `--feature-label-muted-text`
- `--feature-badge-bg`
- `--feature-badge-text`
- `--feature-card-bg`
- `--feature-card-border`
- `--feature-card-accent`
- `--feature-button-primary-bg`
- `--feature-button-primary-hover-bg`
- `--feature-button-primary-text`
- `--feature-button-secondary-bg`
- `--feature-button-secondary-hover-bg`
- `--feature-button-secondary-text`
- `--feature-button-disabled-bg`
- `--feature-button-disabled-text`
- `--feature-focus`
- `--feature-danger`
- `--feature-danger-soft`
- `--feature-success`
- `--feature-success-soft`

Relationship Analysis maps its rose and deep blue palette to these roles. Together Questions maps its forest, sage, clay, and warm surfaces to the same roles. The features share role names, not colors.

Do:

```css
color: var(--feature-primary);
font-size: var(--editorial-question-title-size);
```

Do not:

```css
color: #355070;
font-size: 1.37rem;
```

Only use a raw value for a documented feature exception.

## Label System

Use `EditorialLabel` for compact labels and badges.

Variants:

- `eyebrow`
- `section`
- `metadata`
- `badge`
- `muted`
- `premium`

Example:

```jsx
<EditorialLabel variant="eyebrow">RELATIONSHIP REPORT</EditorialLabel>
<EditorialLabel variant="section">START / 01</EditorialLabel>
<EditorialLabel variant="badge">ver. couple</EditorialLabel>
```

Labels own display rhythm, typography, line-height, letter spacing, square corners, and compact padding. Feature themes own colors through semantic roles.

## Card System

Use `EditorialCard` as a structural primitive when a feature needs a shared surface.

Variants:

- `default`
- `question`
- `selection`
- `result`
- `notice`
- `premium`
- `action`

Shared responsibilities:

- square corners
- padding
- border structure
- background role
- header/body/footer gaps
- optional focus-within presentation

Feature-specific responsibilities:

- palette and accent mapping
- selection-card theme variations
- result artwork and metrics
- capture/export wrappers
- completed-book visual identity
- premium visual identity

Do not turn `EditorialCard` into a data renderer.

## Button System

Keep `Button` as the single shared button component. It consumes editorial typography, spacing, motion, and semantic button roles.

Supported variants:

- `primary`
- `secondary`
- `ghost`

Supported presentation props:

- `fullWidth`
- `size`

Do not alter click behavior or disabled logic inside the shared button.

## Metadata System

Use `EditorialMeta` for compact contextual groups such as:

- question count
- version labels
- section labels
- result status
- content edition
- free or premium state labels

Example:

```jsx
<EditorialMeta>
  <EditorialLabel variant="badge">ver. couple</EditorialLabel>
  <span className="editorial-meta__text">Q 01 / 38</span>
</EditorialMeta>
```

The feature passes display values. The shared component only arranges them.

## Result Layout Primitives

Use result primitives for vertical rhythm and action placement:

- `EditorialResultLayout`
- `EditorialResultSection`
- `EditorialResultActions`

Shared result responsibilities:

- result page vertical rhythm
- overview-to-section spacing
- section stack rhythm
- action wrapping
- responsive stacking

Feature-specific responsibilities:

- analysis content
- score rendering
- result categories
- completed-book content
- premium content
- capture/export content
- save/share/print/PDF behavior

Do not create a single generic result renderer.

## Loading, Empty, Error, And Coming Soon

Use `EditorialState` or shared state classes for route loading, not-found, coming-soon, empty, error, and loading surfaces.

Variants:

- `loading`
- `empty`
- `error`
- `not-found`
- `coming-soon`

State components may receive an eyebrow, title, description, optional media, and optional action. Request logic, retry logic, routing decisions, and existing copy remain outside the shared component.

## Motion Rules

Motion tokens:

- `--editorial-motion-fast`
- `--editorial-motion-base`
- `--editorial-motion-slow`
- `--editorial-ease-standard`
- `--editorial-ease-emphasized`

Use motion for existing interaction feedback such as hover backgrounds, color changes, focus transitions, progress transitions, and lightweight expandable content.

Avoid decorative animation. Prefer background, color, opacity, and transform. Preserve `prefers-reduced-motion`.

## Theme Creation Guide

1. Add source palette tokens in the feature theme file.
2. Map palette tokens to `--feature-*` semantic roles.
3. Use shared typography, spacing, card, label, metadata, button, state, result, and motion primitives.
4. Keep feature-specific CSS focused on visual exceptions and unique feature states.
5. Document any intentional typography, spacing, card, or motion exception.

Template:

```css
.theme-new-content {
  --feature-bg: var(--new-content-bg);
  --feature-bg-soft: var(--new-content-bg-soft);
  --feature-surface: var(--new-content-surface);
  --feature-surface-muted: var(--new-content-surface-muted);

  --feature-text: var(--new-content-text);
  --feature-text-soft: var(--new-content-text-soft);
  --feature-text-muted: var(--new-content-text-muted);
  --feature-text-inverse: var(--new-content-text-inverse);

  --feature-border: var(--new-content-border);
  --feature-border-strong: var(--new-content-border-strong);

  --feature-primary: var(--new-content-primary);
  --feature-primary-hover: var(--new-content-primary-hover);
  --feature-primary-soft: var(--new-content-primary-soft);
  --feature-accent: var(--new-content-accent);
  --feature-accent-soft: var(--new-content-accent-soft);

  --feature-label-bg: var(--new-content-label-bg);
  --feature-label-text: var(--new-content-label-text);
  --feature-badge-bg: var(--new-content-badge-bg);
  --feature-badge-text: var(--new-content-badge-text);

  --feature-card-bg: var(--new-content-surface);
  --feature-card-border: var(--new-content-border);

  --feature-button-primary-bg: var(--new-content-primary);
  --feature-button-primary-hover-bg: var(--new-content-primary-hover);
  --feature-button-primary-text: var(--new-content-text-inverse);

  --feature-button-secondary-bg: var(--new-content-primary-soft);
  --feature-button-secondary-hover-bg: var(--new-content-accent-soft);
  --feature-button-secondary-text: var(--new-content-primary);

  --feature-button-disabled-bg: var(--new-content-surface-muted);
  --feature-button-disabled-text: var(--new-content-text-muted);

  --feature-focus: var(--new-content-accent);
}
```

A new theme should normally change these colors without redefining typography, spacing, card dimensions, label dimensions, button height, or motion.

## Current Feature Mapping

Relationship Analysis:

- source palette: `--relationship-*`
- role mapping: `src/features/relationship/styles/relationship.tokens.css`
- shared migration: question metadata, question card structure, result cards, result actions
- retained exceptions: result overview, premium report, capture/export surfaces, metric visuals

Together Questions:

- source palette: `--together-*`
- role mapping: `src/features/together-questions/styles/together-questions.tokens.css`
- shared migration: start panel, question book panel, question items, completed book card, export actions
- retained exceptions: six relationship selection themes, writing backgrounds, completed-book report identity

## Do And Do Not

Do:

- use `var(--feature-primary)` in reusable shared CSS
- use `var(--editorial-question-title-size)` for shared question titles
- keep feature logic in feature components
- keep save, share, export, print, payment, routing, scoring, and persistence behavior in feature code
- add a short comment for an intentional feature exception

Do not:

- add feature names or palette hex values to shared components
- move question data, result data, analysis logic, scoring, or persistence into shared presentation components
- redefine typography, spacing, card dimensions, button height, or motion in a theme without a documented reason
- import `editorial.css` inside feature apps
