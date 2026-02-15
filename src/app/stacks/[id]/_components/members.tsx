import { Body, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";
import { HourglassIcon, UsersIcon } from "@phosphor-icons/react/ssr";
import MembersInfo from "./members-info";
import { Address, formatEther } from "viem";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useReadContracts } from "wagmi";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { LocalStorageCircle, MemberCircleInfo } from "@/interfaces/circle";
import { getDefaultChainId } from "@/utils/chain";
import { useShortenedUrl } from "@/hooks/use-shortened-url";

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
}: {
  id: string;
  member: Address;
  // circle: Exclude<ReturnType<typeof useUserCircleData>["circleData"], undefined>;
  circle: MemberCircleInfo;
}) => {
  const info = useCircleMembersWithBalances(BigInt(id));

  const totalMembers = info.isLoading ? "-" : info.members.length;

  const totalBaseDeposit =
    +formatEther(circle.depositAmount) * Number(circle.currentIndex);

  const isOwner = circle.owner === member;

  console.log("__ IS OWNER __", isOwner);

  const localCircle = (() => {
    const localCircles = localStorage.getItem("circles");
    if (!localCircles) return null;
    try {
      const parsed = JSON.parse(localCircles) as Record<
        string,
        LocalStorageCircle
      >;
      return parsed[id] ?? null;
    } catch {
      return null;
    }
  })();

  const inviteLinks = localCircle?.invite_links ?? [];

  const nonceChecks = inviteLinks
    .map((link) => {
      try {
        const url = new URL(link);
        const nonceStr = url.searchParams.get("nonce");
        if (!nonceStr) return null;
        return BigInt(nonceStr);
      } catch {
        return null;
      }
    })
    .filter((n): n is bigint => n !== null);

  const contracts = nonceChecks.map((nonce) => ({
    ...savingCircleContract,
    args: [BigInt(id), nonce],
    chainId: getDefaultChainId(),
  }));

  const { data: nonceResults, isLoading: isCheckingNonces } = useReadContracts({
    contracts,
    query: {
      enabled: isOwner && contracts.length > 0,
    },
  });

  const pendingInviteLinks = inviteLinks.filter((_, index) => {
    if (!nonceResults || nonceResults.length <= index) return false;
    const result = nonceResults[index];

    if (result.status !== "success") return false;

    return result.result === false;
  });

  const pendingCount = pendingInviteLinks.length;

  const { result: shortenedLinks, isShortening } =
    useShortenedUrl(pendingInviteLinks);

  console.log("__ SHORTENED LINKS __", {
    shortenedLinks,
    isShortening,
    pendingInviteLinks,
  });

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
            title="Pending invites:"
            value={isCheckingNonces ? "…" : pendingCount}
          />
        )}
      </div>

      <MembersInfo
        owner={circle.owner}
        id={id}
        info={info}
        totalBaseDeposit={totalBaseDeposit}
        pendingInviteLinks={
          isOwner ? (isShortening ? pendingInviteLinks : shortenedLinks) : []
        }
      />
    </section>
  );
};

export default StackMembers;
