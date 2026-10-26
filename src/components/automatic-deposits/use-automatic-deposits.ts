import { useConnectedUser } from "@breadcoop/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useWalletHost } from "@/components/providers/is-minipay";
import { useState } from "react";
import { Address, encodeFunctionData, erc20Abi } from "viem";
import { readContractQueryKey } from "wagmi/query";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useAutomaticSavingCirclesTx } from "@/hooks/use-automatic-saving-circles-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";

export type AutomaticDepositsStatus =
  | "idle"
  | "loading"
  | "granted"
  | "success"
  | "error";

export function useAutomaticDeposits(stackId: string) {
  const { sendAutomaticSavingCirclesTx } = useAutomaticSavingCirclesTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { userId } = useUserIdentity();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const [status, setStatus] = useState<AutomaticDepositsStatus>("idle");
  const queryClient = useQueryClient();
  const chainId = useActiveChainId();
  const { automaticSavingCircles } = useChainConfig();
  const isNimiqPay = useWalletHost() === "nimiqpay";

  const setEnabledQueryData = (enabled: boolean) => {
    if (!address) return;

    const queryKey = readContractQueryKey({
      abi: automaticSavingCirclesAbi,
      address: automaticSavingCircles,
      functionName: "isAutomaticDepositsEnabled",
      args: [BigInt(stackId), address],
      chainId,
    });

    queryClient.setQueryData(queryKey, enabled);
    queryClient.invalidateQueries({ queryKey });
  };

  const sendEnable = async () => {
    await sendAutomaticSavingCirclesTx({
      functionName: "setAutomaticDepositsEnabled",
      args: [BigInt(stackId), true],
    });

    setEnabledQueryData(true);
    setStatus("success");
  };

  /**
   * Grants the limited spending permission (ERC20 approval to the automatic
   * contract) then enables automatic deposits for this circle.
   *
   * Each Nimiq Pay transaction opens a native dialog, and Nimiq's mini app
   * guidelines ask that each follow its own tap, so there it stops at
   * "granted" and `enable` sends the second transaction.
   */
  const activate = async ({
    tokenAddress,
    allowanceAmount,
  }: {
    tokenAddress: Address;
    allowanceAmount: bigint;
  }) => {
    if (status === "loading" || !userId || !address) return;

    setStatus("loading");

    try {
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [automaticSavingCircles, allowanceAmount],
      });

      const { hash } = await sendSponsoredTransaction(
        {
          to: tokenAddress,
          data: approveData,
        },
        { uiOptions: { showWalletUIs: false } }
      );

      await waitForTxReceipt(hash);

      if (isNimiqPay) {
        setStatus("granted");
        return;
      }

      await sendEnable();
    } catch (err) {
      console.error("useAutomaticDeposits activate error:", err);
      setStatus("error");
    }
  };

  const enable = async () => {
    if (status === "loading" || !userId || !address) return;

    setStatus("loading");

    try {
      await sendEnable();
    } catch (err) {
      console.error("useAutomaticDeposits enable error:", err);
      setStatus("error");
    }
  };

  const deactivate = async () => {
    if (status === "loading" || !userId || !address) return;

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

  return { activate, enable, deactivate, status, setStatus };
}
