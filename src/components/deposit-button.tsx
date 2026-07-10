"use client";

import { ButtonProps, useConnectedUser } from "@breadcoop/ui";
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
import { DEPOSIT_TOKEN } from "@/lib/deposit-token";
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

  const { refetch: refetchBalance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress!],
    // Only consulted at click time in MiniPay (see deposit below)
    query: { enabled: false },
    chainId: getDefaultChainId(),
  });

  const needsApproval = useMemo(() => {
    if (!userAddress) return false;
    return allowance < amount;
  }, [allowance, amount, userAddress]);

  const deposit = async () => {
    if (depositing) return;

    // MiniPay only: surface a low balance (fresh read, the cache may be
    // stale) before sending anything, so the result modal can point the
    // user at MiniPay's Deposit flow. Elsewhere behavior is unchanged.
    if (isMiniPay && userAddress) {
      const { data: balance } = await refetchBalance();

      if (balance !== undefined && balance < amount) {
        modal.setModal({
          type: "DEPOSIT_RESULT",
          result: "error",
          msg: `You don't have enough ${DEPOSIT_TOKEN.symbol} to make this deposit.`,
          insufficientBalance: true,
        });
        return;
      }
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
    </LocalButton>
  );
};

export default DepositButton;
