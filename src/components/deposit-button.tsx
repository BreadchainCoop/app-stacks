"use client";

import {
  LiftedButton,
  LiftedButtonProps,
  useConnectedUser,
} from "@breadcoop/ui";
import { useModal } from "./modal/context";
import { localButtonClassNames } from "./lifted-button";
import { useReadContract } from "wagmi";
import { Address, encodeFunctionData, erc20Abi } from "viem";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useMemo, useState } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";
import { MAX_UINT256 } from "@/utils/solidity";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";

interface DepositButtonProps extends Omit<LiftedButtonProps, "children"> {
  label?: string;
  amount: bigint;
  tokenAddress: Address;
  circleId: bigint;
}

const DEPOSIT_ERRORS: Record<string, string> = {
  NotActive: "This circle is not active.",
  NotMember: "You are not a member of this circle.",
  CircleExpired: "This circle has expired.",
  CircleTimedOut: "The deposit window has closed.",
  ExceedsDepositAmount: "Amount exceeds the required deposit.",
  DepositBeforeCircleStart: "The circle hasn't started yet.",
};

const parseDepositError = (error: unknown) =>
  parseContractError(
    error,
    DEPOSIT_ERRORS,
    "Transaction failed. You don't have enough BREAD."
  );

const DepositButton = ({
  label = "Pay Deposit",
  className = "",
  amount,
  tokenAddress,
  circleId,
  ...props
}: DepositButtonProps) => {
  const [depositing, setDepositing] = useState(false);
  const queryClient = useQueryClient();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const { user } = useConnectedUser();
  const userAddress = user.status === "CONNECTED" ? user.address : undefined;
  const modal = useModal();
  const allClassName = `${className} ${
    !props.preset || props.preset === "primary"
      ? localButtonClassNames.primary
      : ""
  }`;

  const { data: allowance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress!, SAVING_CIRCLES_CONTRACT_ADDRESS],
    query: { enabled: !!userAddress },
    chainId: getDefaultChainId(),
  });

  const needsApproval = useMemo(() => {
    if (!userAddress) return false;
    return allowance < amount;
  }, [allowance, amount, userAddress]);

  const deposit = async () => {
    if (depositing) return;

    modal.setModal({ type: "DEPOSIT_LOADING" });
    setDepositing(true);

    try {
      if (needsApproval) {
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [SAVING_CIRCLES_CONTRACT_ADDRESS, MAX_UINT256],
        });

        const { hash: approveHash } = await sendSponsoredTransaction({
          to: tokenAddress,
          data: approveData,
        });

        await waitForTxReceipt(approveHash);
      }

      await sendSavingCirclesTx({
        functionName: "deposit",
        args: [circleId, amount],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });

      modal.setModal({ type: "DEPOSIT_RESULT", result: "success" });
    } catch (error) {
      console.error("__ ERROR __", error);
      modal.setModal({
        type: "DEPOSIT_RESULT",
        result: "error",
        msg: parseDepositError(error),
      });
    } finally {
      setDepositing(false);
    }
  };

  // TODO: Since privy is being used, show wrong chain button if user is on unsupported chain
  return (
    <LiftedButton
      {...props}
      onClick={deposit}
      className={allClassName}
      leftIcon={depositing ? undefined : props.leftIcon}
      rightIcon={depositing ? undefined : props.rightIcon}
    >
      {depositing ? (
        <span className="flex items-center justify-center">
          <Loading />
        </span>
      ) : (
        label
      )}
    </LiftedButton>
  );
};

export default DepositButton;
