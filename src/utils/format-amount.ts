/** Amounts at or above this are rendered with a compact unit (10.5K, 1.25M). */
const COMPACT_THRESHOLD = 10_000;

// Building an Intl.NumberFormat is far more expensive than formatting with one,
// so instances are created once per (notation, decimals) pair and reused.
const formatters = new Map<string, Intl.NumberFormat>();

function getFormatter(compact: boolean, decimals: number) {
  const key = `${compact ? "c" : "e"}${decimals}`;
  let formatter = formatters.get(key);

  if (!formatter) {
    formatter = new Intl.NumberFormat(
      "en-US",
      compact
        ? {
            notation: "compact",
            compactDisplay: "short",
            maximumFractionDigits: decimals,
          }
        : {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
            minimumIntegerDigits: 1,
            useGrouping: true,
          }
    );
    formatters.set(key, formatter);
  }

  return formatter;
}

/**
 * Formats a number in full: exact and grouped, always ("50,000.00").
 *
 * The default for amounts a user reads, reviews or acts on — stack details,
 * modals, transaction buttons.
 *
 * Non-finite input (NaN from an empty form field, Infinity from a division)
 * formats as zero.
 */
export function formatAmount(value: number, decimals = 2): string {
  return getFormatter(false, decimals).format(
    Number.isFinite(value) ? value : 0
  );
}

/**
 * Formats a number compactly once it reaches 10K ("50k", "1.25m"), and exactly
 * below that ("1,250.00").
 *
 * For space-constrained summaries only — stack cards and account totals. Use
 * {@link formatAmount} anywhere the exact figure matters.
 */
export function millify(value: number, decimals = 2): string {
  if (!Number.isFinite(value) || Math.abs(value) < COMPACT_THRESHOLD)
    return formatAmount(value, decimals);

  // Intl emits an uppercase unit ("50K"); the design calls for "50k".
  return getFormatter(true, decimals).format(value).toLowerCase();
}
