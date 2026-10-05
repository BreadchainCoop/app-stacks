"use client";

import { useRouter } from "next/navigation";
import { useChainPath } from "@/components/providers/active-chain";
import { useEffect } from "react";

export const JoinPageSettings = ({ circleId }: { circleId?: bigint }) => {
  const router = useRouter();
  const chainHref = useChainPath();

  useEffect(() => {
    if (circleId) router.prefetch(chainHref(`/stacks/${circleId}`));

    document.querySelector("main")?.classList.remove("page-layout");

    return () => {
      document.querySelector("main")?.classList.add("page-layout");
    };
  }, []);
  return null;
};
