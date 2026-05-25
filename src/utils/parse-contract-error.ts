import {
  ContractFunctionRevertedError,
  ContractFunctionExecutionError,
} from "viem";
import { SAVING_CIRCLES_ERRORS } from "@/lib/contract-errors";

/**
 * Converts a raw contract / wagmi error into a human-readable string.
 *
 * Resolution order:
 *  1. Unwrap `ContractFunctionExecutionError` (thrown by `simulateContract`)
 *     to reach the underlying `ContractFunctionRevertedError`.
 *  2. Extract the decoded error name and look it up in:
 *     a. `operationErrors` (caller-supplied, operation-specific map)
 *     b. `SAVING_CIRCLES_ERRORS` (full contract-level fallback)
 *  3. Detect user-rejection strings in the error message.
 *  4. String-match the error message against all known error names.
 *  5. Return `fallback`.
 */
export function parseContractError(
  error: unknown,
  operationErrors: Record<string, string> = {},
  fallback = "Transaction failed. Please try again."
): string {
  // Step 1 — unwrap the execution wrapper viem adds around simulations
  const cause =
    error instanceof ContractFunctionExecutionError ? error.cause : error;

  // Step 2 — inspect the decoded revert
  if (cause instanceof ContractFunctionRevertedError) {
    const name = cause.data?.errorName;
    if (name) {
      return operationErrors[name] ?? SAVING_CIRCLES_ERRORS[name] ?? fallback;
    }
  }

  if (!(error instanceof Error)) return "An unexpected error occurred.";

  // Step 3 — user rejection (wallet prompt dismissed)
  if (error.message.includes("User rejected"))
    return "Transaction was rejected.";

  // Step 4 — string-match fallback for errors viem couldn't decode
  const combined = { ...SAVING_CIRCLES_ERRORS, ...operationErrors };
  for (const [name, message] of Object.entries(combined)) {
    if (error.message.includes(name)) return message;
  }

  return fallback;
}
