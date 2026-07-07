import { formatBalance } from "@breadcoop/ui";

/**
 * Format a numeric amount as a USD string, e.g. `formatUsd(12.3)` → "$12.30".
 *
 * Part of issue #1 (abstract the BREAD token — show only USD balances). BREAD is
 * accounted 1:1 with USD across the app, so a BREAD amount can be shown directly
 * as USD. Centralizing the `$` + `formatBalance` pattern keeps every balance
 * surface consistent as we migrate them off BREAD-denominated labels.
 */
export const formatUsd = (amount: number, decimals = 2): string =>
  `$${formatBalance(amount, decimals)}`;
