"use client";

import { LiftedButtonProps } from "@breadcoop/ui";
import { formatEther } from "viem";
import LocalLiftedButton from "./lifted-button";
import { useState } from "react";
import { useWriteContract } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "./providers/web3";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";

interface StartCircleButtonProps extends Omit<LiftedButtonProps, "children"> {
  amount: bigint;
  circleId: bigint;
}

const StartCircleButton = ({
  amount,
  circleId,
  ...props
}: StartCircleButtonProps) => {
  const queryClient = useQueryClient();
  const contract = useWriteContract();
  const [starting, setStarting] = useState(false);

  const start = async () => {
    if (starting) return;

    setStarting(true);

    try {
      const hash = await contract.writeContractAsync({
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "start",
        args: [BigInt(circleId)],
      });

      await waitForTransactionReceipt(wagmiConfig, { hash });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
    } catch (error) {
      console.log("___ START CIRCLE ERROR ___", error);
    } finally {
      setStarting(false);
    }
  };

  return (
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
  );
};

export default StartCircleButton;
