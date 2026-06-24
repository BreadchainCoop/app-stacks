"use client";

import { useState } from "react";
import LocalButton from "./button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "./modal/context";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { formatBalance, useConnectedUser } from "@breadcoop/ui";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";
import { CLAIM_ERRORS } from "@/lib/contract-errors";
import { refetchAfterClaim } from "@/utils/refetch-after-claim";

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
  const { user } = useConnectedUser();
  const member =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  console.log({ nextDeposit, roundsLeft, nextDepositAddress });

  const claim = async () => {
    if (claiming) return;

    setClaiming(true);
    setModal({ type: "CLAIM_LOADING" });

    try {
      await sendSavingCirclesTx({
        functionName: "withdraw",
        args: [circleId],
      });

      if (member) {
        await refetchAfterClaim(queryClient, { circleId, member });
      } else {
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
        queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      }

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
      className={cn("font-bold w-full", className)}
      leftIcon={<HandWithdrawIcon />}
      onClick={claim}
    >
      {label || `Claim ${formatBalance(amount, 2)} BREAD`}
    </LocalButton>
  );
};

export default ClaimButton;
