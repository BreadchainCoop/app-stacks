"use client";

import { formatAmount } from "@/utils/format-amount";
import { Body } from "@breadcoop/ui";
import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { formatDepositAmount } from "@/lib/deposit-token";
import {
  useActiveChainId,
  useDepositToken,
} from "@/components/providers/active-chain";

const StacksBalance = ({ address }: { address: Address }) => {
  // Read directly instead of @breadcoop/ui's useBreadBalance, which hardcodes
  // 18 decimals and misreports 6-decimal deposit tokens (USDT/USDC on Celo).
  const { data } = useReadContract({
    address: useDepositToken().address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: useActiveChainId(),
    query: { enabled: Boolean(address) },
  });

  return (
    <Body className="text-surface-grey text-xs">
      Stacks account Balance: $
      {formatAmount(
        parseFloat(
          formatDepositAmount(data ?? BigInt(0), useDepositToken().decimals)
        )
      )}
    </Body>
  );
};

export default StacksBalance;
