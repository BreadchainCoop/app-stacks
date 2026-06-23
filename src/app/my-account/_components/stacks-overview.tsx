"use client";

import Loading from "@/app/loading";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Address } from "viem";
import AccountOverviewCard from "./account-overview-card";
import YourStacks from "./your-stacks";

const StacksOverview = ({ address }: { address: Address }) => {
  const { circles, financialSummary, isLoading } = useUserCirclesList(address);

  return (
    <section className="flex flex-col gap-6">
      {isLoading ? (
        <Loading />
      ) : (
        <AccountOverviewCard
          address={address}
          circles={circles}
          financialSummary={financialSummary}
        />
      )}
      <YourStacks address={address} />
    </section>
  );
};

export default StacksOverview;
