/**
 * Status helpers for Conditional grants, mirroring the lifecycle rules in
 * IConditional grants.sol. The contract derives state on every read (loanState), so
 * the UI never recomputes it from timestamps.
 */

/**
 * Mirrors IConditional grants.GrantState — the on-chain `uint8` ordinals returned by
 * loanState(). Keep this in sync with that source.
 */
export enum GrantState {
  Offered = 0,
  Expired = 1,
  Cancelled = 2,
  Active = 3,
  Overdue = 4,
  PaidBack = 5,
  Completed = 6,
  Defaulted = 7,
}

export const GRANT_STATE_LABELS: Record<GrantState, string> = {
  [GrantState.Offered]: "Offered",
  [GrantState.Expired]: "Expired",
  [GrantState.Cancelled]: "Cancelled",
  [GrantState.Active]: "Active",
  [GrantState.Overdue]: "Overdue",
  [GrantState.PaidBack]: "Paid back",
  [GrantState.Completed]: "Completed",
  [GrantState.Defaulted]: "Defaulted",
};

export const GRANT_STATE_CHIP_CLASSES: Record<GrantState, string> = {
  [GrantState.Offered]: "border-primary-blue text-primary-blue",
  [GrantState.Expired]: "border-surface-grey text-surface-grey",
  [GrantState.Cancelled]: "border-surface-grey text-surface-grey",
  [GrantState.Active]: "border-primary-blue text-primary-blue",
  [GrantState.Overdue]: "border-system-red text-system-red",
  [GrantState.PaidBack]: "border-system-green text-system-green",
  [GrantState.Completed]: "border-system-green text-system-green",
  [GrantState.Defaulted]: "border-system-red text-system-red",
};

/**
 * Whether the grantee can still pay: accepted and advance + fee not fully paid.
 * In PaidBack only the fee is left, which they may pay for the full grant. A
 * Defaulted advance can still be paid back (only the grant is gone).
 */
export function canPayBack(state: GrantState, outstanding: bigint) {
  return (
    (state === GrantState.Active ||
      state === GrantState.Overdue ||
      state === GrantState.PaidBack ||
      state === GrantState.Defaulted) &&
    outstanding > BigInt(0)
  );
}

/**
 * Mirrors the contract's unlock amount: what must be paid in cash to unlock the
 * grant. The advance, plus any part of the fee the grant is too small to cover.
 */
export function unlockAmount(terms: {
  advance: bigint;
  grant: bigint;
  fee: bigint;
}) {
  return (
    terms.advance +
    (terms.fee > terms.grant ? terms.fee - terms.grant : BigInt(0))
  );
}

/** Payment progress in percent (0-100, two decimals) for an advance. */
export function paidBackPercent(paidBack: bigint, advance: bigint): number {
  if (advance === BigInt(0)) return 0;
  if (paidBack >= advance) return 100;
  return Number((paidBack * BigInt(10000)) / advance) / 100;
}
