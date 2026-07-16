import { useState } from "react";
import { useUserIdentity } from "@/components/providers/user-identity";
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
  const { userId } = useUserIdentity();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const [status, setStatus] = useState<AutomaticClaimsStatus>("idle");
  const queryClient = useQueryClient();

  const activate = async (enabled: boolean) => {
    if (!userId) return;
    setStatus("loading");

    try {
      await sendAutomaticSavingCirclesTx({
        functionName: "setAutomaticClaimsEnabled",
        args: [BigInt(stackId), enabled],
      });

      const queryKey = readContractQueryKey({
        abi: automaticSavingCirclesAbi,
        address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
        functionName: "isAutomaticClaimsEnabled",
        args: [BigInt(stackId), address!],
        chainId: getDefaultChainId(),
      });

      queryClient.setQueryData(queryKey, enabled);
      queryClient.invalidateQueries({ queryKey });

      setStatus("success");
    } catch (err) {
      console.error("useAutomaticClaims error:", err);
      setStatus("error");
    }
  };

  return { activate, status, setStatus };
}
