"use client";

import { clientEnv } from "@/lib/env";
import { useConnectedUser } from "@breadcoop/ui";
import { useEffect } from "react";
import { sepolia } from "viem/chains";

const SepoliaAutoFund = () => {
  const { user } = useConnectedUser();

  useEffect(() => {
    if (
      clientEnv.NEXT_PUBLIC_CHAIN_ID !== sepolia.id ||
      !(user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN")
    )
      return;

    (async () => {
      try {
        await fetch("/api/funding/sepolia-embedded", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: user.address }),
        });
      } catch {
        void 0;
      }
    })();
    return () => {};
    // @ts-expect-error Assume address is present
  }, [user.status, user.address]);

  return null;
};

export default SepoliaAutoFund;
