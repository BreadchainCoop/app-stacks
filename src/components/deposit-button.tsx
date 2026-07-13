"use client";

import { ButtonProps, formatBalance, useConnectedUser } from "@breadcoop/ui";
import { useModal } from "./modal/context";
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
import { DEPOSIT_ERRORS } from "@/lib/contract-errors";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { useIsMiniPay } from "@/hooks/use-is-minipay";
import LocalButton from "./button";

interface DepositButtonProps extends Omit<ButtonProps, "children"> {
  label?: string;
  amount: bigint;
  tokenAddress: Address;
  circleId: bigint;
}

const parseDepositError = (error: unknown) =>
  parseContractError(error, DEPOSIT_ERRORS);

const DepositButton = ({
  label = "Pay Deposit",
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
  const isMiniPay = useIsMiniPay();

  const { data: allowance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress!, SAVING_CIRCLES_CONTRACT_ADDRESS],
    query: { enabled: !!userAddress },
    chainId: getDefaultChainId(),
  });

  const { data: balance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress!],
    query: { enabled: !!userAddress },
    chainId: getDefaultChainId(),
  });

  const needsApproval = useMemo(() => {
    if (!userAddress) return false;
    return allowance < amount;
  }, [allowance, amount, userAddress]);

  const hasInsufficientBalance = !!userAddress && balance < amount;

  const missingAmount = hasInsufficientBalance
    ? formatBalance(Number(formatDepositAmount(amount - balance)), 2)
    : null;

  const deposit = async () => {
    if (depositing) return;

    // In MiniPay, route a low balance to MiniPay's Deposit flow (via the
    // result modal's Add Cash deeplink) instead of a dead disabled button.
    if (isMiniPay && hasInsufficientBalance) {
      modal.setModal({
        type: "DEPOSIT_RESULT",
        result: "error",
        msg: `You don't have enough ${DEPOSIT_TOKEN.symbol} to make this deposit.`,
        insufficientBalance: true,
      });
      return;
    }

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
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      modal.setModal({ type: "DEPOSIT_RESULT", result: "success" });
    } catch (error) {
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
    <LocalButton
      {...props}
      onClick={deposit}
      // In MiniPay the button stays active so it can route to Add Cash
      disabled={props.disabled || (hasInsufficientBalance && !isMiniPay)}
      leftIcon={depositing ? undefined : props.leftIcon}
      rightIcon={depositing ? undefined : props.rightIcon}
    >
      {depositing ? (
        <span className="flex items-center justify-center">
          <Loading />
        </span>
      ) : hasInsufficientBalance ? (
        `Need ${missingAmount} More ${DEPOSIT_TOKEN.symbol}`
      ) : (
        label
      )}
    </LocalButton>
  );
};

export default DepositButton;
