import { breadAbi } from "@/lib/abis/bread-abi";
import { clientEnv } from "@/lib/env";
import { useEffect, useRef } from "react";
import { encodeFunctionData } from "viem";
import { usePublicClient } from "wagmi";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useWaitForTxReceipt } from "./use-wait-for-tx-receipt";

export function useWatchFundedXdai(
  address: `0x${string}` | undefined,
  onFunded?: (newBalance: bigint, prevBalance: bigint) => Promise<void> | void
) {
  const publicClient = usePublicClient({
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
  });
  const prevBalance = useRef<bigint>(BigInt(0));
  const isMinting = useRef(false);
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();

  useEffect(() => {
    if (!address || !publicClient) return;

    publicClient.getBalance({ address }).then((bal) => {
      prevBalance.current = bal;
    });

    const unwatch = publicClient.watchBlocks({
      onBlock: async () => {
        if (isMinting.current) return;

        const balance = await publicClient.getBalance({ address });

        if (!(balance > prevBalance.current)) return;

        isMinting.current = true;

        try {
          const data = encodeFunctionData({
            abi: breadAbi,
            functionName: "mint",
            args: [address],
          });
          const { hash } = await sendSponsoredTransaction(
            {
              to: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
              data,
              value: balance - prevBalance.current,
            },
            {
              uiOptions: {
                showWalletUIs: false,
              },
            }
          );

          console.log("[useWatchFundedXdai]: waiting for receipt");
          await waitForTxReceipt(hash);

          console.log("[useWatchFundedXdai]: there is receipt");

          await onFunded?.(balance, prevBalance.current);
        } finally {
          isMinting.current = false;
          prevBalance.current = balance;
        }
      },
    });

    return unwatch;
  }, [address, publicClient]);
}
