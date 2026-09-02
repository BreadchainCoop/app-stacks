"use client";

import Alert from "@/components/alert";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { getDefaultChainId } from "@/utils/chain";
import { Body } from "@breadcoop/ui";
import { ArrowUpIcon, HandDepositIcon } from "@phosphor-icons/react";
import { erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { breadLabel } from "./modal/shared";
import { useAutomaticDepositsEnabled } from "./use-automatic-deposits-enabled";

/**
 * Offers automatic deposits from the claim- and deposit-success pop-ups.
 *
 * After a claim there is nothing the member can deposit yet: rounds are
 * time-based and `withdraw()` does not open a deposit window, so the only
 * action that keeps the stack alive is letting the keeper deposit for them
 * once each future round opens.
 *
 * The button hands off to the activation modal rather than approving inline —
 * activating grants an ERC20 spending permission, which the member should see
 * spelled out before they grant it.
 */
export function AutomaticDepositsPrompt({
  circleId,
  context,
}: {
  circleId: bigint;
  context: "post-claim" | "post-deposit";
}) {
  const { setModal } = useModal();
  const stackId = circleId.toString();
  const { circleData } = useUserCircleData({ circleId });
  const { address, isEnabled, isKnown } = useAutomaticDepositsEnabled(stackId);

  const token = circleData?.circleInfo.token;

  const { data: balance = BigInt(0) } = useReadContract({
    abi: erc20Abi,
    address: token,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address && !!token },
    chainId: getDefaultChainId(),
  });

  // Nothing to offer once automatic deposits are on, and nothing is rendered
  // until we know, so the prompt never flashes for members who already opted in.
  if (!address || !circleData || !isKnown || isEnabled) return null;

  const { circleInfo, totalRounds, userBalance } = circleData;
  // Deposits the keeper would still owe: every round after the current one,
  // plus the current one when the member has not paid it yet — which is the
  // case when they claim late, after their own round has already passed.
  const hasDepositedThisRound = userBalance >= circleInfo.depositAmount;
  const pendingDeposits =
    Number(totalRounds) -
    Number(circleInfo.currentIndex) -
    (hasDepositedThisRound ? 1 : 0);

  if (pendingDeposits <= 0) return null;

  const totalDeposit = circleInfo.depositAmount * BigInt(pendingDeposits);
  // Activation approves the whole remaining run in one go, so a member who
  // cannot cover it is sent to top up instead of into the modal's dead end.
  const canCoverRemaining = balance >= totalDeposit;

  const openActivation = () =>
    setModal({
      type: "AUTOMATIC_DEPOSITS",
      stackId,
      currentValue: false,
      depositAmount: circleInfo.depositAmount,
      remainingRounds: pendingDeposits,
      depositInterval: circleInfo.depositInterval,
      tokenAddress: circleInfo.token,
      address,
      balance,
      // The pitch is already made here — go straight to what is being granted.
      startAtSummary: true,
    });

  return (
    <>
      {context === "post-claim" ? (
        <Alert
          className="-mt-4"
          closeAble={false}
          title="IMPORTANT: Secure your next deposits"
          description={
            <>
              <Body>
                <span className="font-bold">{pendingDeposits} </span>
                {pendingDeposits === 1 ? "deposit" : "deposits"} left in this
                stack.
              </Body>
              <Body>
                The next deposit window only opens when the next round starts.
                To avoid stack failure, activate automatic deposits and we
                deposit for you in every remaining round of this stack.
              </Body>
            </>
          }
          variant="warning"
        />
      ) : (
        <div className="flex flex-col gap-1">
          <Body bold className="flex items-center gap-2">
            <HandDepositIcon size={24} className="fill-primary-blue shrink-0" />
            Never miss a round
          </Body>
          <Body className="text-surface-grey">
            Activate automatic deposits and we cover your remaining{" "}
            <span className="font-bold">{pendingDeposits}</span>{" "}
            {pendingDeposits === 1 ? "deposit" : "deposits"} in this stack, one
            per round.
          </Body>
        </div>
      )}

      {canCoverRemaining ? (
        <div className="lifted-button-container">
          <LocalButton
            variant="positive"
            rightIcon={<HandDepositIcon />}
            onClick={openActivation}
          >
            Activate automatic deposits
          </LocalButton>
        </div>
      ) : (
        <>
          <Body className="text-surface-grey">
            Covering {pendingDeposits}{" "}
            {pendingDeposits === 1 ? "deposit" : "deposits"} takes{" "}
            {breadLabel(totalDeposit)} and you hold {breadLabel(balance)}. Top
            up to activate.
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
      )}
    </>
  );
}
