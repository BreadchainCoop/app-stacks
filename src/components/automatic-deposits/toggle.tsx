"use client";

import { Label } from "@/components/label";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/modal/context";
import { Switch } from "@/components/switch";
import { getDefaultChainId } from "@/utils/chain";
import { HandDepositIcon } from "@phosphor-icons/react";
import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { useAutomaticDepositsEnabled } from "./use-automatic-deposits-enabled";

export function AutomaticDeposit({
  stackId,
  depositAmount,
  remainingRounds,
  depositInterval,
  tokenAddress,
  disabled = false,
  className,
}: {
  stackId: string;
  depositAmount: bigint;
  remainingRounds: number;
  depositInterval: bigint;
  tokenAddress: Address;
  disabled?: boolean;
  className?: string;
}) {
  const { setModal } = useModal();
  const { address, isEnabled, isFetching } =
    useAutomaticDepositsEnabled(stackId);

  const { data: balance = BigInt(0) } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address!],
    query: { enabled: !!address },
    chainId: getDefaultChainId(),
  });

  if (!address) return null;

  return (
    <div className={cn("mt-4 py-4 border-t border-paper-2", className)}>
      <Label className="flex items-center justify-start flex-wrap gap-1">
        <HandDepositIcon size={24} />
        <span className="mr-auto flex items-center gap-1">
          Activate <span className="font-bold">Automatic Deposits</span>
          {/* <QuestionIcon size={16} className="text-surface-grey" /> */}
        </span>
        <Switch
          id="automatic-deposits"
          disabled={isFetching || disabled}
          checked={isEnabled}
          onCheckedChange={() =>
            setModal({
              type: "AUTOMATIC_DEPOSITS",
              stackId,
              currentValue: isEnabled,
              depositAmount,
              remainingRounds,
              depositInterval,
              tokenAddress,
              address,
              balance,
            })
          }
        />
      </Label>
    </div>
  );
}
