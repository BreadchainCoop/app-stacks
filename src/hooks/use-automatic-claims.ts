import { useState } from "react";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useAutomaticSavingCirclesTx } from "./use-automatic-saving-circles-tx";
import { useQueryClient } from "@tanstack/react-query";
import { readContractQueryKey } from "wagmi/query";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
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
  const { userId } = useUserIdentity();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;
  const [status, setStatus] = useState<AutomaticClaimsStatus>("idle");
  const queryClient = useQueryClient();
  const chainId = useActiveChainId();
  const { automaticSavingCircles } = useChainConfig();

  const activate = async (circleId: bigint, enabled: boolean) => {
    if (status === "loading" || !userId) return;
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
        address: automaticSavingCircles,
        functionName: "isAutomaticClaimsEnabled",
        args: [circleId, address],
        chainId,
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
