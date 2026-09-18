/**
 * Human-readable messages for every custom error defined in the
 * SavingCircles contract ABI.
 *
 * Used by parseContractError as a full-coverage fallback so that any
 * error the contract can throw produces a meaningful UI message, even
 * if it isn't listed in an operation-specific subset below.
 */
export const SAVING_CIRCLES_ERRORS: Record<string, string> = {
  // ── Membership ────────────────────────────────────────────────────
  NotMember: "You are not a member of this circle.",
  NotOwner: "Only the circle owner can perform this action.",
  AlreadyMember: "This address is already a member.",
  InvalidMemberAddress: "One or more member addresses are invalid.",
  InvalidMemberCount: "The number of members is invalid.",

  // ── Circle lifecycle ──────────────────────────────────────────────
  NotActive: "This circle is not active.",
  AlreadyActive: "This circle is already active.",
  NotCommissioned: "This circle has not been commissioned yet.",
  NotDecommissionable: "This stack cannot be retired yet.",
  InvalidCircle: "The circle is invalid.",
  AlreadyExists: "A circle with this ID already exists.",
  CircleExpired: "This circle has expired.",
  InvalidCircleStartTime: "The circle start time is invalid.",
  InvalidCurrentIndex: "The circle index is invalid.",

  // ── Deposits & withdrawals ────────────────────────────────────────
  NotWithdrawable: "It's not your turn to claim yet.",
  AlreadyDeposited: "You have already deposited for this round.",
  ExceedsDepositAmount: "Amount exceeds the required deposit.",
  DepositBeforeCircleStart: "The circle hasn't started yet.",
  DepositWindowClosed: "The deposit window has closed.",
  CircleTimedOut: "The deposit window for this round has closed.",
  InvalidDeposit: "The deposit is invalid.",
  InvalidDepositAmount: "The deposit amount is invalid.",
  InvalidDepositInterval: "The deposit interval is invalid.",
  TransferFailed: "Token transfer failed — check your balance.",

  // ── Creation / configuration ──────────────────────────────────────
  TokenNotAllowed: "This token is not allowed for savings circles.",
  InvalidOwner: "Invalid owner address.",

  // ── Invite / signature ────────────────────────────────────────────
  InviteAlreadyUsed: "This invite has already been used.",
  InvalidSigner: "The invite signature is invalid.",

  // ── OpenZeppelin / low-level ──────────────────────────────────────
  // Unlikely to be user-facing, but covered so nothing slips through.
  InvalidInitialization: "Contract initialisation error.",
  NotInitializing: "Contract is not in an initialisation state.",
  ReentrancyGuardReentrantCall: "Reentrant call detected — please try again.",
  OwnableInvalidOwner: "Invalid owner address.",
  OwnableUnauthorizedAccount:
    "Your account is not authorised to perform this action.",
  ECDSAInvalidSignature: "Invalid cryptographic signature.",
  ECDSAInvalidSignatureLength: "Invalid signature length.",
  ECDSAInvalidSignatureS: "Invalid signature parameter.",
};

/**
 * Human-readable messages for every custom error in the
 * GoalSavingCircles contract ABI.
 */
export const GOAL_SAVINGS_ERRORS: Record<string, string> = {
  // ── Membership / invites ──────────────────────────────────────────
  NotMember: "You are not a member of this goal.",
  AlreadyMember: "This address is already a member of this goal.",
  InvalidMemberAddress: "One of these addresses is invalid.",
  NotOwner: "Only the goal organizer can perform this action.",
  InvalidSigner: "The invite signature is invalid.",
  InviteAlreadyUsed: "This invite has already been used.",

  // ── Lifecycle / configuration ─────────────────────────────────────
  GoalNotFound: "This goal does not exist.",
  GoalNotOpen: "This goal is no longer accepting deposits or members.",
  InvalidGoalAmount: "The goal amount must be greater than zero.",
  InvalidDeadline: "The deadline must be in the future.",
  InvalidBeneficiary:
    "The beneficiary can't be the goal contract or the goal token.",
  TokenNotAllowed: "This token is not allowed for goals.",

  // ── Deposits & withdrawals ────────────────────────────────────────
  InvalidDeposit: "The deposit amount must be greater than zero.",
  NotWithdrawable: "Contributions are still locked — you can't withdraw yet.",
  NothingToWithdraw: "You have no contribution to withdraw.",
  NotReleasable: "The pot can't be released yet.",
  NotCancellable: "This goal can only be cancelled while it's still funding.",

  // ── OpenZeppelin / low-level ──────────────────────────────────────
  InvalidInitialization: "Contract initialisation error.",
  NotInitializing: "Contract is not in an initialisation state.",
  ReentrancyGuardReentrantCall: "Reentrant call detected — please try again.",
  OwnableInvalidOwner: "Invalid owner address.",
  OwnableUnauthorizedAccount:
    "Your account is not authorised to perform this action.",
  ECDSAInvalidSignature: "Invalid cryptographic signature.",
  ECDSAInvalidSignatureLength: "Invalid signature length.",
  ECDSAInvalidSignatureS: "Invalid signature parameter.",
  SafeERC20FailedOperation: "Token transfer failed — check your balance.",
};

