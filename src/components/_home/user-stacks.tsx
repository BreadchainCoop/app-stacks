"use client";

import Loading from "@/app/loading";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Address } from "viem";
import CardCarousel from "../card-carousel";
import { useSearchParams } from "next/navigation";
import { tabs } from "./tab";
import { Body } from "@breadcoop/ui";
import { usePrivy } from "@privy-io/react-auth";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";

type Tab = "due" | "claim" | "past" | "all";

const pastRoundStates = ["finished", "failed"];

const hasFailedClaim = (circle: {
  status?: string;
  isDecommissionable?: boolean;
  userBalance?: bigint;
}) =>
  circle.status === "failed" &&
  circle.isDecommissionable &&
  Boolean(circle.userBalance && circle.userBalance > BigInt(0));

const HomeUserStacks = ({ address }: { address: Address }) => {
  const userCirclesList = useUserCirclesList(address);
  const { user } = usePrivy();
  const { stacksMap } = useUserStacksMetadata(user?.id);
  const { isLoading } = userCirclesList;
  let { circles } = userCirclesList;
  const tab = (useSearchParams().get("tab") || "all") as Tab;

  if (tabs.find((t) => t.id === tab)) {
    circles = [...circles].filter((c) => {
      if (tab === "due") return c.status === "payment_due";

      if (tab === "claim") return c.status === "claimable" || hasFailedClaim(c);

      if (tab === "past") {
        if (!c.roundState) return false;

        return pastRoundStates.includes(c.roundState);
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
          {circles.length === 0 ? (
            <Body className="text-center">No stacks</Body>
          ) : (
            <CardCarousel circles={circles} stacksMap={stacksMap} />
          )}
        </>
      )}
    </div>
  );
};

export default HomeUserStacks;
