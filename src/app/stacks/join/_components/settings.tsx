"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const JoinPageSettings = ({ circleId }: { circleId?: bigint }) => {
  const router = useRouter();

  useEffect(() => {
    if (circleId) router.prefetch(`/stacks/${circleId}`);

    document.querySelector("main")?.classList.remove("page-layout");

    return () => {
      document.querySelector("main")?.classList.add("page-layout");
    };
  }, []);
  return null;
};
