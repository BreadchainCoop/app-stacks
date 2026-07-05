export const ALIAS_MIN_LENGTH = 3;
export const ALIAS_MAX_LENGTH = 20;

// Starts with a letter; letters, digits and underscores only (ASCII, so no
// homoglyph impersonation). Length is checked separately for better messages.
const ALIAS_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

// Impersonation-sensitive names. Aliases don't map to routes in this app, so
// the list only needs to cover authority/brand confusion.
const RESERVED_ALIASES = new Set([
  "admin",
  "administrator",
  "root",
  "support",
  "help",
  "api",
  "www",
  "settings",
  "login",
  "signup",
  "system",
  "moderator",
  "mod",
  "owner",
  "staff",
  "team",
  "official",
  "bread",
  "breadchain",
  "stacks",
]);

/**
 * Validates a display alias. Returns an error message, or null when valid.
 * Mirrors the database constraints (format check + reserved list); uniqueness
 * is enforced only by the case-insensitive unique index in Postgres.
 */
export function validateAlias(alias: string): string | null {
  if (alias.length < ALIAS_MIN_LENGTH) {
    return `Use at least ${ALIAS_MIN_LENGTH} characters`;
  }

  if (alias.length > ALIAS_MAX_LENGTH) {
    return `Use at most ${ALIAS_MAX_LENGTH} characters`;
  }

  if (!ALIAS_PATTERN.test(alias)) {
    return "Start with a letter and use only letters, numbers and underscores";
  }

  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    return "This alias is reserved";
  }

  return null;
}
