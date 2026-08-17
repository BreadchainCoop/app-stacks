"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Address, formatUnits } from "viem";
import { CoinsIcon } from "@phosphor-icons/react";
import { useConnectedUser } from "@breadcoop/ui";
import LocalButton from "./button";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/utils/format-amount";
import { useClaimableYield } from "@/hooks/use-claimable-yield";
import { useYieldSavingCirclesTx } from "@/hooks/use-yield-saving-circles-tx";

// Shows a member's accrued yield on a saving circle and lets them claim it.
// Yield accrues per-member and is time-weighted (earlier deposits earn more) —
// see saving-circles#189. Renders nothing when no yield contract is configured.
export default function YieldPanel({
  member,
  className,
}: {
  member?: Address;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);
  const { user } = useConnectedUser();
  const connected =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const receiver = member ?? connected;

  const { claimableYield, hasYieldContract, refetch } = useClaimableYield({
    member: receiver,
  });
  const { sendYieldSavingCirclesTx } = useYieldSavingCirclesTx();

  if (!hasYieldContract) return null;

  const amount = Number(formatUnits(claimableYield, 18));
  const nothingToClaim = claimableYield === BigInt(0);

  const claimYield = async () => {
    if (claiming || !receiver || nothingToClaim) return;
    setClaiming(true);
    try {
      await sendYieldSavingCirclesTx({
        functionName: "claimYield",
        args: [receiver],
      });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      await refetch();
    } catch (error) {
      console.error("__ CLAIM YIELD ERROR __", error);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-3 rounded-2xl border p-4", className)}
    >
      <div className="flex items-center gap-2">
        <CoinsIcon className="size-5" />
        <span className="font-bold">Yield earned</span>
      </div>
      <p className="text-2xl font-bold">{formatAmount(amount, 4)} BREAD</p>
      <p className="text-sm opacity-70">
        Your deposits earn yield while the circle runs — the earlier you
        deposit, the more you earn.
      </p>
      <LocalButton
        className="font-bold w-full"
        onClick={claimYield}
        disabled={claiming || !receiver || nothingToClaim}
      >
        {claiming ? "Claiming…" : "Claim yield"}
      </LocalButton>
    </div>
  );
}
