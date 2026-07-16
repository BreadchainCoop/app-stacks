"use client";

import { ButtonProps } from "@breadcoop/ui";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import LocalButton from "./button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";
import { useModal } from "./modal/context";

interface StartCircleButtonProps extends Omit<ButtonProps, "children"> {
  amount: bigint;
  circleId: bigint;
  pendingMembers?: number;
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
  pendingMembers = 0,
  ...props
}: StartCircleButtonProps) => {
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const queryClient = useQueryClient();
  const { setModal } = useModal();
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

  const onClick = () => {
    if (pendingMembers > 0) {
      setModal({
        type: "START_STACK_WARNING",
        pendingMembers,
        onConfirm: start,
      });
      return;
    }

    start();
  };

  return (
    <div className="flex flex-col gap-1">
      <LocalButton
        {...props}
        onClick={onClick}
        className={`${props.className || ""} font-semibold`}
      >
        {starting ? (
          <span className="flex items-center justify-center">
            <Loading />
          </span>
        ) : (
          <>
            Start Stacks - {formatDepositAmount(amount)} {DEPOSIT_TOKEN.symbol}
          </>
        )}
      </LocalButton>
    </div>
  );
};

export default StartCircleButton;
