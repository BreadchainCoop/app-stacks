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
 * AccumulatingSavingCircles (ASCA) contract ABI.
 */
export const ASCA_ERRORS: Record<string, string> = {
  // ── Membership / invites ──────────────────────────────────────────
  NotMember: "You are not a member of this fund.",
  AlreadyMember: "This address is already a member of this fund.",
  NotFundOwner: "Only the fund organizer can perform this action.",
  InvalidSigner: "The invite signature is invalid.",
  InviteAlreadyUsed: "This invite has already been used.",

  // ── Lifecycle / configuration ─────────────────────────────────────
  FundNotFound: "This fund does not exist.",
  FundNotActive: "This fund has been deactivated.",
  InvalidParameters: "One or more fund settings are out of range.",
  TokenNotAllowed: "This token is not allowed for funds.",

  // ── Savings ───────────────────────────────────────────────────────
  ZeroAmount: "The amount must be greater than zero.",
  InsufficientSavings: "Amount exceeds your savings balance.",
  InsufficientLiquidity:
    "The pool doesn't hold enough cash right now — try again once loans are repaid.",
  NothingToClaim: "You have no interest to claim yet.",

  // ── Credit ────────────────────────────────────────────────────────
  ExceedsCreditLine: "Amount exceeds your credit line.",
  OutstandingLoan: "Repay your current loan before borrowing again.",
  NoActiveLoan: "There is no open loan to act on.",
  InsufficientCollateral:
    "Withdrawing this much would leave your loan under-collateralized.",
  NotLiquidatable: "This loan is not overdue, so it can't be liquidated.",

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
 * GoalSavingCircles contract ABI.
 */
export const GOAL_SAVINGS_ERRORS: Record<string, string> = {
  // ── Membership / invites ──────────────────────────────────────────
  NotMember: "You are not a member of this goal.",
  AlreadyMember: "This address is already a member of this goal.",
  NotOwner: "Only the goal organizer can perform this action.",
  InvalidSigner: "The invite signature is invalid.",
  InviteAlreadyUsed: "This invite has already been used.",

  // ── Lifecycle / configuration ─────────────────────────────────────
  GoalNotFound: "This goal does not exist.",
  GoalNotOpen: "This goal is no longer accepting deposits or members.",
  InvalidGoalAmount: "The goal amount must be greater than zero.",
  InvalidDeadline: "The deadline must be in the future.",
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
 */
export const COLLECTIVE_FUND_ERRORS: Record<string, string> = {
  // ── Membership / invites ──────────────────────────────────────────
  NotMember: "You are not a member of this fund.",
  AlreadyMember: "This address is already a member of this fund.",
  NotFundOwner: "Only the fund organizer can perform this action.",
  InvalidSigner: "The invite signature is invalid.",
  InviteAlreadyUsed: "This invite has already been used.",

  // ── Lifecycle / configuration ─────────────────────────────────────
  FundNotFound: "This fund does not exist.",
  InvalidFundOwner: "Invalid fund owner address.",
  InvalidName: "The fund name cannot be empty.",
  InvalidVotingPeriod: "The voting period is out of range.",
  InvalidThreshold: "The approval threshold is out of range.",
  TokenNotAllowed: "This token is not allowed for funds.",

  // ── Deposits & withdrawals ────────────────────────────────────────
  InvalidAmount: "The amount must be greater than zero.",
  InsufficientShares: "Amount exceeds your share balance.",

  // ── Proposals & voting ────────────────────────────────────────────
  ProposalNotFound: "This proposal does not exist.",
  InvalidRecipient: "The recipient address is invalid.",
  VotingClosed: "Voting on this proposal has closed.",
  NotEligible:
    "You joined after this proposal was created, so you can't vote on it.",
  AlreadyVoted: "You have already voted on this proposal.",
  ProposalNotPassed: "This proposal hasn't reached its approval threshold.",
  ProposalAlreadyExecuted: "This proposal has already been executed.",
  ProposalExpired: "The execution window for this proposal has closed.",
  InsufficientPoolBalance:
    "The pool doesn't hold enough funds to pay this proposal right now.",

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

// ── ASCA operation subsets ──────────────────────────────────────────────────

/** Errors that can surface when creating an ASCA fund. */
export const ASCA_CREATE_ERRORS: Record<string, string> = pick(
  ["TokenNotAllowed", "InvalidParameters"],
  ASCA_ERRORS
);

/** Errors that can surface when joining an ASCA fund via invite. */
export const ASCA_JOIN_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "FundNotActive",
    "AlreadyMember",
    "InviteAlreadyUsed",
    "InvalidSigner",
  ],
  ASCA_ERRORS
);

/** Errors that can surface when depositing savings into an ASCA fund. */
export const ASCA_DEPOSIT_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "FundNotActive",
    "NotMember",
    "ZeroAmount",
    "SafeERC20FailedOperation",
  ],
  ASCA_ERRORS
);

