"use client";

import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { Body } from "@breadcoop/ui";
import { Address } from "viem";
import { useBalance } from "wagmi";

export function BreadText({ address }: { address: Address | undefined }) {
  const { data } = useBalance({
    address,
    token: BREAD_TOKEN_ADDRESS,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const text = data
    ? data.value > BigInt(0)
      ? "Stacks wallet has BREAD. You can add more BREAD or fund with xDAI to bake more."
      : "Fund the Stacks wallet with BREAD, or with xDAI to bake BREAD."
    : "...";

  return (
    <Body className="px-1 text-xs leading-4 text-[#155D2A]">
      {text ?? "..."}
    </Body>
  );
}
