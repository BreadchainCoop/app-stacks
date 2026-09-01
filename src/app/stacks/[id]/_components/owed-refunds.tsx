"use client";

import Alert from "@/components/alert";
import BreadInfoNote from "@/components/bread-info-note";
import { DisplayName } from "@/components/display-name";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import { useMembersClaimed } from "@/hooks/use-members-claimed";
import { Body, Caption, Heading3, formatBalance } from "@breadcoop/ui";
import { HandCoinsIcon } from "@phosphor-icons/react";
import { Address, formatEther } from "viem";

/**
 * On a failed (decommissionable) stack, lists every member who never claimed
 * and the amount they're owed back, so they know what they'll recover when the
 * stack is retired. Owed = the per-round deposit amount × the number of rounds
 * that member deposited into (they never claimed a payout). BREAD is USD-pegged
 * 1:1, so the figure is shown in USD.
 */
const OwedRefunds = ({
  id,
  depositAmount,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  id: string;
  depositAmount: bigint;
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) => {
  const info = useCircleMembersWithBalances(BigInt(id));
  const { claimedByMember, isLoading: claimedLoading } = useMembersClaimed({
    circleId: id,
    members: info.members,
  });
  const fundsDeposited = useFundsDeposited({
    circleId: id,
    enabled: true,
    totalRounds,
    circleStartsTimestamp,
    depositInterval,
  });

  const depositAmountUsd = Number(formatEther(depositAmount));

  const isLoading =
    info.isLoading || claimedLoading || fundsDeposited.isLoading;

  const rows = info.members
    .filter((member) => !claimedByMember[member.toLowerCase()])
    .map((member) => {
      const rounds =
        fundsDeposited.data?.depositsByMember[member.toLowerCase() as Address]
          ?.length ?? 0;
      return { member, rounds, owed: rounds * depositAmountUsd };
    })
    .filter((row) => row.owed > 0);

  const total = rows.reduce((sum, row) => sum + row.owed, 0);

  // Only surface the section when there are members who never got to claim and
  // are owed a refund; otherwise render nothing (including while loading).
  if (isLoading || rows.length === 0) return null;

  return (
    <section className="bg-paper-0 flex flex-col gap-4 p-4">
      <header className="flex items-center gap-2">
        <HandCoinsIcon size={24} className="fill-blue-2 shrink-0" />
        <Heading3 className="text-2xl">Refunds owed</Heading3>
      </header>

      <Alert
        variant="stop"
        title="This Stack failed"
        description="Members who never claimed are owed their deposits back."
        closeAble={false}
      />

      <div>
        {rows.map(({ member, rounds, owed }) => (
          <div
            key={member}
            className="bg-paper-1 py-2 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 mb-2 last:mb-0"
          >
            <div className="flex flex-col">
              <Body bold>
                <DisplayName address={member} />
              </Body>
              <Caption className="text-surface-grey">
                {rounds} {rounds === 1 ? "round" : "rounds"} × $
                {formatBalance(depositAmountUsd, 2)}
              </Caption>
            </div>
            <Body bold className="text-system-red shrink-0">
              -${formatBalance(owed, 2)}
            </Body>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 px-4 sm:px-6">
        <Body bold>Total owed</Body>
        <Body bold className="text-system-red shrink-0">
          -${formatBalance(total, 2)}
        </Body>
      </div>

      <BreadInfoNote>Amounts are shown in USD.</BreadInfoNote>
    </section>
  );
};

export default OwedRefunds;
