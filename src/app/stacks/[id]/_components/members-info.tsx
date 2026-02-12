"use client";

import {
  Accordion,
  AccordionHeader,
  AccordionContent,
  AccordionItem,
} from "@/components/accordion";
import PendingInviteLink from "@/components/pending-invite-link";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { useGetLastDeposit } from "@/hooks/use-get-last-deposit";
import { useInviteRedeemed } from "@/hooks/use-invite-redeemed";
import { usePreferredEnsName } from "@/hooks/use-preferred-ens-name";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { formatRelativeTime, formatShortDate } from "@/utils/time";
import { Body, Chip } from "@breadcoop/ui";
import { Address, formatEther } from "viem";

// type PendingNonces = (
//   | {
//       error?: undefined;
//       result: boolean;
//       status: "success";
//     }
//   | {
//       error: Error;
//       result?: undefined;
//       status: "failure";
//     }
// )[];

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
}: {
  owner: Address;
  id: string;
  info: ReturnType<typeof useCircleMembersWithBalances>;
  totalBaseDeposit: number;
  pendingInviteLinks?: string[];
}) => {
  return (
    <div>
      <Accordion>
        {info.members.map((member, index) => {
          const totalDeposits = +formatEther(
            info.memberBalances?.balances[index] || BigInt(0)
          );

          return (
            <AccordionItem key={member} value={member}>
              <AccordionHeader>
                <div className="flex items-center justify-start gap-4">
                  {member === owner ? (
                    <>
                      <Body bold>
                        <MemberEnsName address={owner} />
                      </Body>
                      <Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
                        Group owner
                      </Chip>
                    </>
                  ) : (
                    <Body bold>
                      <MemberEnsName address={member} />
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
              <PendingInviteLink link={link} />
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
}: {
  totalDeposits: string;
  member: Address;
  isOWner: boolean;
  circleId: string;
}) {
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
  const joinedTimestamp = creationTimestamp || redeemedTimestamp;

  let daysNextDeposit: number | undefined;

  if (circleData.circleData) {
    daysNextDeposit =
      circleData.circleData.circleInfo.effectiveCircleStartTime === BigInt(0)
        ? undefined
        : Math.ceil(
            (Number(circleData.circleData.depositWindowEnd) -
              Date.now() / 1000) /
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
        body={`${lastDepositTime ? formatRelativeTime(lastDepositTime) : "-"}`}
      />
      <DepositRow label="Total deposits" body={`${totalDeposits} BREAD`} />
      <DepositRow
        label="Joined"
        body={joinedTimestamp ? formatShortDate(joinedTimestamp) : "-"}
      />
    </div>
  );
}

function MemberEnsName({ address }: { address: Address }) {
  const { ensName, isLoading } = usePreferredEnsName({ address });

  return (
    <span className="inline-flex items-center justify-start">
      {isLoading ? "Loading..." : ensName || address}
    </span>
  );
}

export default MembersInfo;
