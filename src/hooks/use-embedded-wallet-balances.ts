import { DEPOSIT_TOKEN } from "@/lib/deposit-token";
import { clientEnv } from "@/lib/env";
import { Address } from "viem";
import { useBalance } from "wagmi";

/** BREAD + xDAI balances sitting in a given (typically embedded) wallet. */
export const useEmbeddedWalletBalances = (address: Address | undefined) => {
  const {
    data: breadBalance,
    isLoading: isLoadingBread,
    refetch: refetchBreadBalance,
  } = useBalance({
    address,
    token: DEPOSIT_TOKEN.address,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const {
    data: xdaiBalance,
    isLoading: isLoadingXdai,
    refetch: refetchXdaiBalance,
  } = useBalance({
    address,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const isLoading = isLoadingBread || isLoadingXdai;
  const hasFunds =
    (breadBalance?.value ?? BigInt(0)) > BigInt(0) ||
    (xdaiBalance?.value ?? BigInt(0)) > BigInt(0);

  return {
    breadBalance,
    xdaiBalance,
    isLoading,
    hasFunds,
    refetchBreadBalance,
    refetchXdaiBalance,
  };
};
