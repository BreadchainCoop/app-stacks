"use client";

import { useCollectiveMemberFunds } from "@/hooks/use-collective-member-funds";
import { formatBps } from "@/lib/asca-state";
import { stackTypeDetailPath } from "@/lib/stack-types";
import { formatBalance } from "@breadcoop/ui";
import { Address, formatEther } from "viem";
import StackCard from "./stack-card";
import StackListSection from "./stack-list-section";

/**
 * The connected member's Collective funds. Fund names are on-chain
 * (white-label), so no Supabase lookup is needed. Rendered feature-gated on
 * the home dashboard (hidden when empty) and on the account page.
 */
const CollectiveList = ({
  address,
  hideWhenEmpty = false,
}: {
  address: Address | undefined;
  hideWhenEmpty?: boolean;
}) => {
  const { funds, isLoading } = useCollectiveMemberFunds(address);

  return (
    <StackListSection
      title="Collective funds"
      isLoading={isLoading}
      isEmpty={funds.length === 0}
      hideWhenEmpty={hideWhenEmpty}
      emptyMessage="You haven't joined any collective fund yet."
    >
      {funds.map(({ id, fund }) => (
        <StackCard
          key={id.toString()}
          href={stackTypeDetailPath("collective", id)}
          name={fund.name || `Fund ${id}`}
          stats={[
            {
              label: "Pool balance",
              value: `${formatBalance(+formatEther(fund.poolBalance), 2)} BREAD`,
            },
            {
              label: "Approval threshold",
              value: `${formatBps(fund.approvalThresholdBps)}%`,
            },
          ]}
        />
      ))}
    </StackListSection>
  );
};

export default CollectiveList;
