import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useAutomaticSavingCirclesTx } from "./use-automatic-saving-circles-tx";

export type AccountAutomaticClaimsStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export interface AccountAutomaticClaimsProgress {
  done: number;
  total: number;
  failed: number;
}

/**
 * Account-level auto-claims: enable/disable automatic claims across every stack
 * the user is currently in. The contract has no batch setter and no
 * account-level flag, so this loops `setAutomaticClaimsEnabled` one stack at a
 * time. Callers pass only the circles that actually need changing (those whose
 * current state differs from the target), so already-matching stacks cost no
 * transaction. Failures don't abort the run — each stack is independent — and
 * the final status reflects whether any succeeded.
 */
export function useAccountAutomaticClaims() {
  const { sendAutomaticSavingCirclesTx } = useAutomaticSavingCirclesTx();
  const { user: privyUser } = usePrivy();
  const [status, setStatus] = useState<AccountAutomaticClaimsStatus>("idle");
  const [progress, setProgress] = useState<AccountAutomaticClaimsProgress>({
    done: 0,
    total: 0,
    failed: 0,
  });
  const queryClient = useQueryClient();

  const setAllEnabled = async (circleIds: bigint[], enabled: boolean) => {
    if (status === "loading" || !privyUser?.id || circleIds.length === 0)
      return;

    setStatus("loading");
    setProgress({ done: 0, total: circleIds.length, failed: 0 });

    let failed = 0;
    for (let i = 0; i < circleIds.length; i++) {
      try {
        await sendAutomaticSavingCirclesTx({
          functionName: "setAutomaticClaimsEnabled",
          args: [circleIds[i], enabled],
        });
      } catch (err) {
        console.error(
          "useAccountAutomaticClaims error for circle",
          circleIds[i].toString(),
          err
        );
        failed++;
      }
      setProgress({ done: i + 1, total: circleIds.length, failed });
    }

    // Refresh the per-circle `isAutomaticClaimsEnabled` reads that drive the
    // toggle's aggregate state.
    queryClient.invalidateQueries({ queryKey: ["readContract"] });
    queryClient.invalidateQueries({ queryKey: ["readContracts"] });

    setStatus(failed === circleIds.length ? "error" : "success");
  };

  return { setAllEnabled, status, setStatus, progress };
}
