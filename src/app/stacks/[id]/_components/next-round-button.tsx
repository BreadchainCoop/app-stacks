"use client";

import { useEffect, useState } from "react";
import { createTestClient, http, publicActions } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { FastForwardIcon } from "@phosphor-icons/react";
import LocalButton from "@/components/button";
import { foundryChain } from "@/lib/wagmi";
import { clientEnv } from "@/lib/env";
import { isLocalMode } from "@/lib/network-mode";

/**
 * Local mode only: warps Anvil's clock past the current deposit window and
 * mines a block, so the round advances instantly — whether or not every
 * member deposited (matching the contract's behavior for incomplete rounds).
 */
const NextRoundButton = ({
  depositWindowEnd,
}: {
  depositWindowEnd?: bigint;
}) => {
  const queryClient = useQueryClient();
  const [advancing, setAdvancing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isLocalMode()) return null;

  const advance = async () => {
    setAdvancing(true);

    try {
      const testClient = createTestClient({
        chain: foundryChain,
        mode: "anvil",
        transport: http(clientEnv.NEXT_PUBLIC_LOCAL_RPC_URL),
      }).extend(publicActions);

      const block = await testClient.getBlock();
      const target = (depositWindowEnd ?? BigInt(0)) + BigInt(1);

      if (block.timestamp < target) {
        await testClient.setNextBlockTimestamp({ timestamp: target });
      } else {
        // Already past the window (stale read / double click) — nudge forward.
        await testClient.increaseTime({ seconds: 60 });
      }

      await testClient.mine({ blocks: 1 });
      await queryClient.invalidateQueries();
    } catch (err) {
      console.error("Failed to advance round:", err);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <LocalButton
      onClick={advance}
      disabled={advancing}
      variant="secondary"
      leftIcon={<FastForwardIcon size={24} />}
    >
      {advancing ? "Advancing round..." : "Next round"}
    </LocalButton>
  );
};

export default NextRoundButton;
