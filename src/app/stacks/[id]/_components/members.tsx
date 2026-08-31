import { Body, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";
import { HourglassIcon, UsersIcon } from "@phosphor-icons/react/ssr";
import MembersInfo from "./members-info";
import PendingInviteLink from "@/components/pending-invite-link";
import { Address, formatEther } from "viem";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useJoinRequests } from "@/hooks/use-join-requests";
import { ICircleStatus, MemberCircleInfo } from "@/interfaces/circle";

const TopRowInfo = ({
  LIcon,
  title,
  value,
}: {
  LIcon: Icon;
  title: string;
  value: string | number;
}) => {
  return (
    <div className="flex items-center justify-start gap-1.5 p-2">
      <LIcon size={24} className="fill-blue-2" />
      <Body className="text-surface-grey-2">{title}</Body>
      <Body className="text-surface-ink">{value}</Body>
    </div>
  );
};

const StackMembers = ({
  circle,
  id,
  member,
  totalRounds,
  circleStatus,
}: {
  id: string;
  member: Address;
  circle: MemberCircleInfo;
  totalRounds: number;
  circleStatus: ICircleStatus | null;
}) => {
  const info = useCircleMembersWithBalances(BigInt(id));
  const isOwner = circle.owner === member;

  const totalMembers = info.isLoading ? "-" : info.members.length;
  const totalBaseDeposit =
    +formatEther(circle.depositAmount) * Number(circle.currentIndex);

  const isPendingStart = circleStatus === "pending-start";

  const { data: joinRequestsData, isLoading: isLoadingRequests } =
    useJoinRequests(id, circle.owner, isOwner && isPendingStart);
  const pendingJoinRequests = joinRequestsData?.requests ?? [];

  const generalInviteUrl =
    isOwner && isPendingStart
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/stacks/join?circleId=${id}`
      : null;

  return (
    <section className="p-4 flex flex-col gap-4">
      <header>
        <Heading3 className="pb-1 leading-[100%] text-2xl">
          Members ({totalMembers})
        </Heading3>
      </header>

      <div className="border-t border-paper-2 pt-4 md:flex md:items-center md:justify-between">
        <TopRowInfo
          LIcon={UsersIcon}
          title="Total Members:"
          value={totalMembers}
        />

        {isOwner && (
          <TopRowInfo
            LIcon={HourglassIcon}
            title="Pending:"
            value={isLoadingRequests ? "..." : pendingJoinRequests.length}
          />
        )}
      </div>

      {generalInviteUrl && (
        <div className="flex flex-col gap-2">
          <Body bold>Invite link</Body>
          <PendingInviteLink
            link={generalInviteUrl}
            label="Invite link"
            shorten={false}
          />
          <Body className="text-surface-grey-2 text-xs">
            Share this link to invite members. You can remove members before
            launching.
          </Body>
        </div>
      )}

      <MembersInfo
        owner={circle.owner}
        id={id}
        info={info}
        totalBaseDeposit={totalBaseDeposit}
        depositAmount={circle.depositAmount}
        pendingJoinRequests={isOwner ? pendingJoinRequests : []}
        totalRounds={totalRounds}
        circleStartsTimestamp={circle.effectiveCircleStartTime}
        depositInterval={circle.depositInterval}
        circleStatus={circleStatus}
        isOwner={isOwner}
      />
    </section>
  );
};

export default StackMembers;
