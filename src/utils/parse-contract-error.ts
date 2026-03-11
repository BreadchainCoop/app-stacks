import { ContractFunctionRevertedError } from "viem";

export function parseContractError(
  error: unknown,
  errorMap: Record<string, string>,
  fallback = "Transaction failed. Please try again."
): string {
  if (error instanceof ContractFunctionRevertedError) {
    const name = error.data?.errorName;
    if (name && errorMap[name]) return errorMap[name];
  }

  if (!(error instanceof Error)) return "An unexpected error occurred.";
  if (error.message.includes("User rejected"))
    return "Transaction was rejected.";

  for (const [name, message] of Object.entries(errorMap)) {
    if (error.message.includes(name)) return message;
  }

  return fallback;
}
