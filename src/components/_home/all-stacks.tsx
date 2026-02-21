"use client";

import CardCarousel from "../card-carousel";
import { useAllCircles } from "@/hooks/use-all-circles";
import Loading from "@/app/loading";
import HomeHeader from "./header";

const HomeAllStacks = () => {
  const { data, isLoading } = useAllCircles();

  return (
    <section className="mt-6">
      <HomeHeader type="all" />
      <div className="mt-6">
        {isLoading ? <Loading /> : <CardCarousel circles={data} />}
      </div>
    </section>
  );
};

export default HomeAllStacks;
