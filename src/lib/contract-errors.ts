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

// ── Internal helper ─────────────────────────────────────────────────────────

function pick(keys: string[]): Record<string, string> {
  return Object.fromEntries(
    keys
      .filter((k) => k in SAVING_CIRCLES_ERRORS)
      .map((k) => [k, SAVING_CIRCLES_ERRORS[k]])
  );
}
