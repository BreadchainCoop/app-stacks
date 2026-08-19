"use client";

import { Switch } from "@/components/switch";
import { useModal } from "@/components/modal/context";
import { useAccountAutoClaimsState } from "@/hooks/use-account-auto-claims-state";
import { Body } from "@breadcoop/ui";
import { Address } from "viem";

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
  const { enabledByIndex, allEnabled, isFetching } = useAccountAutoClaimsState(
    address,
    circleIds
  );

  if (circleIds.length === 0) return null;

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
