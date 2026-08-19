"use client";

import { Switch } from "@/components/switch";
import { useModal } from "@/components/modal/context";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { Body } from "@breadcoop/ui";
import { Address } from "viem";
import { useReadContracts } from "wagmi";

/**
 * Account-level "automatic claims" toggle. Reflects the aggregate state across
 * the user's current stacks — on only when every stack has it enabled — and
 * flipping it opens a confirmation modal that updates each stack (one tx per
 * stack, only the ones that need changing). There is no account-level contract
 * flag, so this cannot affect stacks the user joins later.
 */
export function AccountAutomaticClaims({
  address,
  circleIds,
}: {
  address: Address;
  circleIds: bigint[];
}) {
  const { setModal } = useModal();

  const { data, isFetching } = useReadContracts({
    contracts: circleIds.map((circleId) => ({
      abi: automaticSavingCirclesAbi,
      address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
      functionName: "isAutomaticClaimsEnabled" as const,
      args: [circleId, address] as const,
      chainId: getDefaultChainId(),
    })),
    query: { enabled: circleIds.length > 0 },
  });

  if (circleIds.length === 0) return null;

  const enabledByIndex = circleIds.map(
    (_, i) => data?.[i]?.status === "success" && data[i].result === true
  );
  const allEnabled = enabledByIndex.every(Boolean);

  const onToggle = () => {
    const target = !allEnabled;
    // Only touch stacks whose current state differs from the target.
    const toChange = circleIds.filter((_, i) => enabledByIndex[i] !== target);
    if (toChange.length === 0) return;
    setModal({
      type: "AUTOMATIC_CLAIMS_ALL",
      circleIds: toChange,
      enabling: target,
    });
  };

  return (
    <label className="flex items-center gap-2">
      <Body className="text-surface-grey">Auto-claim all</Body>
      <Switch
        id="account-automatic-claims"
        checked={allEnabled}
        disabled={isFetching}
        onCheckedChange={onToggle}
      />
    </label>
  );
}
