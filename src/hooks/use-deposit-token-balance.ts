import { Address, erc20Abi } from "viem";
import { useBlockNumber, useReadContract } from "wagmi";
import { useEffect } from "react";
import {
  useActiveChainId,
  useDepositToken,
} from "@/components/providers/active-chain";
import { formatDepositAmount } from "@/lib/deposit-token";

/**
 * An address's balance of the active chain's deposit token, formatted with that
 * token's own decimals.
 *
 * Read directly instead of @breadcoop/ui's useBreadBalance, which hardcodes
 * 18 decimals and misreports 6-decimal deposit tokens (USDT/USDC on Celo).
 *
 * Refetches on each new block, matching what useBreadBalance did — the navbar
 * relies on that to pick up a deposit without a reload.
 */
export function useDepositTokenBalance(address: Address | undefined) {
  const depositToken = useDepositToken();
  const chainId = useActiveChainId();

  const { data, refetch, isLoading } = useReadContract({
    address: depositToken.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: { enabled: Boolean(address) },
  });

  const { data: blockNumber } = useBlockNumber({ watch: true, chainId });

  useEffect(() => {
    if (address) refetch();
  }, [blockNumber, address, refetch]);

  return {
    // A zero balance is a real answer, so callers gate loading state on the
    // read itself rather than on the value being truthy.
    balance: formatDepositAmount(data ?? BigInt(0), depositToken.decimals),
    raw: data,
    isLoading,
    refetch,
  };
}
