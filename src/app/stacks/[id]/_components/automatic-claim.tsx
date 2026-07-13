"use client";

import { Label } from "@/components/label";
import { useModal } from "@/components/modal/context";
import { Switch } from "@/components/switch";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useConnectedUser } from "@breadcoop/ui";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useReadContract } from "wagmi";

export function AutomaticClaim({
  stackId,
  disabled = false,
}: {
  stackId: string;
  disabled?: boolean;
}) {
  const { setModal } = useModal();

  const { user } = useConnectedUser();
  const address = user.status === "CONNECTED" ? user.address : undefined;

  const { data: isEnabled = false, isFetching } = useReadContract({
    abi: automaticSavingCirclesAbi,
    address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "isAutomaticClaimsEnabled",
    args: [BigInt(stackId), address!],
    query: { enabled: !!address },
    chainId: getDefaultChainId(),
  });

  return (
    <div className="mt-2">
      <Label className="flex items-center justify-start flex-wrap gap-1">
        <HandWithdrawIcon size={24} />
        <span className="mr-auto flex items-center gap-1">
          Activate <span className="font-bold">Automatic Claims</span>
        </span>
        <Switch
          id="automatic-claims"
          disabled={isFetching || disabled}
          checked={isEnabled}
          onCheckedChange={() =>
            setModal({
              type: "AUTOMATIC_CLAIMS",
              stackId,
              currentValue: isEnabled,
            })
          }
        />
      </Label>
    </div>
  );
}
