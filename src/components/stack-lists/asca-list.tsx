"use client";

import { useAscaMemberFunds } from "@/hooks/use-asca-member-funds";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";
import { formatBps } from "@/lib/asca-state";
import { stackMetadataId, stackTypeDetailPath } from "@/lib/stack-types";
import { Address } from "viem";
import StackCard from "./stack-card";
import StackListSection from "./stack-list-section";

/**
 * The connected member's Savings & Credit funds (ASCA). Rendered feature-gated
 * on the home dashboard (hidden when empty) and on the account page.
 */
const AscaList = ({
  address,
  nameAddress,
  hideWhenEmpty = false,
}: {
  /** Whose funds to list (getMemberFunds reverse index). */
  address: Address | undefined;
  /**
   * Whose Supabase metadata resolves fund names (member-only). Defaults to
   * `address`; on account pages pass the viewer so visitors only see names of
   * funds they also belong to.
   */
  nameAddress?: Address | undefined;
  hideWhenEmpty?: boolean;
}) => {
  const { funds, isLoading } = useAscaMemberFunds(address);
  const { stacksMap } = useUserStacksMetadata(nameAddress ?? address);

  return (
    <StackListSection
      title="Savings & credit funds"
      isLoading={isLoading}
      isEmpty={funds.length === 0}
      hideWhenEmpty={hideWhenEmpty}
      emptyMessage="You haven't joined any savings & credit fund yet."
    >
      {funds.map(({ id, fund }) => {
        const name =
          stacksMap[stackMetadataId("asca", id)]?.stackname ?? `Fund ${id}`;

        return (
          <StackCard
            key={id.toString()}
            href={stackTypeDetailPath("asca", id)}
            name={name}
            chip={
              fund.deactivated
                ? {
                    label: "Deactivated",
                    className: "border-system-red text-system-red",
                  }
                : undefined
            }
            stats={[
              {
                label: "Borrow limit",
                value: `${formatBps(fund.borrowLimitBps)}%`,
              },
              {
                label: "Interest rate",
                value: `${formatBps(fund.interestRateBps)}%`,
              },
            ]}
          />
        );
      })}
    </StackListSection>
  );
};

export default AscaList;
