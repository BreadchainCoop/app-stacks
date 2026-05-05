import React, { useState } from "react";
import LocalLiftedButton from "./lifted-button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "./modal/context";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Address } from "viem";
import { formatBalance } from "@breadcoop/ui";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";

const CLAIM_ERRORS: Record<string, string> = {
  NotWithdrawable: "It's not your turn to claim yet.",
  NotMember: "You are not a member of this circle.",
  NotActive: "This circle is not active.",
};

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

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });

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
    <LocalLiftedButton
      className={cn("font-bold", className)}
      width="full"
      preset="stroke"
      leftIcon={<HandWithdrawIcon />}
      onClick={claim}
    >
      {label || `Claim ${formatBalance(amount, 2)} BREAD`}
    </LocalLiftedButton>
  );
};

export default ClaimButton;
