/**
 * Pure status helpers for Collective Fund Circles, mirroring the proposal
 * lifecycle rules in ICollectiveFundCircles.sol.
 *
 * Deadlines are unix timestamps in seconds as bigint; compare them against
 * block time (useBlockTimestamp), never Date.now(), because local Anvil
 * warps time.
 */

/**
 * Mirrors ICollectiveFundCircles.ProposalState — the on-chain `uint8`
 * ordinals returned by proposalState(). Keep this in sync with that source.
 */
export enum ProposalState {
  Active = 0,
  Defeated = 1,
  Passed = 2,
  Executed = 3,
  Expired = 4,
}

export const PROPOSAL_STATE_LABELS: Record<ProposalState, string> = {
  [ProposalState.Active]: "Active",
  [ProposalState.Defeated]: "Defeated",
  [ProposalState.Passed]: "Passed",
  [ProposalState.Executed]: "Executed",
  [ProposalState.Expired]: "Expired",
};

/** When voting closes: createdAt + votingPeriod. */
export function proposalVotingDeadline({
  createdAt,
  votingPeriod,
}: {
  createdAt: bigint;
  votingPeriod: bigint;
}): bigint {
  return createdAt + votingPeriod;
}

/** When the execution window closes: createdAt + 2 * votingPeriod. */
export function proposalExecutionDeadline({
  createdAt,
  votingPeriod,
}: {
  createdAt: bigint;
  votingPeriod: bigint;
}): bigint {
  return createdAt + BigInt(2) * votingPeriod;
}

/** A member's redeemable payout for burning `shares` right now. */
export function previewSharesPayout({
  shares,
  poolBalance,
  totalShares,
}: {
  shares: bigint;
  poolBalance: bigint;
  totalShares: bigint;
}): bigint {
  if (totalShares === BigInt(0)) return BigInt(0);
  return (shares * poolBalance) / totalShares;
}
