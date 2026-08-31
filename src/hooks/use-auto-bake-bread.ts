import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { breadAbi } from "@/lib/abis/bread-abi";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useWaitForTxReceipt } from "./use-wait-for-tx-receipt";
import { Address, encodeFunctionData } from "viem";

export const useAutoBakeBread = () => {
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();

  const autoBakeBread = async ({
    receiver,
    amount,
  }: {
    receiver: Address;
    amount: bigint;
  }) => {
    if (amount <= BigInt(0)) return;

    const data = encodeFunctionData({
      abi: breadAbi,
      functionName: "mint",
      args: [receiver],
    });

    const { hash } = await sendSponsoredTransaction(
      {
        to: BREAD_TOKEN_ADDRESS,
        data,
        value: amount,
      },
      { address: receiver, uiOptions: { showWalletUIs: false } }
    );

    await waitForTxReceipt(hash);
  };

  return { autoBakeBread };
};
