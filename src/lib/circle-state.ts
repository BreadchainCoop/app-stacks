/**
 * Canonical circle/round lifecycle enums, mirroring the Saving Circles contract
 * source at contracts/lib/saving-circles/src/interfaces/ISavingCircles.sol.
 *
 * Values are the on-chain `uint8` ordinals returned by the viewer's
 * `getCirclesState`. Keep this in sync with that source.
 */
export enum CircleState {
  NotStarted = 0,
  Active = 1,
  DepositInProgress = 2,
  DepositComplete = 3,
  Expired = 4,
  Decommissioned = 5,
  MissedDeposit = 6,
}

export enum RoundState {
  NotStarted = 0,
  DepositInProgress = 1,
  Claimable = 2,
  Claimed = 3,
}
