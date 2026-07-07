"use client";

import PendingInviteLink from "@/components/pending-invite-link";
import { useCollectiveMembersWithShares } from "@/hooks/use-collective-members";
import { useMemberAliases } from "@/hooks/use-member-aliases";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { CollectiveFund } from "@/hooks/use-collective-fund";
import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { stackMetadataId } from "@/lib/stack-types";
import { formatAddress } from "@/utils/address";
import { getDefaultChainId } from "@/utils/chain";
import { Body, Chip, formatBalance, Heading3 } from "@breadcoop/ui";
import { Icon } from "@phosphor-icons/react";
import {
  EnvelopeOpenIcon,
  HourglassIcon,
  UsersIcon,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { Address, formatEther } from "viem";
import { useReadContracts } from "wagmi";

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

const collectiveContract = {
  address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
  abi: collectiveFundCirclesAbi,
  functionName: "usedNonces",
} as const;

const FundMembers = ({
  id,
  fund,
  member,
  isMember,
}: {
  id: string;
  fund: CollectiveFund;
  member: Address | undefined;
  isMember: boolean;
}) => {
  const fundId = BigInt(id);
  const { positions, isLoading } = useCollectiveMembersWithShares(fundId);
  const members = positions.map((p) => p.member);
  const aliases = useMemberAliases(members);
  const isOwner = !!member && fund.owner.toLowerCase() === member.toLowerCase();

  const { data: stackMetadata } = useStackSupabase(
    stackMetadataId("collective", id),
    isMember
  );

  const totalMembers = isLoading ? "-" : members.length;

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
    ...collectiveContract,
    args: [fundId, nonce],
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

      <div className="*:mb-2 *:last:mb-0">
        {positions.map((position) => {
          const alias = aliases[position.member.toLowerCase()];

          return (
            <div
              key={position.member}
              className="bg-paper-1 py-3 px-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center justify-start gap-2 flex-wrap">
                <Body bold>
                  <Link
                    href={`/account/${position.member}`}
                    className="hover:text-primary-blue"
                  >
                    {alias || formatAddress(position.member)}
                  </Link>
                </Body>
                {position.member.toLowerCase() === fund.owner.toLowerCase() && (
                  <Chip className="font-bold text-blue-1 bg-paper-main border-current text-xs">
                    Fund organizer
                  </Chip>
                )}
              </div>
              <div className="flex items-center justify-between gap-4 md:justify-end">
                <Body>
                  <span className="text-surface-grey">Shares: </span>
                  <span className="font-bold">
                    {formatBalance(+formatEther(position.shares), 2)}
                  </span>
                </Body>
              </div>
            </div>
          );
        })}
      </div>

      {isOwner && pendingInviteLinks.length > 0 && (
        <div>
          <Body bold className="mb-2 text-system-warning">
            Pending invites
          </Body>
          <div className="*:mb-2 *:last:mb-0">
            {pendingInviteLinks.map((link) => (
              <PendingInviteLink key={link} link={link} shorten={false} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default FundMembers;
