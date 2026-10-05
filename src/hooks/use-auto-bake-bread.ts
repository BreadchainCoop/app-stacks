import { breadAbi } from "@/lib/abis/bread-abi";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useWaitForTxReceipt } from "./use-wait-for-tx-receipt";
import { isCeloChain } from "@/utils/celo";
import {
  useActiveChainId,
  useDepositToken,
} from "@/components/providers/active-chain";
import { Address, encodeFunctionData } from "viem";

export const useAutoBakeBread = () => {
  const depositToken = useDepositToken();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const chainId = useActiveChainId();

  const autoBakeBread = async ({
    receiver,
    amount,
  }: {
    receiver: Address;
    amount: bigint;
  }) => {
    if (isCeloChain(chainId)) {
      throw new Error("Baking BREAD is not supported on Celo");
    }
    if (amount <= BigInt(0)) return;

    const data = encodeFunctionData({
      abi: breadAbi,
      functionName: "mint",
      args: [receiver],
    });

    const { hash } = await sendSponsoredTransaction(
      {
        to: depositToken.address,
        data,
        value: amount,
      },
      { address: receiver, uiOptions: { showWalletUIs: false } }
    );

    await waitForTxReceipt(hash);
  };

  return { autoBakeBread };
};
