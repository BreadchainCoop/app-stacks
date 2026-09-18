/**
 * Pure status helpers for Goal Saving Circles, mirroring the lifecycle rules
 * in IGoalSavingCircles.sol.
 *
 * `now` must be a unix timestamp in seconds derived from block time
 * (useBlockTimestamp), never Date.now(), because local Anvil warps time.
 */

/**
 * Mirrors IGoalSavingCircles.GoalState — the on-chain `uint8` ordinals
 * returned by goalState(). Keep this in sync with that source.
 */
export enum GoalState {
  Funding = 0,
  Funded = 1,
  Failed = 2,
  Cancelled = 3,
  Released = 4,
}

export const GOAL_STATE_LABELS: Record<GoalState, string> = {
  [GoalState.Funding]: "Funding",
  [GoalState.Funded]: "Funded",
  [GoalState.Failed]: "Failed",
  [GoalState.Cancelled]: "Cancelled",
  [GoalState.Released]: "Released",
};

/**
 * Whether the goal still accepts deposits and new members: Funding or Funded,
 * strictly before the deadline (the contract's GoalNotOpen rule).
 */
export function isGoalOpen({
  state,
  deadline,
  now,
}: {
  state: GoalState;
  deadline: bigint;
  now: bigint;
}): boolean {
  return (
    (state === GoalState.Funding || state === GoalState.Funded) &&
    now < deadline
  );
}

/**
 * Whether members can reclaim their contributions: Failed, Cancelled, or
 * Funded with no beneficiary set (the contract's NotWithdrawable rule).
 */
export function isGoalWithdrawable({
  state,
  hasBeneficiary,
}: {
  state: GoalState;
  hasBeneficiary: boolean;
}): boolean {
  if (state === GoalState.Failed || state === GoalState.Cancelled) return true;
  return state === GoalState.Funded && !hasBeneficiary;
}

/**
 * Whether the pot can be released to the beneficiary: Funded with a
 * beneficiary set. Release is permissionless and has no time limit.
 */
export function isGoalReleasable({
  state,
  hasBeneficiary,
}: {
  state: GoalState;
  hasBeneficiary: boolean;
}): boolean {
  return state === GoalState.Funded && hasBeneficiary;
}
