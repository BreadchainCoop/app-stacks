"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  AccordionItem,
} from "@/components/accordion";
import PendingInviteLink from "@/components/pending-invite-link";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { useGetLastDeposit } from "@/hooks/use-get-last-deposit";
import { useInviteRedeemed } from "@/hooks/use-invite-redeemed";
import { usePreferredEnsName } from "@/hooks/use-preferred-ens-name";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import { ICircleStatus } from "@/interfaces/circle";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState } from "@/lib/circle-state";
import { useMemberAliases } from "@/hooks/use-member-aliases";
import { formatRelativeTime, formatShortDate } from "@/utils/time";
import { Body, Chip, formatBalance } from "@breadcoop/ui";
import { Address, formatEther } from "viem";
import { networks } from "@/utils/network";
import { clientEnv } from "@/lib/env";

const FAILED_STATUSES: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

function DepositRow({ label, body }: { label: string; body: string }) {
  return (
    <div className="flex items-center justify-between mb-2.5 last:mb-0">
      <Body>{label}</Body>
      <Body bold>{body}</Body>
    </div>
  );
}

const MembersInfo = ({
  owner,
  info,
  id,
  totalBaseDeposit,
  pendingInviteLinks,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  owner: Address;
  id: string;
  info: ReturnType<typeof useCircleMembersWithBalances>;
  totalBaseDeposit: number;
  pendingInviteLinks?: string[];
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) => {
  const aliases = useMemberAliases(info.members);

  return (
    <div>
      <Accordion>
        {info.members.map((member, index) => {
          const totalDeposits = +formatEther(
            info.memberBalances?.balances[index] || BigInt(0)
          );
          const alias = aliases[member.toLowerCase()];

          return (
            <AccordionItem key={member} value={member}>
              <AccordionHeader>
                <div className="flex items-center justify-start gap-4">
                  {member === owner ? (
                    <>
                      <Body bold>
                        <MemberEnsName address={owner} alias={alias} />
                      </Body>
                      <Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
                        Group owner
                      </Chip>
                    </>
                  ) : (
                    <Body bold>
                      <MemberEnsName address={member} alias={alias} />
                    </Body>
                  )}
                </div>
              </AccordionHeader>
              <AccordionContent>
                <MemberInfoContent
                  totalDeposits={String(totalDeposits + totalBaseDeposit)}
                  member={member}
                  circleId={id}
                  isOWner={member.toLowerCase() === owner.toLowerCase()}
                  totalRounds={totalRounds}
                  circleStartsTimestamp={circleStartsTimestamp}
                  depositInterval={depositInterval}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
        {pendingInviteLinks?.map((link) => (
          <AccordionItem value={link} key={link}>
            <AccordionHeader>
              <div className="flex items-center justify-start gap-x-4 gap-y-1 flex-wrap">
                <Body bold className="text-system-warning">
                  Pending Invite
                </Body>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <PendingInviteLink link={link} shorten={false} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

function MemberInfoContent({
  totalDeposits,
  member,
  isOWner,
  circleId,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  totalDeposits: string;
  member: Address;
  isOWner: boolean;
  circleId: string;
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) {
  const now = useBlockTimestamp();
  const { data: creationTimestamp } = useGetCircleCreated({
    circleId,
    enabled: isOWner,
  });
  const { data: redeemedTimestamp } = useInviteRedeemed({
    circleId,
    member,
    enabled: !isOWner,
  });
  const circleData = useUserCircleData({
    circleId: BigInt(circleId),
    member,
  });
  const { lastDepositTime } = useGetLastDeposit({
    circleId,
    enabled: true,
    member,
  });

  const nowSeconds = BigInt(Math.floor(now / 1000));
  const { circleState } = useCircleState(BigInt(circleId));
  const formattedStatus = circleData.circleData
    ? getUserCircleStatus({
        circle: circleData.circleData,
        now: nowSeconds,
        circleState: circleState ?? CircleState.Active,
      })
    : null;
  const isFailedStack = formattedStatus
    ? FAILED_STATUSES.includes(formattedStatus.status)
    : false;

  const fundsDeposited = useFundsDeposited({
    circleId,
    enabled: isFailedStack,
    totalRounds,
    circleStartsTimestamp,
    depositInterval,
  });

  let memberTotal = "-";

  if (isFailedStack) {
    if (fundsDeposited.data) {
      memberTotal = formatBalance(
        +formatEther(
          (
            fundsDeposited.data.depositsByMember[
              member.toLowerCase() as Address
            ] ?? []
          ).reduce((sum, d) => sum + d.amount, BigInt(0))
        ),
        2
      );
    }
  } else {
    memberTotal = totalDeposits;
  }

  const joinedTimestamp = creationTimestamp || redeemedTimestamp;

  let daysNextDeposit: number | undefined;

  if (circleData.circleData) {
    daysNextDeposit =
      circleData.circleData.circleInfo.effectiveCircleStartTime === BigInt(0)
        ? undefined
        : Math.ceil(
            (Number(circleData.circleData.depositWindowEnd) - now / 1000) /
              86_400
          );
  }

  if (daysNextDeposit !== undefined) {
    daysNextDeposit = Math.max(0, daysNextDeposit);
  }

  return (
    <div>
      <DepositRow
        label="Next deposit"
        body={
          daysNextDeposit
            ? `${daysNextDeposit} ${daysNextDeposit === 1 ? "day" : "days"}`
            : "-"
        }
      />
      <DepositRow
        label="Last deposit"
        body={`${
          lastDepositTime
            ? formatRelativeTime(lastDepositTime, new Date(now))
            : "-"
        }`}
      />
      {/* <DepositRow label="Total deposits" body={`${memberTotal} BREAD`} /> */}
      <DepositRow
        label="Total deposits"
        body={
          isFailedStack && fundsDeposited.isLoading
            ? "Loading"
            : isFailedStack && fundsDeposited.error
              ? "Error"
              : `${memberTotal} BREAD`
        }
      />
      <DepositRow
        label="Joined"
        body={joinedTimestamp ? formatShortDate(joinedTimestamp) : "-"}
      />
    </div>
  );
}

function MemberEnsName({
  address,
  alias,
}: {
  address: Address;
  alias?: string | null;
}) {
  const { ensName, isLoading } = usePreferredEnsName({ address });

  if (alias) {
    return (
      <a
        href={`${networks[clientEnv.NEXT_PUBLIC_CHAIN_ID as keyof typeof networks].explorerUrl}/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-primary-blue"
      >
        <span className="inline-flex items-center justify-start">{alias}</span>
      </a>
    );
  }

  return (
    <span className="inline-flex items-center justify-start">
      {isLoading ? "Loading..." : ensName || address}
    </span>
  );
}

export default MembersInfo;
