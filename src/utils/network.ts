import { getDefaultNetwork } from "@/utils/chain";

// The stored `explorerUrl` values already point at the `/address` path; strip it
// to recover the explorer origin so we can build both address and tx links.
const explorerBase = () =>
  (getDefaultNetwork()?.explorerUrl ?? "https://gnosisscan.io/address").replace(
    /\/address$/,
    ""
  );

export const explorerAddressUrl = (address: string) =>
  `${explorerBase()}/address/${address}`;

export const explorerTxUrl = (txHash: string) =>
  `${explorerBase()}/tx/${txHash}`;
