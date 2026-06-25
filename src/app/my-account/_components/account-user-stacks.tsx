"use client";

import Loading from "@/app/loading";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Address } from "viem";
import CardCarousel from "@/components/card-carousel";
import { useSearchParams } from "next/navigation";
import { tabs } from "./account-tab";
import { Body, Heading3 } from "@breadcoop/ui";
import { usePrivy } from "@privy-io/react-auth";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";

type Tab = "due" | "claim" | "past" | "all";

const pastStatuses = ["decommissioned", "finished", "failed", "expired"];

const emptyMessages: Record<Exclude<Tab, "all">, [string, string]> = {
  claim: [
    "You're all caught up — nothing to claim yet.",
    "We'll notify you when your payout is ready.",
  ],
  due: [
    "All clear — no payments pending.",
    "We'll remind you before your next one is due.",
  ],
  past: [
    "No completed Stacks yet.",
    "Once a Stack has been finalized, you will find it here",
  ],
};

const hasFailedClaim = (circle: {
  status?: string;
  isDecommissionable?: boolean;
  userBalance?: bigint;
}) =>
  circle.status === "failed" &&
  circle.isDecommissionable &&
  Boolean(circle.userBalance && circle.userBalance > BigInt(0));

const AccountUserStacks = ({ address }: { address: Address }) => {
  const { isLoading, circles } = useUserCirclesList(address);
  const { user } = usePrivy();
  const { stacksMap } = useUserStacksMetadata(user?.id);
  const tab = (useSearchParams().get("tab") || "all") as Tab;
  let filteredCircles = [...circles];

  if (tabs.find((t) => t.id === tab)) {
    filteredCircles = [...filteredCircles].filter((c) => {
      if (tab === "due") return c.status === "payment_due";

      // `canWithdraw` (not just status === "claimable") so that finished/expired
      // stacks the member still has an unclaimed payout on stay claimable here.
      if (tab === "claim") return Boolean(c.canWithdraw) || hasFailedClaim(c);

      if (tab === "past") {
        if (!c.status) return false;

        return pastStatuses.includes(c.status);
      }

      return true;
    });
  }

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {filteredCircles.length === 0 ? (
            <>
              {circles.length === 0 || tab === "all" ? (
                <>
                  <Heading3 className="mb-6 text-2xl">
                    You haven&apos;t joined any Stack yet.
                  </Heading3>
                  <Body className="mb-16">
                    Create your own or join a public stack today.
                  </Body>
                </>
              ) : (
                <>
                  <Heading3 className="mb-6 text-2xl">
                    {emptyMessages[tab][0]}
                  </Heading3>
                  <Body className="mb-16">{emptyMessages[tab][1]}</Body>
                </>
              )}
            </>
          ) : (
            <CardCarousel circles={filteredCircles} stacksMap={stacksMap} />
          )}
        </>
      )}
    </div>
  );
};

export default AccountUserStacks;
