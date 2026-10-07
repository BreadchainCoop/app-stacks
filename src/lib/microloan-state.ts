/**
 * Status helpers for Microloans, mirroring the lifecycle rules in
 * IMicroloans.sol. The contract derives state on every read (loanState), so
 * the UI never recomputes it from timestamps.
 */

/**
 * Mirrors IMicroloans.LoanState — the on-chain `uint8` ordinals returned by
 * loanState(). Keep this in sync with that source.
 */
export enum LoanState {
  Offered = 0,
  Expired = 1,
  Cancelled = 2,
  Active = 3,
  Overdue = 4,
  Repaid = 5,
  Completed = 6,
  Defaulted = 7,
}

export const LOAN_STATE_LABELS: Record<LoanState, string> = {
  [LoanState.Offered]: "Offered",
  [LoanState.Expired]: "Expired",
  [LoanState.Cancelled]: "Cancelled",
  [LoanState.Active]: "Active",
  [LoanState.Overdue]: "Overdue",
  [LoanState.Repaid]: "Repaid",
  [LoanState.Completed]: "Completed",
  [LoanState.Defaulted]: "Defaulted",
};

export const LOAN_STATE_CHIP_CLASSES: Record<LoanState, string> = {
  [LoanState.Offered]: "border-primary-blue text-primary-blue",
  [LoanState.Expired]: "border-surface-grey text-surface-grey",
  [LoanState.Cancelled]: "border-surface-grey text-surface-grey",
  [LoanState.Active]: "border-primary-blue text-primary-blue",
  [LoanState.Overdue]: "border-system-red text-system-red",
  [LoanState.Repaid]: "border-system-green text-system-green",
  [LoanState.Completed]: "border-system-green text-system-green",
  [LoanState.Defaulted]: "border-system-red text-system-red",
};

/**
 * Whether the borrower can still repay: accepted and not fully repaid. A
 * Defaulted loan can still be repaid (only the grant is gone).
 */
export function isLoanRepayable(state: LoanState, outstanding: bigint) {
  return (
    (state === LoanState.Active ||
      state === LoanState.Overdue ||
      state === LoanState.Defaulted) &&
    outstanding > BigInt(0)
  );
}

/** Repayment progress in percent (0-100, two decimals) for a loan. */
export function loanRepaidPercent(repaid: bigint, disbursed: bigint): number {
  if (disbursed === BigInt(0)) return 0;
  if (repaid >= disbursed) return 100;
  return Number((repaid * BigInt(10000)) / disbursed) / 100;
}
