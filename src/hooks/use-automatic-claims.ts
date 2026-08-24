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

/**
 * Automatic claims are opt-out: members are enrolled when they join a stack and
 * can turn it off later from the toggle on the stack page. The contract
 * defaults to disabled and has no flag for "explicitly set", so joining has to
 * write the opt-in — defaulting it on read would re-enable it right after a
 * user opts out.
 */
export function useAutomaticClaims() {
  const { sendAutomaticSavingCirclesTx } = useAutomaticSavingCirclesTx();
  const { user: privyUser } = usePrivy();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const [status, setStatus] = useState<AutomaticClaimsStatus>("idle");
  const queryClient = useQueryClient();

  const activate = async (circleId: bigint, enabled: boolean) => {
    if (status === "loading" || !privyUser?.id) return;
    setStatus("loading");

    try {
      await sendAutomaticSavingCirclesTx({
        functionName: "setAutomaticClaimsEnabled",
        args: [circleId, enabled],
      });

      if (!address) {
        setStatus("success");
        return;
      }

      const queryKey = readContractQueryKey({
        abi: automaticSavingCirclesAbi,
        address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
        functionName: "isAutomaticClaimsEnabled",
        args: [circleId, address],
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
