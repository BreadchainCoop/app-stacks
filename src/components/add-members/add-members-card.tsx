"use client";

import { useState } from "react";
import { Address } from "viem";
import { useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { Body, Heading3 } from "@breadcoop/ui";
import { PlusIcon, XIcon } from "@phosphor-icons/react";
import Input from "@/components/input";
import { Label } from "@/components/label";
import LocalButton from "@/components/button";
import Loading from "@/app/loading";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { useResolveInvitee } from "@/hooks/use-resolve-invitee";
import { parseContractError } from "@/utils/parse-contract-error";
import { formatAddress } from "@/utils/address";

const ADD_MEMBERS_ERRORS: Record<string, string> = {
  NotOwner: "Only the Stack creator can add members.",
  AlreadyActive: "This Stack has already started.",
  AlreadyMember: "One of these addresses is already a member.",
  InvalidMemberCount: "Too many members for this Stack.",
  InvalidMemberAddress: "One of these addresses is invalid.",
  NotCommissioned: "This Stack does not exist.",
};

type PendingMember = {
  address: Address;
  label: string;
  warning: boolean;
};

/**
 * Owner-only, signing-free member invites: resolve an ENS name (on Ethereum
 * mainnet) or paste an address, then add everyone in one addMembers
 * transaction. Replaces signed invite links where EIP-712 isn't available
 * (MiniPay) — the contract authorizes by msg.sender == circle owner.
 */
const AddMembersCard = ({
  circleId,
  onAdded,
}: {
  circleId: bigint;
  onAdded?: () => void;
}) => {
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<PendingMember[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState<Address | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const queryClient = useQueryClient();

  const resolved = useResolveInvitee(input);

  const { data: members } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "getCircleMembers",
    args: [circleId],
    chainId: getDefaultChainId(),
  });

  const { data: maxMembers } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "MAX_MEMBERS",
    args: [],
    chainId: getDefaultChainId(),
  });

  const { data: circle } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "getCircle",
    args: [circleId],
    chainId: getDefaultChainId(),
  });

  const memberCount = members?.length ?? 0;
  const slotsLeft =
    maxMembers !== undefined
      ? Number(maxMembers) - memberCount - pending.length
      : null;

  const resolvedAddress = resolved.data?.address ?? null;
  const alreadyQueued =
    resolvedAddress !== null &&
    (pending.some(
      (p) => p.address.toLowerCase() === resolvedAddress.toLowerCase()
    ) ||
      (members ?? []).some(
        (m) => m.toLowerCase() === resolvedAddress.toLowerCase()
      ));

  // A contract on Ethereum mainnet is almost certainly uncontrolled on Celo,
  // so a payout pushed to it would be lost — hard-block it.
  const isBlocked = resolved.data?.isContractOnMainnet ?? false;

  const canQueue =
    resolvedAddress !== null &&
    !alreadyQueued &&
    !isBlocked &&
    (slotsLeft === null || slotsLeft > 0);

  const queueMember = () => {
    if (!resolvedAddress || !canQueue || !resolved.data) return;

    setPending((prev) => [
      ...prev,
      {
        address: resolvedAddress,
        label: resolved.data.ensName ?? formatAddress(resolvedAddress),
        // Unused-on-Celo is a soft warning; the member can still be valid
        warning: resolved.data.isUnusedOnChain,
      },
    ]);
    setInput("");
    setError(null);
  };

  const removeQueued = (address: Address) => {
    setPending((prev) => prev.filter((p) => p.address !== address));
  };

  // Everyone except the owner can be removed on-chain before the circle
  // starts (the contract rejects removing the owner), so filter by owner
  // rather than assuming they are still at index 0.
  const owner = circle?.owner;
  const existingMembers = owner
    ? (members ?? []).filter((m) => m.toLowerCase() !== owner.toLowerCase())
    : [];

  const removeExistingMember = async (address: Address) => {
    if (removing) return;
    setRemoving(address);
    setError(null);

    try {
      await sendSavingCirclesTx({
        functionName: "removeMember",
        args: [circleId, address],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      onAdded?.();
    } catch (err) {
      console.error("removeMember failed:", err);
      setError(
        parseContractError(
          err,
          ADD_MEMBERS_ERRORS,
          "Failed to remove member. Please try again."
        )
      );
    } finally {
      setRemoving(null);
    }
  };

  const submit = async () => {
    if (pending.length === 0 || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await sendSavingCirclesTx({
        functionName: "addMembers",
        args: [circleId, pending.map((p) => p.address)],
      });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      setPending([]);
      onAdded?.();
    } catch (err) {
      console.error("addMembers failed:", err);
      setError(
        parseContractError(
          err,
          ADD_MEMBERS_ERRORS,
          "Failed to add members. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 border border-paper-1 bg-paper-0 p-6">
      <div>
        <Heading3 className="text-2xl">Add members</Heading3>
        <Body className="text-surface-grey">
          Add members by wallet address or ENS name. They become members
          immediately — no invite link needed.
        </Body>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="invitee">Wallet address or ENS name</Label>
        <div className="flex gap-2">
          <Input
            id="invitee"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0x… or name.eth"
            className="w-full font-normal text-surface-ink"
          />
          <LocalButton
            type="button"
            variant="secondary"
            onClick={queueMember}
            disabled={!canQueue}
            leftIcon={<PlusIcon size={16} />}
          >
            Add
          </LocalButton>
        </div>

        {resolved.isLoading && (
          <Body className="text-xs text-surface-grey">Resolving…</Body>
        )}
        {resolved.data?.error && (
          <Body className="text-xs text-system-red">{resolved.data.error}</Body>
        )}
        {resolvedAddress && resolved.data?.ensName && (
          <Body className="text-xs text-surface-grey">
            {resolved.data.ensName} → {formatAddress(resolvedAddress)}
            {resolved.data.usedChainRecord ? " (Celo address)" : ""}
          </Body>
        )}
        {alreadyQueued && (
          <Body className="text-xs text-system-warning">
            This address is already a member or in the list below.
          </Body>
        )}
        {isBlocked && (
          <Body className="text-xs text-system-red">
            This name points to a smart-contract wallet on Ethereum that does
            not exist on Celo — funds sent to it would be lost. Ask the person
            for their Celo wallet address instead.
          </Body>
        )}
        {!isBlocked && resolved.data?.isUnusedOnChain && (
          <Body className="text-xs text-system-warning">
            This wallet has never been used on Celo. Double-check it&apos;s the
            right address before adding.
          </Body>
        )}
      </div>

      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          {pending.map((member) => (
            <div
              key={member.address}
              className="flex items-center justify-between border border-paper-2 bg-paper-1 px-3 py-2"
            >
              <div>
                <Body bold className="text-surface-ink">
                  {member.label}
                </Body>
                {member.warning && (
                  <Body className="text-xs text-system-warning">
                    Never used on Celo — double-check the address
                  </Body>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeQueued(member.address)}
                aria-label={`Remove ${member.label}`}
                className="text-surface-grey hover:text-system-red"
              >
                <XIcon size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      {existingMembers.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-paper-2 pt-4">
          <Body className="text-surface-grey">Members added</Body>
          {existingMembers.map((address) => (
            <div
              key={address}
              className="flex items-center justify-between px-1"
            >
              <Body className="text-surface-ink">{formatAddress(address)}</Body>
              <button
                type="button"
                onClick={() => removeExistingMember(address)}
                disabled={removing !== null}
                aria-label={`Remove ${formatAddress(address)}`}
                className="text-xs font-bold text-surface-grey hover:text-system-red disabled:opacity-50"
              >
                {removing === address ? "Removing…" : "Remove"}
              </button>
            </div>
          ))}
        </div>
      )}

      {slotsLeft !== null && slotsLeft <= 0 && (
        <Body className="text-xs text-system-warning">
          This Stack has reached the maximum number of members.
        </Body>
      )}
      {error && <Body className="text-sm text-system-red">{error}</Body>}

      <LocalButton
        type="button"
        onClick={submit}
        disabled={pending.length === 0 || submitting}
        className="w-full font-bold"
      >
        {submitting ? (
          <span className="flex items-center justify-center">
            <Loading />
          </span>
        ) : pending.length > 1 ? (
          `Add ${pending.length} members`
        ) : (
          "Add member"
        )}
      </LocalButton>
    </section>
  );
};

export default AddMembersCard;
