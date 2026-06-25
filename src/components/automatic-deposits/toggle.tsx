"use client";

import { Label } from "@/components/label";
import { useModal } from "@/components/modal/context";
import { Switch } from "@/components/switch";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";
import { HandDepositIcon, QuestionIcon } from "@phosphor-icons/react";
import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";

export function AutomaticDeposit({
  stackId,
  depositAmount,
  remainingRounds,
  depositInterval,
  tokenAddress,
}: {
  stackId: string;
  depositAmount: bigint;
  remainingRounds: number;
  depositInterval: bigint;
  tokenAddress: Address;
}) {
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;

  const { data: isEnabled = false, isFetching } = useReadContract({
    abi: automaticSavingCirclesAbi,
    address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isAutomaticDepositsEnabled",
    args: [BigInt(stackId), address!],
    query: { enabled: !!address },
    chainId: getDefaultChainId(),
  });

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
    <div className="mt-4 py-4 border-t border-paper-2">
      <Label className="flex items-center justify-start flex-wrap gap-1">
        <HandDepositIcon size={24} />
        <span className="mr-auto flex items-center gap-1">
          Activate <span className="font-bold">Automatic Deposits</span>
          <QuestionIcon size={16} className="text-surface-grey" />
        </span>
        <Switch
          id="automatic-deposits"
          disabled={isFetching}
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
