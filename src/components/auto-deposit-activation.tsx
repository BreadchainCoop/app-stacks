"use client";

import { useModal } from "@/components/modal/context";
import LocalButton from "@/components/button";
import { useAutomaticDeposits } from "@/components/automatic-deposits/use-automatic-deposits";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Body, Caption, formatBalance, useConnectedUser } from "@breadcoop/ui";
import {
  ArrowUpIcon,
  CheckCircleIcon,
  HandDepositIcon,
} from "@phosphor-icons/react";
import { erc20Abi, formatEther } from "viem";
import { useReadContract } from "wagmi";

/**
 * Inline "activate automatic deposits" section shown in the deposit-success
 * pop-up. Reuses the existing automatic-deposits activation hook (which grants
 * the ERC20 allowance and enables auto-deposits). It self-fetches everything it
 * needs from the circle id: per-round deposit, remaining rounds, token, and the
 * member's balance — so the caller only has to pass the id.
 *
 * Coverage is expressed against this stack's remaining rounds (the auto-deposit
 * only runs for those), not a generic balance figure. Renders nothing when
 * auto-deposits are already on; when the balance can't cover a single round it
 * surfaces a top-up prompt instead.
 */
export function AutoDepositActivation({ stackId }: { stackId: string }) {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;

  const { circleData } = useUserCircleData({ circleId: BigInt(stackId) });
  const { activate, status, setStatus } = useAutomaticDeposits(stackId);

  const { data: isEnabled = false } = useReadContract({
    abi: automaticSavingCirclesAbi,
    address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isAutomaticDepositsEnabled",
    args: [BigInt(stackId), address!],
    query: { enabled: !!address },
    chainId: getDefaultChainId(),
  });

  const token = circleData?.circleInfo.token;

  const { data: balance = BigInt(0) } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address && !!token },
    chainId: getDefaultChainId(),
  });

  const wrapper = "mt-6 border-t border-paper-2 pt-4 flex flex-col gap-3";

  // The loader and success confirmation render regardless of `isEnabled`:
  // activate() flips that cache to true on success, but the member should still
  // see the step through to completion.
  if (status === "loading") {
    return (
      <div className={wrapper}>
        <div className="flex items-center gap-2">
          <CircularProgressIcon />
          <Body className="text-surface-grey">
            Activating automatic deposits…
          </Body>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className={wrapper}>
        <div className="flex items-center gap-2">
          <CheckCircleIcon
            size={24}
            weight="fill"
            className="text-system-green shrink-0"
          />
          <Body bold className="text-system-green">
            Automatic deposits activated
          </Body>
        </div>
        <Caption className="text-surface-grey">
          Your deposit will be sent automatically each round.
        </Caption>
      </div>
    );
  }

  // Not connected, circle not loaded yet, or already opted in — nothing to offer.
  if (!address || !circleData || isEnabled) return null;

  const depositAmount = circleData.circleInfo.depositAmount;
  const remainingRounds = Math.max(
    0,
    Number(circleData.totalRounds) - Number(circleData.circleInfo.currentIndex)
  );

  // No future rounds left to automate.
  if (remainingRounds < 1) return null;

  const depositUsd = Number(formatEther(depositAmount));
  const balanceUsd = Number(formatEther(balance));
  const roundsCovered =
    depositUsd > 0 ? Math.floor(balanceUsd / depositUsd) : 0;
  // The auto-deposit only runs for the member's remaining rounds in THIS stack,
  // so cap the coverage there rather than showing a generic balance ÷ deposit.
  const coveredRounds = Math.min(roundsCovered, remainingRounds);

  return (
    <div className={wrapper}>
      <div className="flex items-center gap-2">
        <HandDepositIcon size={24} className="fill-primary-blue shrink-0" />
        <Body bold>Activate automatic deposits</Body>
      </div>

      {status === "error" ? (
        <>
          <Body className="text-system-red">
            Something went wrong. Please try again.
          </Body>
          <div className="lifted-button-container">
            <LocalButton
              variant="destructive"
              onClick={() => setStatus("idle")}
            >
              Try again
            </LocalButton>
          </div>
        </>
      ) : roundsCovered < 1 ? (
        <>
          <Body className="text-surface-grey">
            Your balance of ${formatBalance(balanceUsd, 2)} can&apos;t cover a
            round yet. Top up to enable automatic deposits.
          </Body>
          <div className="lifted-button-container">
            <LocalButton
              rightIcon={<ArrowUpIcon />}
              onClick={() => setModal({ type: "FUND_WALLET", address })}
            >
              Top up balance
            </LocalButton>
          </div>
        </>
      ) : (
        <>
          <Body className="text-surface-grey">
            Balance ${formatBalance(balanceUsd, 2)} — covers {coveredRounds} of{" "}
            {remainingRounds} remaining{" "}
            {remainingRounds === 1 ? "round" : "rounds"} in this stack.
            We&apos;ll only move the exact deposit each round.
          </Body>
          <div className="lifted-button-container">
            <LocalButton
              variant="positive"
              rightIcon={<HandDepositIcon />}
              onClick={() =>
                activate({
                  tokenAddress: circleData.circleInfo.token,
                  allowanceAmount: depositAmount * BigInt(remainingRounds),
                })
              }
            >
              Activate automatic deposits
            </LocalButton>
          </div>
        </>
      )}
    </div>
  );
}
