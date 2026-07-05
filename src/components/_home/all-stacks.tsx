"use client";

import CardCarousel from "../card-carousel";
import { useAllCircles } from "@/hooks/use-all-circles";
import Loading from "@/app/loading";
import HomeHeader from "./header";
import { useAppUserId } from "@/hooks/use-app-user-id";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";

const HomeAllStacks = () => {
  const { data, isLoading } = useAllCircles();
  const appUserId = useAppUserId();
  const { stacksMap } = useUserStacksMetadata(appUserId);

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
