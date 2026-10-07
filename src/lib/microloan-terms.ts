import { Hex, keccak256, stringToBytes, zeroHash } from "viem";

/**
 * The on-chain termsHash for a plain-language loan agreement. The lender
 * hashes the text at create; the borrower pastes the same text to accept, so
 * the chain records exactly which terms they agreed to. Surrounding
 * whitespace is ignored so a copy-paste round trip still matches. No text
 * means no agreement (the zero hash).
 */
export function agreementHash(text: string | undefined): Hex {
  const trimmed = text?.trim() ?? "";
  return trimmed ? keccak256(stringToBytes(trimmed)) : zeroHash;
}
