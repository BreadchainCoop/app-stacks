"use client";

import { useState } from "react";
import LocalButton from "./button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "./modal/context";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { formatAmount } from "@/utils/format-amount";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";
import { CLAIM_ERRORS } from "@/lib/contract-errors";

const parseClaimError = (error: unknown) =>
  parseContractError(error, CLAIM_ERRORS, "Failed to claim. Please try again.");

const ClaimButton = ({
  amount,
  circleId,
  label,
  className,
  nextDeposit,
  roundsLeft,
  nextDepositAddress,
}: {
  amount: number;
  circleId: bigint;
  label?: string;
  className?: string;
  nextDeposit: bigint;
  roundsLeft: bigint;
  nextDepositAddress: Address;
}) => {
  const queryClient = useQueryClient();
  const { setModal } = useModal();
  const [claiming, setClaiming] = useState(false);
  const { sendSavingCirclesTx } = useSavingCirclesTx();

  const claim = async () => {
    if (claiming) return;

    setClaiming(true);
    setModal({ type: "CLAIM_LOADING" });

    try {
      await sendSavingCirclesTx({
        functionName: "withdraw",
        args: [circleId],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      // Surface the withdrawal in the account history section without waiting
      // for its 60s stale window.
      queryClient.invalidateQueries({ queryKey: ["accountHistory"] });

      setModal({
        type: "CLAIM_RESULT",
        result: "success",
        amount,
        nextDeposit,
        roundsLeft,
        nextDepositAddress,
        circleId,
      });
    } catch (error) {
      console.error("__ ERROR __", error);
      setModal({
        type: "CLAIM_RESULT",
        result: "error",
        msg: parseClaimError(error),
      });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <LocalButton
      className={cn("claim-btn font-bold w-full", className)}
      leftIcon={<HandWithdrawIcon />}
      onClick={claim}
      disabled={claiming}
    >
      {label || `Claim ${formatAmount(amount, 2)} BREAD`}
    </LocalButton>
  );
};

export default ClaimButton;
