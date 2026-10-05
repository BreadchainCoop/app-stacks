"use client";

import { ButtonProps, useConnectedUser } from "@breadcoop/ui";
import { formatAmount } from "@/utils/format-amount";
import { useModal } from "./modal/context";
import { useReadContract } from "wagmi";
import { Address, encodeFunctionData, erc20Abi } from "viem";
import { useMemo, useState } from "react";
import {
  useActiveChainId,
  useChainConfig,
  useDepositToken,
} from "@/components/providers/active-chain";
import { useQueryClient } from "@tanstack/react-query";
import Loading from "@/app/loading";
import { MAX_UINT256 } from "@/utils/solidity";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";
import { DEPOSIT_ERRORS } from "@/lib/contract-errors";
import { formatDepositAmount } from "@/lib/deposit-token";
import { useIsMiniPay } from "@/components/providers/is-minipay";
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
  const depositToken = useDepositToken();
  const [depositing, setDepositing] = useState(false);
  const { savingCircles } = useChainConfig();
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
    args: [userAddress!, savingCircles],
    query: { enabled: !!userAddress },
    chainId: useActiveChainId(),
  });

  const { data: balance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress!],
    query: { enabled: !!userAddress },
    chainId: useActiveChainId(),
  });

  const needsApproval = useMemo(() => {
    if (!userAddress) return false;
    return allowance < amount;
  }, [allowance, amount, userAddress]);

  const hasInsufficientBalance = !!userAddress && balance < amount;

  const missingAmount = hasInsufficientBalance
    ? formatAmount(
        Number(formatDepositAmount(amount - balance, depositToken.decimals)),
        2
      )
    : null;

  const deposit = async () => {
    if (depositing) return;

    // In MiniPay, route a low balance to MiniPay's Deposit flow (via the
    // result modal's Add Cash deeplink) instead of a dead disabled button.
    if (isMiniPay && hasInsufficientBalance) {
      modal.setModal({
        type: "DEPOSIT_RESULT",
        result: "error",
        msg: `You don't have enough ${depositToken.symbol} to make this deposit.`,
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
          args: [savingCircles, MAX_UINT256],
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
      modal.setModal({ type: "DEPOSIT_RESULT", result: "success", circleId });
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
      disabled={
        props.disabled || (hasInsufficientBalance && !isMiniPay) || depositing
      }
      leftIcon={depositing ? undefined : props.leftIcon}
      rightIcon={depositing ? undefined : props.rightIcon}
    >
      {depositing ? (
        <span className="flex items-center justify-center">
          <Loading />
        </span>
      ) : hasInsufficientBalance ? (
        `Need ${missingAmount} More ${depositToken.symbol}`
      ) : (
        label
      )}
    </LocalButton>
  );
};

export default DepositButton;
