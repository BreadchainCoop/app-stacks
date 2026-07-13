import { useConnectedUser } from "@breadcoop/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useState } from "react";
import { Address, encodeFunctionData, erc20Abi } from "viem";
import { readContractQueryKey } from "wagmi/query";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useAutomaticSavingCirclesTx } from "@/hooks/use-automatic-saving-circles-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";

export type AutomaticDepositsStatus = "idle" | "loading" | "success" | "error";

export function useAutomaticDeposits(stackId: string) {
  const { sendAutomaticSavingCirclesTx } = useAutomaticSavingCirclesTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { userId } = useUserIdentity();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const [status, setStatus] = useState<AutomaticDepositsStatus>("idle");
  const queryClient = useQueryClient();

  const setEnabledQueryData = (enabled: boolean) => {
    if (!address) return;

    const queryKey = readContractQueryKey({
      abi: automaticSavingCirclesAbi,
      address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
      functionName: "isAutomaticDepositsEnabled",
      args: [BigInt(stackId), address],
      chainId: getDefaultChainId(),
    });

    queryClient.setQueryData(queryKey, enabled);
    queryClient.invalidateQueries({ queryKey });
  };

  /**
   * Grants the limited spending permission (ERC20 approval to the automatic
   * contract) then enables automatic deposits for this circle.
   */
  const activate = async ({
    tokenAddress,
    allowanceAmount,
  }: {
    tokenAddress: Address;
    allowanceAmount: bigint;
  }) => {
    if (!userId || !address) return;
    setStatus("loading");

    try {
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS, allowanceAmount],
      });

      const { hash } = await sendSponsoredTransaction(
        {
          to: tokenAddress,
          data: approveData,
        },
        { uiOptions: { showWalletUIs: false } }
      );

      await waitForTxReceipt(hash);

      await sendAutomaticSavingCirclesTx({
        functionName: "setAutomaticDepositsEnabled",
        args: [BigInt(stackId), true],
      });

      setEnabledQueryData(true);
      setStatus("success");
    } catch (err) {
      console.error("useAutomaticDeposits activate error:", err);
      setStatus("error");
    }
  };

  const deactivate = async () => {
    if (!userId || !address) return;
    setStatus("loading");

    try {
      await sendAutomaticSavingCirclesTx({
        functionName: "setAutomaticDepositsEnabled",
        args: [BigInt(stackId), false],
      });

      setEnabledQueryData(false);
      setStatus("success");
    } catch (err) {
      console.error("useAutomaticDeposits deactivate error:", err);
      setStatus("error");
    }
  };

  return { activate, deactivate, status, setStatus };
}
