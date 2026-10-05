import { getNetwork } from "@/utils/chain";

// The stored `explorerUrl` values already point at the `/address` path; strip it
// to recover the explorer origin so we can build both address and tx links.
const explorerBase = (chainId: number) =>
  (getNetwork(chainId)?.explorerUrl ?? "https://gnosisscan.io/address").replace(
    /\/address$/,
    ""
  );

export const explorerAddressUrl = (chainId: number, address: string) =>
  `${explorerBase(chainId)}/address/${address}`;

export const explorerTxUrl = (chainId: number, txHash: string) =>
  `${explorerBase(chainId)}/tx/${txHash}`;
