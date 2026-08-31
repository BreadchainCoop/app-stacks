import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { Address } from "viem";
import { useBalance } from "wagmi";

/** BREAD + xDAI balances sitting in a given (typically embedded) wallet. */
export const useEmbeddedWalletBalances = (address: Address | undefined) => {
  const { data: breadBalance, isLoading: isLoadingBread } = useBalance({
    address,
    token: BREAD_TOKEN_ADDRESS,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const { data: xdaiBalance, isLoading: isLoadingXdai } = useBalance({
    address,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const isLoading = isLoadingBread || isLoadingXdai;
  const hasFunds =
    (breadBalance?.value ?? BigInt(0)) > BigInt(0) ||
    (xdaiBalance?.value ?? BigInt(0)) > BigInt(0);

  return { breadBalance, xdaiBalance, isLoading, hasFunds };
};
