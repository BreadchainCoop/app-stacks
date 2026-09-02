"use client";

import Alert from "@/components/alert";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { Body } from "@breadcoop/ui";
import { AutomaticDeposit } from "./toggle";
import { useAutomaticDepositsEnabled } from "./use-automatic-deposits-enabled";

/**
 * Offered right after a successful claim. Rounds are time-based and
 * `withdraw()` does not open a deposit window, so there is nothing the member
 * can deposit at this point — the only action that keeps the stack alive is
 * letting the keeper deposit for them once each future round opens.
 */
export function PostClaimAutomaticDeposits({ circleId }: { circleId: bigint }) {
  const { circleData } = useUserCircleData({ circleId });
  const { isEnabled, isKnown } = useAutomaticDepositsEnabled(
    circleId.toString()
  );

  // Nothing to offer once automatic deposits are already on, and nothing is
  // rendered until we know, so the warning never flashes for those members.
  if (!circleData || !isKnown || isEnabled) return null;

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

  return (
    <>
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
              The next deposit window only opens when the next round starts. To
              avoid stack failure, activate automatic deposits and we deposit
              for you in every remaining round of this stack.
            </Body>
          </>
        }
        variant="warning"
      />
      <AutomaticDeposit
        className="mt-0 border-t-0"
        stackId={circleId.toString()}
        depositAmount={circleInfo.depositAmount}
        remainingRounds={pendingDeposits}
        depositInterval={circleInfo.depositInterval}
        tokenAddress={circleInfo.token}
      />
    </>
  );
}
