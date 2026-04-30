"use client";

import CardCarousel from "../card-carousel";
import { useAllCircles } from "@/hooks/use-all-circles";
import Loading from "@/app/loading";
import HomeHeader from "./header";
import { usePrivy } from "@privy-io/react-auth";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";
import { Body } from "@breadcoop/ui";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useState } from "react";

const HomeAllStacks = () => {
  const [page, setPage] = useState(0);
  const { data, isLoading, hasMore, total } = useAllCircles(page);
  const { user } = usePrivy();
  const { stacksMap } = useUserStacksMetadata(user?.id);
  const canGoBack = page > 0 && !isLoading;
  const canGoForward = hasMore && !isLoading;

  return (
    <section className="mt-6">
      <HomeHeader type="all" />
      <div className="mt-6">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <CardCarousel circles={data} stacksMap={stacksMap} />
            {total > 9 && (
              <div className="flex items-center justify-center gap-4 py-2">
                <button
                  onClick={() => setPage((current) => Math.max(0, current - 1))}
                  disabled={!canGoBack}
                  className="transition-colors text-primary-blue disabled:opacity-20"
                  aria-label="Previous stacks page"
                  type="button"
                >
                  <CaretLeftIcon className="w-6 h-6" />
                </button>

                <Body bold>Page {page + 1}</Body>

                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!canGoForward}
                  className="transition-colors text-primary-blue disabled:opacity-20"
                  aria-label="Next stacks page"
                  type="button"
                >
                  <CaretRightIcon className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default HomeAllStacks;
