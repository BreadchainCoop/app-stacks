"use client";

import { LiftedButtonProps } from "@breadcoop/ui";
import { formatEther } from "viem";
import LocalLiftedButton from "./lifted-button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";

interface StartCircleButtonProps extends Omit<LiftedButtonProps, "children"> {
  amount: bigint;
  circleId: bigint;
}

const START_ERRORS: Record<string, string> = {
  AlreadyActive: "This circle has already been started.",
  NotOwner: "Only the circle owner can start it.",
  InvalidMemberCount: "At least 2 members are required to start a circle.",
  NotCommissioned: "This circle does not exist.",
  InvalidDepositInterval: "The deposit interval is invalid.",
};

const parseStartError = (error: unknown) =>
  parseContractError(error, START_ERRORS);

const StartCircleButton = ({
  amount,
  circleId,
  ...props
}: StartCircleButtonProps) => {
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const queryClient = useQueryClient();
  const [starting, setStarting] = useState(false);

  const start = async () => {
    if (starting) return;

    setStarting(true);

    try {
      await sendSavingCirclesTx({ functionName: "start", args: [circleId] });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
    } catch (err) {
      console.error("___ START CIRCLE ERROR ___", err);
      alert(parseStartError(err));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <LocalLiftedButton
        {...props}
        onClick={start}
        className={`${props.className || ""} font-semibold`}
      >
        {starting ? (
          <span className="flex items-center justify-center">
            <Loading />
          </span>
        ) : (
          <>Start Stacks - {formatEther(amount)} BREAD</>
        )}
      </LocalLiftedButton>
    </div>
  );
};

export default StartCircleButton;
