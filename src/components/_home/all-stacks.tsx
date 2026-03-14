"use client";

import CardCarousel from "../card-carousel";
import { useAllCircles } from "@/hooks/use-all-circles";
import Loading from "@/app/loading";
import HomeHeader from "./header";
import { usePrivy } from "@privy-io/react-auth";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";

const HomeAllStacks = () => {
  const { data, isLoading } = useAllCircles();
  const { user } = usePrivy();
  const { stacksMap } = useUserStacksMetadata(user?.id);

  return (
    <section className="mt-6">
      <HomeHeader type="all" />
      <div className="mt-6">
        {isLoading ? (
          <Loading />
        ) : (
          <CardCarousel circles={data} stacksMap={stacksMap} />
        )}
      </div>
    </section>
  );
};

export default HomeAllStacks;
