import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAutomaticSavingCirclesTx } from "./use-automatic-saving-circles-tx";
import { useQueryClient } from "@tanstack/react-query";
import { readContractQueryKey } from "wagmi/query";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";

export type AutomaticClaimsStatus = "idle" | "loading" | "success" | "error";

export function useAutomaticClaims(stackId: string) {
  const { sendAutomaticSavingCirclesTx } = useAutomaticSavingCirclesTx();
  const { user: privyUser } = usePrivy();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const [status, setStatus] = useState<AutomaticClaimsStatus>("idle");
  const queryClient = useQueryClient();

  const activate = async (enabled: boolean) => {
    if (!privyUser?.id) return;
    setStatus("loading");

    try {
      await sendAutomaticSavingCirclesTx({
        functionName: "setAutomaticDepositsEnabled",
        args: [enabled],
      });

      const res = await fetch("/api/stacks/automatic-claims", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          stackId,
          enabled,
        }),
      });

      if (!res.ok) throw new Error("Failed to update Supabase");

      queryClient.setQueryData(
        readContractQueryKey({
          abi: automaticSavingCirclesAbi,
          address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
          functionName: "isAutomaticDepositsEnabled",
          args: [address!],
          chainId: getDefaultChainId(),
        }),
        enabled
      );

      setStatus("success");
    } catch (err) {
      console.error("useAutomaticClaims error:", err);
      setStatus("error");
    }
  };

  return { activate, status, setStatus };
}
