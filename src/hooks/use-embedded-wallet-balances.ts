import {
  useActiveChainId,
  useDepositToken,
} from "@/components/providers/active-chain";
import { Address } from "viem";
import { useBalance } from "wagmi";

/** BREAD + xDAI balances sitting in a given (typically embedded) wallet. */
export const useEmbeddedWalletBalances = (address: Address | undefined) => {
  const chainId = useActiveChainId();
  const {
    data: breadBalance,
    isLoading: isLoadingBread,
    refetch: refetchBreadBalance,
  } = useBalance({
    address,
    token: useDepositToken().address,
    chainId: chainId,
    query: { enabled: Boolean(address) },
  });

  const {
    data: xdaiBalance,
    isLoading: isLoadingXdai,
    refetch: refetchXdaiBalance,
  } = useBalance({
    address,
    chainId: chainId,
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