/** Errors that can surface when withdrawing savings from an ASCA fund. */
export const ASCA_WITHDRAW_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "NotMember",
    "ZeroAmount",
    "InsufficientSavings",
    "InsufficientCollateral",
    "InsufficientLiquidity",
  ],
  ASCA_ERRORS
);

/** Errors that can surface when borrowing from an ASCA fund. */
export const ASCA_BORROW_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "FundNotActive",
    "NotMember",
    "ZeroAmount",
    "ExceedsCreditLine",
    "OutstandingLoan",
    "InsufficientLiquidity",
  ],
  ASCA_ERRORS
);

/** Errors that can surface when repaying an ASCA loan. */
export const ASCA_REPAY_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "NotMember",
    "ZeroAmount",
    "NoActiveLoan",
    "SafeERC20FailedOperation",
  ],
  ASCA_ERRORS
);

/** Errors that can surface when claiming ASCA interest. */
export const ASCA_CLAIM_INTEREST_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "NotMember", "NothingToClaim", "InsufficientLiquidity"],
  ASCA_ERRORS
);

/** Errors that can surface when liquidating an overdue ASCA loan. */
export const ASCA_LIQUIDATE_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "NotMember", "NoActiveLoan", "NotLiquidatable"],
  ASCA_ERRORS
);

/** Errors that can surface when deactivating an ASCA fund. */
export const ASCA_DEACTIVATE_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "FundNotActive", "NotFundOwner"],
  ASCA_ERRORS
);

// ── Goal-savings operation subsets ──────────────────────────────────────────

/** Errors that can surface when creating a goal. */
export const GOAL_CREATE_ERRORS: Record<string, string> = pick(
  ["TokenNotAllowed", "InvalidGoalAmount", "InvalidDeadline"],
  GOAL_SAVINGS_ERRORS
);

/** Errors that can surface when joining a goal via invite. */
export const GOAL_JOIN_ERRORS: Record<string, string> = pick(
  [
    "GoalNotFound",
    "GoalNotOpen",
    "AlreadyMember",
    "InviteAlreadyUsed",
    "InvalidSigner",
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

// ── Collective-fund operation subsets ───────────────────────────────────────

/** Errors that can surface when creating a collective fund. */
export const COLLECTIVE_CREATE_ERRORS: Record<string, string> = pick(
  [
    "TokenNotAllowed",
    "InvalidFundOwner",
    "InvalidName",
    "InvalidVotingPeriod",
    "InvalidThreshold",
  ],
  COLLECTIVE_FUND_ERRORS
);

/** Errors that can surface when joining a collective fund via invite. */
export const COLLECTIVE_JOIN_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "AlreadyMember", "InviteAlreadyUsed", "InvalidSigner"],
  COLLECTIVE_FUND_ERRORS
);

/** Errors that can surface when depositing into or donating to a fund. */
export const COLLECTIVE_DEPOSIT_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "NotMember", "InvalidAmount", "SafeERC20FailedOperation"],
  COLLECTIVE_FUND_ERRORS
);

/** Errors that can surface when withdrawing (rage-quitting) shares. */
export const COLLECTIVE_WITHDRAW_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "NotMember", "InvalidAmount", "InsufficientShares"],
  COLLECTIVE_FUND_ERRORS
);

/** Errors that can surface when creating a disbursement proposal. */
export const COLLECTIVE_PROPOSE_ERRORS: Record<string, string> = pick(
  ["FundNotFound", "NotMember", "InvalidRecipient", "InvalidAmount"],
  COLLECTIVE_FUND_ERRORS
);

/** Errors that can surface when voting on a proposal. */
export const COLLECTIVE_VOTE_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "ProposalNotFound",
    "NotMember",
    "NotEligible",
    "VotingClosed",
    "AlreadyVoted",
  ],
  COLLECTIVE_FUND_ERRORS
);

/** Errors that can surface when executing a passed proposal. */
export const COLLECTIVE_EXECUTE_ERRORS: Record<string, string> = pick(
  [
    "FundNotFound",
    "ProposalNotFound",
    "ProposalNotPassed",
    "ProposalAlreadyExecuted",
    "ProposalExpired",
    "InsufficientPoolBalance",
  ],
  COLLECTIVE_FUND_ERRORS
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
