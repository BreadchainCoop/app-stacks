/**
 * Pure status helpers for Accumulating Saving Circle (ASCA) funds, mirroring
 * the lifecycle rules in IAccumulatingSavingCircles.sol.
 *
 * `now` must be a unix timestamp in seconds derived from block time
 * (useBlockTimestamp), never Date.now(), because local Anvil warps time.
 */

/** Basis-points denominator used by the contract (100% = 10_000 bps). */
export const BPS_DENOMINATOR = 10_000;

export type AscaFundStatus = "active" | "deactivated";

export function getAscaFundStatus(fund: {
  deactivated: boolean;
}): AscaFundStatus {
  return fund.deactivated ? "deactivated" : "active";
}

export type AscaLoanStatus = "none" | "open" | "overdue";

/**
 * Loan lifecycle: principal 0 means no open loan; a loan becomes overdue
 * (and liquidatable) once now >= dueDate.
 */
export function getAscaLoanStatus({
  principal,
  dueDate,
  now,
}: {
  principal: bigint;
  dueDate: bigint;
  now: bigint;
}): AscaLoanStatus {
  if (principal === BigInt(0)) return "none";
  return now >= dueDate ? "overdue" : "open";
}

export const ASCA_LOAN_STATUS_LABELS: Record<AscaLoanStatus, string> = {
  none: "No open loan",
  open: "Loan open",
  overdue: "Loan overdue",
};

/**
 * Formats a basis-points value as a percentage string for display, e.g.
 * 2550n -> "25.5", 10000n -> "100". Safe because on-chain bps <= 10_000.
 */
export function formatBps(bps: bigint | number): string {
  return String(Number(bps) / 100);
}

/** Converts a user-entered percentage (e.g. 25.5) into basis points (2550). */
export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}