/**
 * Human-readable messages for every custom error in the
 * CollectiveFundCircles contract ABI.

// ── Operation-scoped subsets ────────────────────────────────────────────────
// Components import these instead of defining their own local maps, so every
// error message lives in one place.

/** Errors that can surface during the deposit flow. */
export const DEPOSIT_ERRORS: Record<string, string> = pick([
  "NotMember",
  "NotActive",
  "CircleExpired",
  "CircleTimedOut",
  "DepositWindowClosed",
  "ExceedsDepositAmount",
  "DepositBeforeCircleStart",
  "AlreadyDeposited",
  "InvalidDeposit",
  "TransferFailed",
]);

/** Errors that can surface during the claim / withdraw flow. */
export const CLAIM_ERRORS: Record<string, string> = pick([
  "NotWithdrawable",
  "NotMember",
  "NotActive",
  "CircleExpired",
  "TransferFailed",
]);

/** Errors that can surface when creating a new stack. */
export const CREATE_ERRORS: Record<string, string> = pick([
  "TokenNotAllowed",
  "InvalidDepositInterval",
  "InvalidDepositAmount",
  "InvalidOwner",
  "AlreadyExists",
  "InvalidMemberAddress",
  "InvalidMemberCount",
  "InvalidCircleStartTime",
  "InvalidCurrentIndex",
]);

/** Errors that can surface when decommissioning a stack. */
export const DECOMMISSION_ERRORS: Record<string, string> = pick([
  "NotDecommissionable",
  "NotActive",
  "NotOwner",
  "NotCommissioned",
]);

// ── Goal-savings operation subsets ──────────────────────────────────────────

/** Errors that can surface when creating a goal. */
export const GOAL_CREATE_ERRORS: Record<string, string> = pick(
  [
    "TokenNotAllowed",
    "InvalidGoalAmount",
    "InvalidDeadline",
    "InvalidBeneficiary",
  ],
  GOAL_SAVINGS_ERRORS
);

/** Errors that can surface when the goal owner adds members. */
export const GOAL_ADD_MEMBERS_ERRORS: Record<string, string> = pick(
  [
    "GoalNotFound",
    "GoalNotOpen",
    "NotOwner",
    "AlreadyMember",
    "InvalidMemberAddress",
  ],
  GOAL_SAVINGS_ERRORS
);

/** Errors that can surface when depositing toward a goal. */
export const GOAL_DEPOSIT_ERRORS: Record<string, string> = pick(
  [
    "GoalNotFound",
    "GoalNotOpen",
    "NotMember",
    "InvalidDeposit",
    "SafeERC20FailedOperation",
  ],
  GOAL_SAVINGS_ERRORS
);

/** Errors that can surface when withdrawing a goal contribution. */
export const GOAL_WITHDRAW_ERRORS: Record<string, string> = pick(
  ["GoalNotFound", "NotMember", "NotWithdrawable", "NothingToWithdraw"],
  GOAL_SAVINGS_ERRORS
);

/** Errors that can surface when releasing a goal pot to the beneficiary. */
export const GOAL_RELEASE_ERRORS: Record<string, string> = pick(
  ["GoalNotFound", "NotReleasable"],
  GOAL_SAVINGS_ERRORS
);

/** Errors that can surface when cancelling a goal. */
export const GOAL_CANCEL_ERRORS: Record<string, string> = pick(
  ["GoalNotFound", "NotOwner", "NotCancellable"],
  GOAL_SAVINGS_ERRORS
);

// ── Internal helper ─────────────────────────────────────────────────────────

function pick(
  keys: string[],
  source: Record<string, string> = SAVING_CIRCLES_ERRORS
): Record<string, string> {
  return Object.fromEntries(
    keys.filter((k) => k in source).map((k) => [k, source[k]])
  );
}
