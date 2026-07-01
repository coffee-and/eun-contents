export const RELATIONSHIP_MODE = Object.freeze({
  COUPLE: "couple",
  MARRIED: "married",
});

export const RELATIONSHIP_MODE_VALUES = Object.freeze(
  Object.values(RELATIONSHIP_MODE)
);

const LEGACY_MARRIED_MODE = "marriage";

export function isRelationshipMode(value) {
  return RELATIONSHIP_MODE_VALUES.includes(value);
}

export function normalizeRelationshipMode(value) {
  if (value === LEGACY_MARRIED_MODE) {
    return RELATIONSHIP_MODE.MARRIED;
  }

  return isRelationshipMode(value) ? value : null;
}
