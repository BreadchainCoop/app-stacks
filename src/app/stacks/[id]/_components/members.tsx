import { Body, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";
import {
  EnvelopeOpenIcon,
  HourglassIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";
import MembersInfo from "./members-info";
import { Address, formatEther } from "viem";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useReadContracts } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { MemberCircleInfo } from "@/interfaces/circle";
import { getDefaultChainId } from "@/utils/chain";
import { useStackSupabase } from "@/hooks/use-stack-supabase";

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

const savingCircleContract = {
  address: SAVING_CIRCLES_CONTRACT_ADDRESS,
  abi: savingCirclesAbi,
  functionName: "usedNonces",
} as const;

const StackMembers = ({
  circle,
  id,
  member,
  isMember,
  isFinished,
}: {
  id: string;
  member: Address;
  circle: MemberCircleInfo;
  isMember: boolean;
  isFinished: boolean;
}) => {
  const info = useCircleMembersWithBalances(BigInt(id));
  const isOwner = circle.owner === member;

  const { data: stackMetadata } = useStackSupabase(id, isMember);

  const totalMembers = info.isLoading ? "-" : info.members.length;
  const totalBaseDeposit =
    +formatEther(circle.depositAmount) * Number(circle.currentIndex);

  const nonceChecks = (stackMetadata?.invite_links ?? [])
    .map((link) => {
      try {
        const url = new URL(link.long);
        const nonceStr = url.searchParams.get("nonce");
        if (!nonceStr) return null;
        return { nonce: BigInt(nonceStr), short: link.short };
      } catch {
        return null;
      }
    })
    .filter((n): n is { nonce: bigint; short: string } => n !== null);

  const contracts = nonceChecks.map(({ nonce }) => ({
    ...savingCircleContract,
    args: [BigInt(id), nonce],
    chainId: getDefaultChainId(),
  }));

  const { data: nonceResults, isLoading: isCheckingNonces } = useReadContracts({
    contracts,
    query: {
      enabled: isMember && contracts.length > 0,
    },
  });

  const pendingInviteLinks = nonceChecks
    .filter((_, index) => {
      if (!nonceResults || nonceResults.length <= index) return false;
      const result = nonceResults[index];
      if (result.status !== "success") return false;
      return result.result === false;
    })
    .map((link) => link.short);

  const pendingCount = pendingInviteLinks.length;

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

        {isMember && (
          <>
            <TopRowInfo
              LIcon={EnvelopeOpenIcon}
              title="Invited:"
              value={stackMetadata?.invite_links.length || "..."}
            />
            <TopRowInfo
              LIcon={HourglassIcon}
              title="Pending:"
              value={isCheckingNonces ? "..." : pendingCount}
            />
          </>
        )}
      </div>

      <MembersInfo
        owner={circle.owner}
        id={id}
        info={info}
        totalBaseDeposit={totalBaseDeposit}
        isFinished={isFinished}
        pendingInviteLinks={isOwner ? pendingInviteLinks : []}
      />
    </section>
  );
};

export default StackMembers;
